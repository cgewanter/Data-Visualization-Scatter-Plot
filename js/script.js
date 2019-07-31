/* eslint-disable no-alert, no-console */

//var filename = 'https://raw.githubusercontent.com/plotly/datasets/master/3d-scatter.csv';

var filename = 'data.csv';

var colHeaders;
var dataSize;
var mdChoices =[];
var hoverText =[];
var wHovertext =[];
var map;

var xOption;
var yOption;
var zOption;

var traceChoice;
var traceMap = new Map();
var keys = [];

//Set up hover checklist and x, y, z axes menu, and trace menu
Plotly.d3.csv(filename, function(csv){

    console.log("csv", csv);

    csv.forEach(function(row){
        colHeaders = Object.keys(row);
    });
    console.log("colHeaders", colHeaders);

    for(var i=0; i<colHeaders.length; i++){
        //for hover checkboxes options
        var checkBox = document.createElement("input");
        var label = document.createElement("label");
        checkBox.type = "checkbox";
        checkBox.value=colHeaders[i];
        var theDiv = document.getElementById("list");
        theDiv.appendChild(checkBox);
        theDiv.appendChild(label);
        label.appendChild(document.createTextNode(colHeaders[i]));  

        //for x, y, z data choices boxes:
        //filter out colHeaders[] to an array of the numeric options:
        //var numOptions = [];
        /*for (var i=0; i<colHeaders.length; i++){
            if (colHeaders[i])
        }*/

        var xRadio = document.createElement("input");
        var xLabel = document.createElement("label");
        xRadio.type = "radio";
        xRadio.value= colHeaders[i];
        xRadio.name = "xaxis";
        var xMenuDiv = document.getElementById("dataXList");
        xMenuDiv.appendChild(xRadio);
        xMenuDiv.appendChild(xLabel);
        xLabel.appendChild(document.createTextNode(colHeaders[i]));

        var yRadio = document.createElement("input");
        var yLabel = document.createElement("label");
        yRadio.type = "radio";
        yRadio.value= colHeaders[i];
        yRadio.name = "yaxis";
        var yMenuDiv = document.getElementById("dataYList");
        yMenuDiv.appendChild(yRadio);
        yMenuDiv.appendChild(yLabel);
        yLabel.appendChild(document.createTextNode(colHeaders[i]));

        var zRadio = document.createElement("input");
        var zLabel = document.createElement("label");
        zRadio.type = "radio";
        zRadio.value= colHeaders[i];
        zRadio.name ="zaxis";
        var zMenuDiv = document.getElementById("dataZList");
        zMenuDiv.appendChild(zRadio);
        zMenuDiv.appendChild(zLabel);
        zLabel.appendChild(document.createTextNode(colHeaders[i]));

        //color-code traces menu
        var cRadio = document.createElement("input");
        var cLabel = document.createElement("label");
        cRadio.type = "radio";
        cRadio.value = colHeaders[i];
        cRadio.name = "colortrace";
        var traceDiv = document.getElementById("traceList");
        traceDiv.appendChild(cRadio);
        traceDiv.appendChild(cLabel);
        traceDiv.appendChild(document.createTextNode(colHeaders[i]));     
    }
});  //end setting up menu method

//           *   *   *   *   *   *
//call a function to set up the graph
Plotly.d3.csv(filename, function(err, rows){

    console.log("orig rows", rows);
    console.log("access col headers in method", colHeaders);

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
    console.log(traceMap);

    //instantiate an array with the columnHeaders of numeric fields
    var numFields =[];
    for (var k=0; k<colHeaders.length; k++){
        var array = map.get(colHeaders[k]);
        console.log("array " + k, array );
        if (!isNaN(array[0])){
            numFields.push(colHeaders[k]);
        }
    }
    console.log("numFields array", numFields);

    //start the graph out with the first 3 numeric fields available
    xOption = numFields[0];
    yOption = numFields[1];
    zOption = numFields[2];

    //set the radio buttons selected to fields for axes
    var xBtns = document.getElementsByName("xaxis");
    xBtns.forEach(function(x){
        if (x.value == xOption){
            x.checked =true;
        }
    });
    var yBtns = document.getElementsByName("yaxis");
    yBtns.forEach(function(y){
        if (y.value == yOption){
            y.checked =true;
        }
    });
    var zBtns = document.getElementsByName("zaxis");
    zBtns.forEach(function(z){
        if (z.value == zOption){
            z.checked =true;
        }
    });
    console.log("xBtns", xBtns);

    //Put empty string as current hoverText to avoid 'undefined'
    for (var i =0; i<dataSize; i++){
        hoverText[i] = "";
    } 
    //get the hovertext (right now only works for first initial graph with one trace)
    wHoverText = getHoverText();

    //initial starting trace with all data in one trace
    var trace1 = {
        x: map.get(xOption), 
        y: map.get(yOption),  
        z: map.get(zOption),
        name: 'all-data',
        text:  [map.get('id'), map.get('names')],
        textposition: 'top center',
        mode: 'markers',
        type: 'scatter3d',
        hoverinfo: "x+y+z+text",
        hovertext: wHoverText,
        opacity: 0.4
    };
    var data = [trace1];

    var layout = {
        scene:{
            xaxis:{title: xOption},
            yaxis:{title: yOption},
            zaxis:{title: zOption} 
        },
        autosize: false,
        width: 1000,
        height: 600,
        margin:{
            l:20,
            r:0,
            b:20,
            t:30
        },
        title: 'Data Source: ' + filename
    };
    Plotly.newPlot('graphDiv', data, layout);
});

document.getElementById("applyAll").onclick=function(){onClickApplyAll()};

document.getElementById("xyzBtn").onclick=function(){onClickXYZ()};

document.getElementById("hoverBtn").onclick= function(){onClickHover()};

document.getElementById("traceBtn").onclick= function(){onClickTraceBtn()};

function onClickXYZ(){
    var xBtns = document.getElementsByName("xaxis");
    xBtns.forEach(function(x){
        if (x.checked){
            xOption = x;
            console.log("x", x);
            console.log("xOption",xOption.value);
            //console.log(map.get(xOption.value));
        }
    });
    var yBtns = document.getElementsByName("yaxis");
    yBtns.forEach(function(y){
        if (y.checked){
            yOption = y;
            console.log("y", y);
        }
    });
    var zBtns = document.getElementsByName("zaxis");
    zBtns.forEach(function(z){
        if (z.checked){
            zOption =z;
            console.log("z", z);
        }
    });

    //for each trace:
    var xArray=[];
    keys.forEach(function(key){
        //for each column:
        var array =[];

        var t = traceMap.get(key).get(xOption.value);
        console.log("t", t);
        array.push(t);

        console.log("array", array);
        xArray.push(array);
    });
    console.log(xArray);

    var dataUpdate = {
        x: xArray,
        /*y: [map.get(yOption.value)],
        z: [map.get(zOption.value)]*/
    };

    var layoutUpdate = {
        'scene.xaxis.title': xOption.value,
        'scene.yaxis.title': yOption.value,
        'scene.zaxis.title': zOption.value
    };
    //need to use update (vs. restyle or relayout) bec changing the data itself and also the layout(for axes names)
    Plotly.update("graphDiv", dataUpdate, layoutUpdate);
}

function onClickHover(){
    //clear out the mdChoices array so can start over from what is checked now
    mdChoices =[];
    var mdList = document.getElementById("list");
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
    var counter =0;

    traceMap.forEach(function(value, key, map){
        console.log("in foreach, hoverText for " + key, hoverText.get(key));
        var update = {
            hovertext: hoverText.get(key)
        }
        console.log("current key", key);
        console.log("counter rt before restyle: " , counter);
        console.log("hoverText.get(key)", hoverText.get(key));
        console.log("update: for " + key , update);
        Plotly.restyle("graphDiv", update, counter);
        counter++;
    });
}

function onClickTraceBtn(){
    keys =[];
    var prevSize =1;
    try{
        prevSize = traceMap.size;
    }
    catch(err){
        console.log(err.message);
    }

    //save the chosen field in traceChoice variable
    var trcBtns = document.getElementsByName("colortrace");
    trcBtns.forEach(function(t){
        if(t.checked){
            traceChoice = t.value;
            console.log("traceChoice", traceChoice);
        }
    });
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
                console.log("allXs",allXs);
                //for each value in this column header
                for(var x=0; x<allXs.length; x++){
                    console.log("allVals[i] vs val", allVals[x] + " vs " + val);
                    //if the value at this header is the same as val, push the x-value onto the inner array
                    if (allVals[x]==val){
                        innerArray.push(allXs[x]);
                    }
                }
                console.log("innerArray" + i, innerArray);
                //put this new filtered array into the map with the col header as key
                innerMap.set(colHeaders[i], innerArray);
            };
            console.log("innerMap", innerMap);  
            //put the inner map as a value into the big outer map
            traceMap.set(val, innerMap);
            keys.push(val);
        }
    );
    console.log("traceMap", traceMap);
    console.log("keys", keys);

    //now replot the graph based on the new traces 
    var traces =[];
    var theTrace;
    uniqueVals.forEach(function(val){
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
            hoverinfo: "x+y+z+text",
            hovertext: hoverText,
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
        console.log("htArray for " +key, htArray);
        wHoverText.set(key, htArray);
    });
    console.log("wHoverText", wHoverText);
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
        console.log("innerHover after populate with blank strings", innerHover);

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
        console.log("innerHover for " + key, innerHover);

        //console.log("hoverText in method", hoverText);
        return innerHover;
    }

    function oldGetHoverText(){
        //populate with empty strings

        //for each trace
        for (var j=0; j<traceMap.size; j++){
            var innerArray =[];
            //for each point
            for(var i=0; i<traceMap.get(keys[j]).length; i++){
                innerArray[i]="";
            }
            wHovertext[j] = innerArray;
        }
        //for each trace
        for(var t=0; t<traceMap.length; t++){
            //for each point
            for(var p=0; p<trace.length; p++){
                //for each metadata option selected
                var pointArray =[];
                for (var s=0; s<mdChoices.length; s++){
                    var header = mdChoices[s];
                    var array = traceMap.get(keys[t]).get(header);
                    pointArray[p]+= header + ": " + array[s] + '<br';
                }
                wHoverText[t] = pointArray;
            }                
        }
        console.log("wHovertext", wHovertext);
    }

    /* eslint-enable no-alert, no-console */