
//var filename = 'https://raw.githubusercontent.com/plotly/datasets/master/3d-scatter.csv';

//filename = 'data.csv';

var colHeaders;
var dataSize;
var mdChoices =[];
var hoverText =[];
var wHovertext =[];
var map;

var xOption;
var yOption;
var zOption;

var traceChoice = "all-data";
var traceMap = new Map();
var origMap;
var keys = [];
var prevSize;
var annots;

function onClickFileGo(){
    var theFile = document.getElementById("file-input").value;
    console.log("theFile", theFile);
    setUpMenus();
    setUpGraph();
    var menus = document.getElementsByClassName("menuouterbox");
    for(var i=0; i< menus.length; i++){
        menus[i].style.display="inline-block";
    }
    //document.getElementById("annotDiv").style.display="inline-block";
}

function onClickOpenFile(){
    var fileInput = document.getElementById("file-input");
    fileInput.click();
    fileInput.addEventListener('change', showfileName);
    console.log("open file clicked. fileInput: " , fileInput);

    function showfileName(event){
        var inputVal = event.srcElement;
        var fileName = inputVal.files[0].name;
        document.getElementById("fileNameSpan").innerHTML = "&nbsp" + fileName;
        filename = fileName;
    }
}

function setUpMenus(){
    //Set up hover checklist and x, y, z axes menu, and trace menu
    Plotly.d3.csv(filename, function(csv){

        console.log("csv", csv);

        csv.forEach(function(row){
            colHeaders = Object.keys(row);
        });
        console.log("colHeaders", colHeaders);

        var theHovDiv = document.getElementById("hoverlist");
        var xMenu = document.getElementById("x-select");
        var yMenu = document.getElementById("y-select");
        var zMenu = document.getElementById("z-select");
        var traceMenu = document.getElementById("trace-select");

        function clearDiv(div){
            //clear out the theHovDiv
            while(div.firstChild){
                div.removeChild(div.firstChild);
            }
        }
        //clear out all the divs from any previous data
        var divArray = [theHovDiv, xMenu, yMenu, zMenu, traceMenu];
        divArray.forEach(function(div){
            clearDiv(div);
        });

        //add -select- option to top of traceMenu
        var selectOpt = document.createElement("option");
        selectOpt.selected = true;
        selectOpt.value="all-data";
        selectOpt.innerHTML="-none-";
        traceMenu.appendChild(selectOpt);

        //clear out mdChoices array
        mdChoices =[];

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

    });  //end setting up menu method
}
//           *   *   *   *   *   *
//call a function to set up the graph

function setUpGraph(){
    Plotly.d3.csv(filename, function(err, rows){
        function unpack(rows, key){
            return rows.map(function(row){
                return row[key];
            });
        }
        //unpack all of the data into a map (using above-defined unpack function)
        map = new Map();
        for(var j=0; j<colHeaders.length; j++){
            var key = colHeaders[j];
            var value = unpack(rows, key); 
            dataSize = value.length;
            map.set(key, value);
        }
        console.log("map", map);    

        //first time - put all data into traceMap as one trace with "all-data" as the key
        traceMap = new Map();
        traceMap.set("all-data", map);
        keys.push("all-data");
        console.log("orig traceMap", traceMap);
        origMap = traceMap;
        console.log("origMap/traceMap", origMap);

        //instantiate an array with the columnHeaders of numeric fields
        var numFields =[];
        for (var k=0; k<colHeaders.length; k++){
            var array = map.get(colHeaders[k]);
            //console.log("array " + k, array );
            if (!isNaN(array[0])){
                numFields.push(colHeaders[k]);
            }
        }
        console.log("numFields array", numFields);

        //start the graph out with the first 3 numeric fields available
        var xInit = numFields[0];
        var yInit = numFields[1];
        var zInit = numFields[2];

        //set the right options selected in axes dropdowns
        var xOpts = document.getElementById("x-select").children;
        for(var i=0; i<xOpts.length; i++){
            if(xOpts[i].value == xInit){
                xOpts[i].selected =true;
            }
        }
        var yOpts = document.getElementById("y-select").children;
        for(var j=0; j<yOpts.length; j++){
            if (yOpts[j].value == yInit){
                yOpts[j].selected =true;
            }
        }
        var zOpts = document.getElementById("z-select").children;
        for(var k=0; k<zOpts.length; k++){
            if(zOpts[k].value== zInit){
                zOpts[k].selected=true;
            }
        }

        //Put empty string as current hoverText to avoid 'undefined'
        for (var i =0; i<dataSize; i++){
            hoverText[i] = "";
        } 
        //get the hovertext (right now only works for first initial graph with one trace
        wHoverText = getHoverText();
        console.log("wHoverText", wHovertext);

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
        Plotly.newPlot('graphDiv', data, layout).then(g=> setUpAnot());



    }); //end csv method
} //end setupgraph method

function setUpAnot(){
    var theGraphDiv = document.getElementById("graphDiv");

    annots= [];
    //the onClick function for annotations
    var counter =0;
    theGraphDiv.removeAllListeners('plotly_click');
    theGraphDiv.on("plotly_click", function(data){

        counter++;
        console.log("clicked", counter);

        //set a timeout to avoid recursive action bug with select in scatter3d
        setTimeout(anotFunc, 100);
        function anotFunc(){
            console.log("annots onclick", annots);
            console.log("data.points", data.points);
            var point = data.points[0];
            console.log("point", point);

            //check if the point is already in the annots array with visible: false
            var found = false;
            annots.forEach(function(a){
                if(point.x === a.x && point.y === a.y && point.z === a.z){
                    console.log("found an existing annotation");
                    a.visible = true;
                    found = true;
                }
            });

            if(!found){
                anotText = point.hovertext;
                console.log("anotText", anotText);
                var ptColor = point.fullData.marker.color;

                var annotation = {
                    text: anotText,
                    textangle: 0,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    bordercolor: ptColor,
                    borderwidth: 2,
                    arrowcolor: "black",
                    arrowwidth: 2,
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    ax: 0,
                    ay: -50,
                    captureevents: true
                }

                var flag = false;
                if (annots.length > 0){
                    annots.forEach(function(a){
                        if (a.x === annotation.x && a.y === annotation.y && a.z === annotation.z){
                            console.log("duplicate " + a.text);
                            flag = true;
                        }
                    });
                    if (!flag){
                        console.log("adding " + annotation.text);
                        annots.push(annotation);
                    }
                }
                else{
                    console.log("empty annots, adding " + annotation.text);
                    annots.push(annotation);
                }
            } //end if !found

            console.log("layout", theGraphDiv.layout);
            console.log("annots after push", annots);
            Plotly.relayout("graphDiv", {'scene.annotations': annots});
        } //end anotFunc
    }); //end on(plotly_click)

    theGraphDiv.on("plotly_clickannotation",function(data){
        console.log("annotation clicked");
        console.log("data", data);
        data.annotation.visible = false;
        Plotly.relayout("graphDiv", {'scene.annotations': annots});
    }); //end on(plotly_clickannotation)
}//end setUpAnot function

//document.getElementById("applyAll").onclick=function(){onClickApplyAll()};

document.getElementById("xyzBtn").onclick=function(){onClickXYZ()};

document.getElementById("hoverBtn").onclick= function(){onClickHover()};

document.getElementById("traceBtn").onclick= function(){onClickTraceBtn()};

document.getElementById("titleBtn").onclick=function(){onClickTitleBtn()};

document.getElementById("fileOpenBtn").onclick=function(){onClickOpenFile()};

document.getElementById("goFileBtn").onclick=function(){onClickFileGo()};

//document.getElementById("clearAnnBtn").onclick=function(){clearAnnotations()};


function getXAxisSelection(){

    var x = document.getElementById("x-select");
    xOption = x.options[x.selectedIndex].value;
    return xOption;
}
function getYAxisSelection(){
    var z = document.getElementById("y-select");
    yOption = z.options[z.selectedIndex].value;
    return yOption;
}
function getZAxisSelection(){
    var z = document.getElementById("z-select");
    zOption = z.options[z.selectedIndex].value;
    return zOption;
}

function onClickXYZ(){

    xOption = getXAxisSelection();
    yOption = getYAxisSelection();
    zOption = getZAxisSelection();

    console.log("traceMap", traceMap);

    var hoverText = getHoverText();

    var newTraces =[];
    traceMap.forEach(function(value, key, map){
        console.log("try:" , traceMap.get(key).get(xOption));
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
        console.log("theTrace", theTrace);
        newTraces.push(theTrace);
    });
    console.log("traces", newTraces);
    console.log("prevSize", traceMap.size);
    var delArray=[];
    for (var t=0; t<traceMap.size; t++){
        delArray.push(t);
    }
    //clear annotations from previous graph
    clearAnnotations();

    console.log("about to redo graph");
    console.log("delArray", delArray);
    Plotly.deleteTraces("graphDiv", delArray);
    Plotly.addTraces("graphDiv", newTraces);

    var layoutUpdate ={
        'scene.xaxis.title': xOption,
        'scene.yaxis.title': yOption,
        'scene.zaxis.title': zOption
    }; 
    Plotly.relayout("graphDiv", layoutUpdate);
}

function onClickHover(){
    //clear out the mdChoices array so can start over from what is checked now
    mdChoices =[];
    var mdList = document.getElementById("hoverlist");
    var options = mdList.children;
    for(var i =0; i<options.length; i++){
        if (options[i].checked){
            if (!mdChoices.includes(options[i].value)){
                mdChoices.push(options[i].value);
            }
        }
    }
    console.log("checked hover choices:", mdChoices);

    hoverText = getHoverText();
    console.log("hoverText", hoverText);

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
            hovertext: hoverText.get(key),
            opacity: 0.4
        }
        console.log("theTrace", theTrace);
        newTraces.push(theTrace);
    });
    console.log("traces", newTraces);
    console.log("prevSize", traceMap.size);
    var delArray=[];
    for (var t=0; t<traceMap.size; t++){
        delArray.push(t);
    }
    console.log("about to redo graph");
    console.log("delArray", delArray);
    Plotly.deleteTraces("graphDiv", delArray);
    Plotly.addTraces("graphDiv", newTraces);
}

function onClickTraceBtn(){
    keys =[];
    prevSize =1;
    try{
        prevSize = traceMap.size;
    }
    catch(err){
        console.log(err.message);
    }

    var checked= false;

    //save the chosen field in traceChoice variable
    var trc = document.getElementById("trace-select");
    traceChoice = trc.options[trc.selectedIndex].value;

    if (traceChoice != "all-data"){
        checked = true;
    }
    console.log("traceChoice", traceChoice);

    console.log("ANYTHING SELECTED: " , checked);

    if (!checked){
        traceMap = origMap;
        console.log("none checked. tracemap: ", traceMap);
    }

    else{
        //make an array of all the different values in that field
        var allVals = map.get(traceChoice);
        var uniqueVals =[];
        console.log("allVals", allVals);
        allVals.forEach(function(val){
            if (!uniqueVals.includes(val)){
                uniqueVals.push(val);
            }
        });
        console.log("uniqueVals", uniqueVals);

        //instantiate the new Map that will have each unique val as a key:
        traceMap = new Map();
        console.log("TRACEMAP-BEFORE", traceMap);

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
                    var allXs = map.get(colHeaders[i]);
                    //console.log("allXs",allXs);
                    //for each value in this column header
                    for(var x=0; x<allXs.length; x++){
                        //console.log("allVals[i] vs val", allVals[x] + " vs " + val);
                        //if the value at this header is the same as val, push the x-value onto the inner array
                        if (allVals[x]==val){
                            innerArray.push(allXs[x]);
                        }
                    }
                    //console.log("innerArray" + i, innerArray);
                    //put this new filtered array into the map with the col header as key
                    innerMap.set(colHeaders[i], innerArray);
                };
                //console.log("innerMap", innerMap);  
                //put the inner map as a value into the big outer map
                traceMap.set(val, innerMap);
                keys.push(val);
            }
        );
        console.log("traceMap", traceMap);
        console.log("keys", keys);
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

    theKeys.forEach(function(val){
        console.log("xOption", xOption);
        console.log("traceMap.get(val).get(x): ", traceMap.get(val).get(xOption));

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
    console.log("traces: " , traces);
    var data = traces;
    var delArray = [0];
    console.log("prevSize", prevSize);
    for (var t=1; t<prevSize; t++){
        delArray.push(t);
    }
    console.log("delArray", delArray);
    Plotly.deleteTraces("graphDiv", delArray);
    Plotly.addTraces("graphDiv", traces);
}

function getHoverText(){
    wHoverText = new Map();
    traceMap.forEach(function(value, key, map){
        console.log("in traceMap.forEach");
        console.log("trace:", key);
        console.log("value: ", value);
        console.log("map: ", map);

        htArray = getInnerHovText(key);
        //console.log("htArray for " +key, htArray);
        wHoverText.set(key, htArray);
    });
    //console.log("wHoverText", wHoverText);
    return wHoverText;
}

function getInnerHovText(key){
    console.log("in inner ht method");
    //clear out hoverText so does not contain all prev data
    //Put empty string as current hoverText to avoid 'undefined'
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

function onClickTitleBtn(){
    var tElem = document.getElementById("titleInput");
    var newTitle = tElem.value;
    console.log("title", newTitle);
    var update = {
        title: newTitle
    }
    Plotly.relayout("graphDiv", update);
}

function clearAnnotations(){
    annots =[];
    Plotly.relayout("graphDiv", {'scene.annotations':[]});
}
