
let requireConstraintsFcaIterable  =[];
let exclusionConstraintsFcaIterable  =[];
let dataRequireConstraintsFpGrowth  =[];

const Colors =['#ff4d4d', '#18dcff', '#ffaf40', '#fffa65', '#32ff7e','#7efff5','#7d5fff','#cd84f1','#ffcccc','#f7aef8'];
const table = document.getElementById("table");
const table2 = document.getElementById("table2");  
const fca = document.getElementById("fca");
const fpGrowth = document.getElementById("fpGrowth");

const vardy = document.getElementById("vardy");
var bloc = document.getElementById("blocMenu");
let iterable = new Map() ;
let listOfBlocks = new Map() ;
const blocks = [];


(function () {
    // Handle the message inside the webview
    

    window.addEventListener('message', event => {

        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case 'showvariants':
               let jsonObject= JSON.parse(message.data); 
                  for (var value in jsonObject) {  
                iterable.set(value,jsonObject[value]) ;
                 }
                 
                 let dataListOfBlocks= JSON.parse(message.dataListOfBlocks); 
                  for (var value in dataListOfBlocks) {  
                    listOfBlocks.set(value,dataListOfBlocks[value]) ;
                 }
                  let jsonObjectdataRequireConstraintsFca= JSON.parse(message.dataRequireConstraintsFca);
                  for (var value in jsonObjectdataRequireConstraintsFca) {
                    requireConstraintsFcaIterable.push(jsonObjectdataRequireConstraintsFca[value]);
                     }  
                     
                     let jsonObjectdataExclusionConstraintsFca= JSON.parse(message.dataExclusionConstraintsFca);
                     for (var value in jsonObjectdataExclusionConstraintsFca) {
                        exclusionConstraintsFcaIterable.push(jsonObjectdataExclusionConstraintsFca[value]);
                        }  

                  let jsonObjectdataRequireConstraintsFpGrowth= JSON.parse(message.dataRequireConstraintsFpGrowth);
                   for (var value in jsonObjectdataRequireConstraintsFpGrowth) {
                      dataRequireConstraintsFpGrowth.push(jsonObjectdataRequireConstraintsFpGrowth[value]);
                           }
                          
            for (let [clef, valeur] of iterable) {
                var variant = document.createElement("div");
                variant.setAttribute("class",clef +" variants");
                var title = document.createElement("div");
                title.setAttribute("class", "title");
                title.innerText = clef;
                vardy.appendChild(variant);
                variant.appendChild(title);
                valeur.forEach(element => {
                    var id = element+"";
                    var bloc = document.createElement("div");
                    bloc.setAttribute("onclick","show(this.id)");
                    bloc.setAttribute("class", "bloc "+element);
                    bloc.setAttribute("title", listOfBlocks.get(id).blockName);
                    bloc.setAttribute("id",element);
                    bloc.style.height = (80 + element*30) +"px";
                    bloc.style.background = Colors[element];
                    variant.appendChild(bloc);
                    var nomBloc = document.createElement("div");
                     nomBloc.setAttribute("id","nomBloc");
                     nomBloc.setAttribute("class", "sub_div #"+id);
                     nomBloc.innerText= listOfBlocks.get(id).blockName;
                     bloc.appendChild(nomBloc);
                });
            }

            for (let [clef, valeur] of iterable) {
                var label = document.createElement("label");
                label.innerText = clef ;
                label.setAttribute("class","containerCheckBox");
                var input = document.createElement("input");
                input.setAttribute("type","checkbox");
                input.setAttribute("checked","checked");
                input.setAttribute("onchange","toggleCheckbox(this)");
                input.setAttribute("id",clef);
                var span = document.createElement("span");
                span.setAttribute("class","checkmark");
                label.appendChild(input);
                label.appendChild(span);
                bloc.appendChild(label);
            }
            var blocksTitle = document.createElement("p");
            blocksTitle.innerText = "Blocks";
            blocksTitle.setAttribute("id","variatnsTitle");
            blocksTitle.style = "border-top: 4px solid #4b4b4b;"
        
            bloc.appendChild(blocksTitle);

            for (let [clef, valeur] of listOfBlocks) {
                    var label = document.createElement("label");
                    label.innerText = valeur.blockName ;
                    label.setAttribute("class","containerCheckBox #"+clef);
                    var input = document.createElement("input");
                    input.setAttribute("type","checkbox");
                    input.setAttribute("checked","checked");
                    input.setAttribute("onchange","toggleCheckboxBlocks(this)");
                    input.setAttribute("id",clef);
                    var span = document.createElement("span");
                    span.setAttribute("class","checkmark");
                    span.style.background =Colors[clef];
                    label.appendChild(input);
                    label.appendChild(span);
                    bloc.appendChild(label);
            }

            createConstraint();

                break;
        }
    });
 
    })();
    
    function createConstraint(){

        const elements = document.getElementsByClassName("constraintDiscovery");

        while (elements.length > 0) elements[0].remove();
    
        requireConstraintsFcaIterable.forEach(element => {
            var rerequireParagraph = document.createElement("div");
            rerequireParagraph.setAttribute("class","constraintDiscovery");
            rerequireParagraph.innerHTML = listOfBlocks.get(element.firstBlock.toString()).blockName  + " require " +listOfBlocks.get(element.secondBlock.toString()).blockName ;
            fca.appendChild(rerequireParagraph);
        });
        exclusionConstraintsFcaIterable.forEach(element => {
            var rerequireParagraph = document.createElement("div");
            rerequireParagraph.setAttribute("class","constraintDiscovery");
            rerequireParagraph.innerHTML = listOfBlocks.get(element.firstBlock.toString()).blockName  + " mutex " +listOfBlocks.get(element.secondBlock.toString()).blockName ;
            fca.appendChild(rerequireParagraph);
        });
        dataRequireConstraintsFpGrowth.forEach(element => {
            var rerequireParagraph = document.createElement("div");
            rerequireParagraph.setAttribute("class","constraintDiscovery");
            rerequireParagraph.innerHTML = listOfBlocks.get(element.firstBlock.toString()).blockName  + " require " +listOfBlocks.get(element.secondBlock.toString()).blockName ;
            fpGrowth.appendChild(rerequireParagraph);
        });
   }

   
 function show(clicked_id){
    var data=   listOfBlocks.get(clicked_id).tfIdfWordCloud;
    let cpt= 0;
    modal.style.display = "block";
    const options = document.getElementById("browsers");
    console.log(data);

    while(data.length>cpt && cpt<5){
        console.log(data.get(cpt));

        var option = document.createElement("option");
        option.value =data.get(cpt);
        options.appendChild(option);
        cpt++;
    }

    
    anychart.onDocumentReady(function () {
        // create a chart and set the data
        var chart = anychart.tagCloud();
    // set the parsing mode and configure parsing settings
    chart.data(data, {
        mode: "byWord",
        maxItems: 5,
        ignoreItems: [
                      "the",
                      "and",
                      "he",
                      "or",
                      "of",
                      "in",
                      "thy"
                     ]
    });
        // set the chart title
        const container = document.getElementById("container");
        console.log(data);
        container.innerHTML="";
                // set the container id
        chart.container("container");
    
        // initiate drawing the chart
        chart.draw();

    });

    var blockNameInput = document.getElementById("blockName");
    var blockName = document.getElementById(clicked_id);

    blockNameInput.value = blockName.title;
    blockNameInput.setAttribute("name",clicked_id);

}

function toggleCheckbox(element)
 {
    var id = element.id;
     if(element.checked){
        var x= document.getElementsByClassName(id)[0];
        x.style.display = "block";

     }else{
        var x= document.getElementsByClassName(id)[0];
        x.style.display = "none";

     }
 }

 function toggleCheckboxBlocks(element)
 {
    var id = element.id;
    
    if(element.checked){
        var x= document.getElementsByClassName(id);
            
        Array.prototype.forEach.call(x, function(el) {
            // Do stuff here
            el.style.display ="block";
        });

     }else{
            var x= document.getElementsByClassName(id);
            
            Array.prototype.forEach.call(x, function(el) {
                // Do stuff here
                el.style.display ="none";
            });
          
     }
 }
