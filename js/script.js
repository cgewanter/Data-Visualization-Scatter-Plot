/* eslint-disable no-console */

var colHeaders;
var dataSize;
var mdChoices =[];
var hoverText =[];
var map;

var xOption;
var yOption;
var zOption;

//Set up Metadata options hover checklist and x, y, z axes menu
Plotly.d3.csv('data.csv', function(csv){

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
        var numOptions = [];
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
    }

});  //end metadata box display method

//           *   *   *   *   *   *
//call a function to set up the graph
Plotly.d3.csv('data.csv', function(err, rows){

    console.log("orig rows", rows);
    console.log("access col headers in method", colHeaders);

    function unpack(rows, key){
        return rows.map(function(row){
            return row[key];
        });
    }
    //unpack all of the data into a map
    map = new Map();
    for(var j=0; j<colHeaders.length; j++){
        var key = colHeaders[j];
        var value = unpack(rows, key); 
        dataSize = value.length;
        map.set(key, value);
    }
    console.log("map", map);             

    //use the above defined unpack function to populate arrays with the data

    //Put empty string as current hoverText to avoid 'undefined'
    for (var i =0; i<dataSize; i++){
        hoverText[i] ="";
    } 

    hoverText = getHovText();

    console.log("hoverText after method call", hoverText);

    //instantiate an array with the columnHeaders of numeric fields
    var numFields =[];
    for (var i=0; i<colHeaders.length; i++){
        var array = map.get(colHeaders[i]);
        console.log("array " + i, array );
        if (!isNaN(array[0])){
            numFields.push(colHeaders[i]);
        }
    }
    console.log("numFields array", numFields);

    //start the graph out with the first 3 numeric fields available
    xOption = numFields[0];
    yOption = numFields[1];
    zOption = numFields[2];

    //set the radio buttons selected to correct ones
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


    var trace1 = {
        x: map.get(xOption), 
        y: map.get(yOption),  
        z: map.get(zOption),
        name: 'x-name',
        text:  [map.get('id'), map.get('names')],
        textposition: 'top center',
        mode: 'markers',
        type: 'scatter3d',
        hoverinfo: "x+y+z+text",
        hovertext: hoverText
    };
    var data = [trace1];

    var layout = {
        autosize: false,
        width: 1000,
        height: 600,
        xaxis: {
            title: 'x-title',
            automargin: true
        },
        margin:{
            l:20,
            r:0,
            b:20,
            t:30
        },
        title: 'Chart Title'
    };
    Plotly.newPlot('graphDiv', data, layout);
});


document.getElementById("xyzBtn").onclick=function(){onClickXYZ()};

function onClickXYZ(){
    var xBtns = document.getElementsByName("xaxis");
    xBtns.forEach(function(x){
        if (x.checked){
            xOption = x;
            console.log("x", x);
            console.log("xOption",xOption.value);
            console.log(map.get(xOption.value));
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
    
    var update = {x: [map.get(xOption.value)],
                  y: [map.get(yOption.value)],
                  z: [map.get(zOption.value)]
                 };
    Plotly.restyle(graphDiv, update);
}

document.getElementById("apply").onclick= function(){onClickApply()};

function onClickApply(){
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
    console.log("checked: " + mdChoices);

    hoverText = getHovText();
    console.log("hoverText", hoverText);

    var update = {
        hovertext: hoverText
    }
    console.log("mdChoices", mdChoices);
    //Plotly.restyle(graphDiv, update);
}

function getHovText(){
    //clear out hoverText so does not contain all prev data
    //Put empty string as current hoverText to avoid 'undefined'
    for (var i =0; i<dataSize; i++){
        hoverText[i] ="";
    } 

    //outer and inner loop to populate the hovertext
    //outer: goes through each data point
    //inner: goes through each field (x, y, z, ... name ... etc)
    for(var i=0; i<dataSize; i++){
        var key;
        var iter = map.keys();

        for (var j=0; j<mdChoices.length; j++){
            var header = mdChoices[j];
            var array = map.get(header);
            hoverText[i] += header + ": " + array[i] +  '<br>';
        }
    }
    console.log("hoverText in method", hoverText);
    return hoverText;
}