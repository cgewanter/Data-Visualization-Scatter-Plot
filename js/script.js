/* 3d-scatter-plot/js/script.js 
    - C. Gewanter
*/

var filename;       
var colHeaders;     
var dataSize;

var mdChoices =[];  
var hoverText =[];

var map;        
var traceChoice = "all-data";
var traceMap = new Map();
var origMap;
var keys = [];
var prevSize;
var annots;

var xOption;
var yOption;
var zOption;

document.getElementById("fileOpenBtn").onclick=function(){onClickOpenFile()};

document.getElementById("goFileBtn").onclick=function(){onClickFileGo()};

document.getElementById("titleBtn").onclick=function(){onClickTitleBtn()};

document.getElementById("xyzBtn").onclick=function(){onClickXYZ()};

document.getElementById("hoverBtn").onclick= function(){onClickHover()};

document.getElementById("traceBtn").onclick= function(){onClickTraceBtn()};

//document.getElementById("clearAnnBtn").onclick=function(){clearAnnotations()};

function onClickOpenFile(){
    //use the input tag's click() function to open a file-picker window.
    var fileInput = document.getElementById("file-input");
    fileInput.click();
    fileInput.addEventListener('change', showfileName);
    console.log("open file clicked. fileInput: " , fileInput);
    console.log("val", fileInput.value);

    //function to show the name of the selected file
    function showfileName(event){
        var inputVal = event.srcElement;
        var name = inputVal.files[0].name;
        document.getElementById("fileNameSpan").innerHTML = "&nbsp" + name;
        filename = name; 
    }
}

function onClickFileGo(){
    //call methods to set up the menus and the graph
    setUpMenus();
    setUpGraph();  
}

function setUpMenus(){

    //Plotly csv function to read data from file
    Plotly.d3.csv(filename, function(csv){
        
        //extract the column headers from the file
        csv.forEach(function(row){
            colHeaders = Object.keys(row);
        });

        var theHovDiv = document.getElementById("hoverlist");
        var xMenu = document.getElementById("x-select");
        var yMenu = document.getElementById("y-select");
        var zMenu = document.getElementById("z-select");
        var traceMenu = document.getElementById("trace-select");

        //clear out all the menu divs from any previous data
        var divArray = [theHovDiv, xMenu, yMenu, zMenu, traceMenu];
        divArray.forEach(function(div){
            clearDiv(div);
        });

        function clearDiv(div){
            //clear out the theHovDiv
            while(div.firstChild){
                div.removeChild(div.firstChild);
            }
        }

        //add '-none-' option to top of traceMenu for a default of no color filter
        var selectOpt = document.createElement("option");
        selectOpt.selected = true;
        selectOpt.value="all-data";
        selectOpt.innerHTML="-none-";
        traceMenu.appendChild(selectOpt);

        //clear out metadata choices array for hovertext
        mdChoices =[];

        //loop through each of the column headers and add it to the menus
        for(var i=0; i<colHeaders.length; i++){

            //for hover options checkboxes:
            var checkBox = document.createElement("input");
            var label = document.createElement("label");
            checkBox.type = "checkbox";
            checkBox.value=colHeaders[i];
            theHovDiv.appendChild(checkBox);
            theHovDiv.appendChild(label);
            theHovDiv.appendChild(label);
            label.appendChild(document.createTextNode(colHeaders[i]));
            theHovDiv.appendChild(document.createElement("br"));

            //for x-, y- and z-axis options
            var xSelect = document.createElement("option");
            xSelect.value= colHeaders[i];
            xSelect.innerHTML = colHeaders[i];
            xMenu.appendChild(xSelect);

            var ySelect = document.createElement("option");
            ySelect.value=colHeaders[i];
            ySelect.innerHTML = colHeaders[i];
            yMenu.appendChild(ySelect);

            var zSelect = document.createElement("option");
            zSelect.value=colHeaders[i];
            zSelect.innerHTML = colHeaders[i];
            zMenu.appendChild(zSelect);

            //color-filter traces menu
            var traceOpt = document.createElement("option");
            traceOpt.value = colHeaders[i];
            traceOpt.innerHTML = colHeaders[i];
            traceMenu.appendChild(traceOpt);
        }

    });  //end setUpMenu function

    //set the menu html elements to display (before file was chosen, they were hidden)
    var menus = document.getElementsByClassName("menuouterbox");
    for(var i=0; i< menus.length; i++){
        menus[i].style.display="inline-block";
    }
    //document.getElementById("annotDiv").style.display="inline-block";
}

function setUpGraph(){

    Plotly.d3.csv(filename, function(err, rows){

        //define the unpack function
        function unpack(rows, key){
            return rows.map(function(row){
                return row[key];
            });
        }

        /* unpack all of the data into a map (using above-defined unpack function)
        key: column header; value: an array of all the data in that column */
        map = new Map();
        for(var j=0; j<colHeaders.length; j++){
            var key = colHeaders[j];
            var value = unpack(rows, key); 
            dataSize = value.length;
            map.set(key, value);
        }

        /* put all data into traceMap as one trace with "all-data" as the key. 
        This traceMap will eventually be reset when a trace-color filter field is picked, 
        where the name of each individual value of the selected field will be the key 
        that maps to all points with that value */

        traceMap = new Map();
        traceMap.set("all-data", map);
        keys.push("all-data");
        origMap = traceMap;

        //set up an array with the column headers of numeric fields
        var numFields =[];
        for (var k=0; k<colHeaders.length; k++){
            var array = map.get(colHeaders[k]); //the array of values in the field's column
            if (!isNaN(array[0])){   //check if the field is numeric based on the first value
                numFields.push(colHeaders[k]); 
            }
        }

        //start the graph out with the first 3 numeric fields available
        var xInit = numFields[0];
        var yInit = numFields[1];
        var zInit = numFields[2];

        //set the pre-selected options for the current x,y,z in the axes dropdowns
        var xOpts = document.getElementById("x-select").children;
        for(var i=0; i<xOpts.length; i++){
            if(xOpts[i].value == xInit){ xOpts[i].selected =true; }
        }
        var yOpts = document.getElementById("y-select").children;
        for(var j=0; j<yOpts.length; j++){
            if (yOpts[j].value == yInit){ yOpts[j].selected =true; }
        }
        var zOpts = document.getElementById("z-select").children;
        for(var k=0; k<zOpts.length; k++){
            if(zOpts[k].value== zInit){ zOpts[k].selected=true; }
        }

        //Put empty string as current hoverText to avoid 'undefined'
        for (var i =0; i<dataSize; i++){
            hoverText[i] = "";
        } 
        //get the hovertext
        wHoverText = getHoverText();

        //initial starting trace with all data in one trace
        var trace1 = {
            x: map.get(xInit), 
            y: map.get(yInit),  
            z: map.get(zInit),
            name: 'all-data',
            mode: 'markers',
            type: 'scatter3d',
            hoverinfo: "text",
            hovertext: wHoverText,
            textposition: "top",
            opacity: 0.4
        };
        var data = [trace1];

        var layout = {
            hovermode: "closest",
            scene:{
                annotations:[],
                xaxis:{title: xInit},
                yaxis:{title: yInit},
                zaxis:{title: zInit}
            },
            autosize: false,
            width: 700,
            height: 600,
            margin:{
                l:10,
                r:0,
                b:20,
                t:30
            },
            title: 'Enter Chart Title on Left',

        };
        Plotly.newPlot('graphDiv', data, layout).then(() => setUpAnot());

    }); //end csv method
} //end setUpGraph method

function setUpAnot(){

    var theGraphDiv = document.getElementById("graphDiv");

    annots= [];
    //the onClick function for annotations
    theGraphDiv.on("plotly_click", function(data){

        //set a timeout to avoid recursive action bug with select in scatter3d
        setTimeout(anotFunc, 100);

        function anotFunc(){

            var point = data.points[0]; //capture the selected point

            //if the point is already in the annots array, set its visibility to true
            var found = false;
            annots.forEach(function(a){
                if(point.x === a.x && point.y === a.y && point.z === a.z){
                    a.visible = true;
                    found = true;
                }
            });

            //if there is not yet an annotation, create one
            if(!found){
                anotText = point.hovertext; //use hovertext for annotation text
                console.log("anotText", anotText);
                var ptColor = point.fullData.marker.color;

                var annotation = {
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    text: anotText,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    bordercolor: ptColor,
                    borderwidth: 2,
                    arrowcolor: "black",
                    arrowwidth: 2,
                    ax: 0,
                    ay: -50,
                    captureevents: true 
                }

                annots.push(annotation); 

            } //end if !found

            Plotly.relayout("graphDiv", {'scene.annotations': annots});
        } //end anotFunc
    }); //end on(plotly_click)

    theGraphDiv.on("plotly_clickannotation",function(data){

        data.annotation.visible = false;
        Plotly.relayout("graphDiv", {'scene.annotations': annots});

    }); //end on(plotly_clickannotation)

}//end setUpAnot function

function onClickTitleBtn(){
    var newTitle = document.getElementById("titleInput").value;
    Plotly.relayout("graphDiv", {title: newTitle});
}

function getXAxisSelection(){
    var x = document.getElementById("x-select");
    return x.options[x.selectedIndex].value;
}
function getYAxisSelection(){
    var y = document.getElementById("y-select");
    return y.options[y.selectedIndex].value;
}
function getZAxisSelection(){
    var z = document.getElementById("z-select");
    return z.options[z.selectedIndex].value;
}

function onClickXYZ(){

    xOption = getXAxisSelection();
    yOption = getYAxisSelection();
    zOption = getZAxisSelection();

    var hoverText = getHoverText();

    //set up new traces
    var newTraces =[];

    traceMap.forEach(function(value, key, map){
        var theTrace ={
            x: traceMap.get(key).get(xOption),
            y: traceMap.get(key).get(yOption),
            z: traceMap.get(key).get(zOption),
            name: key,
            mode: 'markers',
            type: 'scatter3d',
            hoverinfo: "text",
            hovertext: hoverText.get(key),
            opacity: 0.4
        }
        newTraces.push(theTrace);
    });

    //clear annotations from previous graph
    clearAnnotations();

    //delete previous traces
    var delArray=[];
    for (var t=0; t<traceMap.size; t++){
        delArray.push(t);
    }

    Plotly.deleteTraces("graphDiv", delArray);
    Plotly.addTraces("graphDiv", newTraces);

    //reset axis titles based on new x,y,z
    var layoutUpdate ={
        'scene.xaxis.title': xOption,
        'scene.yaxis.title': yOption,
        'scene.zaxis.title': zOption
    }; 
    Plotly.relayout("graphDiv", layoutUpdate);
}

function onClickHover(){

    //clear out previous metadata choices
    mdChoices =[];

    //get a list of currently checked choices
    var options = document.getElementById("hoverlist").children;
    for(var i =0; i<options.length; i++){
        if (options[i].checked){
            if (!mdChoices.includes(options[i].value)){
                mdChoices.push(options[i].value);
            }
        }
    }

    hoverText = getHoverText(); //retrieve the hoverText map

    xOption = getXAxisSelection();
    yOption = getYAxisSelection();
    zOption = getZAxisSelection();

    var newTraces =[];
    traceMap.forEach(function(value, key, map){
        var theTrace ={
            x: traceMap.get(key).get(xOption),
            y: traceMap.get(key).get(yOption),
            z: traceMap.get(key).get(zOption),
            name: key,
            mode: 'markers',
            type: 'scatter3d',
            hoverinfo: "text",
            hovertext: hoverText.get(key), //for each trace, get the array of text from the map
            opacity: 0.4
        }
        newTraces.push(theTrace);
    });

    //delete previous traces
    var delArray=[];
    for (var t=0; t<traceMap.size; t++){
        delArray.push(t);
    }

    clearAnnotations(); //clear all previous annotations

    Plotly.deleteTraces("graphDiv", delArray);
    Plotly.addTraces("graphDiv", newTraces);
}

function onClickTraceBtn(){

    prevSize = traceMap.size;

    var checked= true;

    //save the selected trace field
    var trc = document.getElementById("trace-select");
    traceChoice = trc.options[trc.selectedIndex].value;

    //if no filter, use original map
    if (traceChoice === "all-data"){
        traceMap = origMap;
        checked = false;
    }

    else{
        //make an array of all the unique values in that field
        var allVals = map.get(traceChoice);
        var uniqueVals =[];
        allVals.forEach(function(val){
            if (!uniqueVals.includes(val)){
                uniqueVals.push(val);
            }
        });

        //instantiate the new Map that will have each unique val as a key:
        traceMap = new Map();

        //for each unique value (=each trace)
        var innerMap;
        uniqueVals.forEach(
            function(val){
                innerMap = new Map(); //map where each colHeader is key and its values are the value
                //for each column header: filter the array into a new array
                var innerArray =[];
                for(var i=0; i<colHeaders.length; i++){
                    //clear out the inner array
                    innerArray=[];
                    var allFieldVals = map.get(colHeaders[i]);
                    //for each value in this array
                    for(var x=0; x<allFieldVals.length; x++){
                        //if the value at this header is the same the unique val, push the x-value onto the inner array
                        if (allVals[x]==val){
                            innerArray.push(allFieldVals[x]);
                        }
                    }
                    //put this new filtered array into the map with the col header as key
                    innerMap.set(colHeaders[i], innerArray);
                };
                //put the inner map as a value into the big outer map
                traceMap.set(val, innerMap);
                keys.push(val);
            }
        );
    }

    //now replot the graph based on the new traces 
    var traces =[];
    var theTrace;

    hoverText = getHoverText();

    xOption = getXAxisSelection();
    yOption = getYAxisSelection();
    zOption = getZAxisSelection();

    var theKeys=[];
    if (checked){ theKeys = uniqueVals;}
    else {theKeys.push("all-data");} 

    //set up a trace for each key
    theKeys.forEach(function(val){

        theTrace = {
            x: traceMap.get(val).get(xOption),
            y: traceMap.get(val).get(yOption),
            z: traceMap.get(val).get(zOption),
            name: val,
            text:  [traceMap.get(val), map.get('names')],
            textposition: 'top center',
            mode: 'markers',
            type: 'scatter3d',
            hoverinfo: "text",
            hovertext: hoverText.get(val),
            opacity: 0.4
        };
        traces.push(theTrace);
    });

    //delete previous traces
    var delArray = [0];
    for (var t=1; t<prevSize; t++){
        delArray.push(t);
    }
    Plotly.deleteTraces("graphDiv", delArray);
    Plotly.addTraces("graphDiv", traces);
}

function getHoverText(){
    wHoverText = new Map();
    traceMap.forEach(function(value, key, map){

        htArray = getInnerHovText(key);
        //console.log("htArray for " +key, htArray);
        wHoverText.set(key, htArray);
    });
    //console.log("wHoverText", wHoverText);
    return wHoverText;
}

function getInnerHovText(key){
    console.log("in inner ht method");

    var innerMap = traceMap.get(key);
    console.log("inner map", innerMap);

    var innerHover =[];

    for (var i =0; i<innerMap.get(colHeaders[0]).length; i++){
        innerHover[i] ="";
    } 
    //console.log("innerHover after populate with blank strings", innerHover);

    //outer and inner loop to populate the hovertext
    //outer: goes through each data point
    //inner: goes through each field (x, y, z, ... name ... etc)

    //for each point
    for(var m=0; m<innerMap.get(colHeaders[0]).length; m++){
        //for each md choice
        for (var j=0; j<mdChoices.length; j++){
            var header = mdChoices[j];
            var array = innerMap.get(header);
            innerHover[m] += header + ": " + array[m] +  '<br>';
        }
    }
    //console.log("innerHover for " + key, innerHover);

    //console.log("hoverText in method", hoverText);
    return innerHover;
}

/*the following function contains the code for the 'Clear-Annotations' button */ 
function clearAnnotations(){
    annots =[];
    Plotly.relayout("graphDiv", {'scene.annotations':[]});
}

