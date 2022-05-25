console.log("Hello rani ghaya f JS")
let requireConstraintsFcaIterable  =[];
let exclusionConstraintsFcaIterable  =[];
let dataRequireConstraintsFpGrowth  =[];

const table = document.getElementById("table");
const table2 = document.getElementById("table2");  
const fca = document.getElementById("fca");
const fpGrowth = document.getElementById("fpGrowth");

const vardy = document.getElementById("vardy");
var bloc = document.getElementById("blocMenu");
let iterable = new Map() ;
let listOfBlocks = new Map() ;
const blocks = [];


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
                variant.setAttribute("draggable","true");
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
                    bloc.style.height = (80 + listOfBlocks.get(id).percentageOfBlock*2) +"px";
                    bloc.style.background = listOfBlocks.get(id).colorOfBlock;
                    variant.appendChild(bloc);
                    var nomBloc = document.createElement("div");
                     nomBloc.setAttribute("id","nomBloc");
                     nomBloc.setAttribute("class", "sub_div #"+id);
                     nomBloc.innerText= listOfBlocks.get(id).blockName;
                     bloc.appendChild(nomBloc);
                });
            }
            const draggbles = document.querySelectorAll(".variants");
            draggbles.forEach(dragabble => {
                console.log(dragabble);
                dragabble.addEventListener('dragstart', ()=> {
                    console.log("start");
                    dragabble.classList.add("dragging");
                })
                dragabble.addEventListener('dragend', ()=> {
                    console.log("end");
                    dragabble.classList.remove("dragging");
            
                })
            });

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
                    span.setAttribute("id","checkmarkColor"+clef);
                    span.style.background =valeur.colorOfBlock;
                    label.appendChild(input);
                    label.appendChild(span);
                    bloc.appendChild(label);
            }

            createConstraint();

                break;
        }
    });
 
    
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
    const elements = document.getElementsByTagName("option");

    while (elements.length > 0) elements[0].remove();

    let colorOfBlock = document.getElementById("favcolor");


    var data=   listOfBlocks.get(clicked_id).tfIdfWordCloud;
    let cpt= 0;
    modal.style.display = "block";
    const options = document.getElementById("options");

    var firstOption = document.createElement("option");
    firstOption.setAttribute("id","#z0");
    firstOption.innerText ="Select new name:";
    options.appendChild(firstOption);

    while(data.length>cpt && cpt<5){
        var option = document.createElement("option");
        option.innerText =data[cpt].x;
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

    colorOfBlock.value =  listOfBlocks.get(clicked_id).colorOfBlock;

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
          //  el.style.display ="block";
          el.style.opacity ="";

        });

     }else{
            var x= document.getElementsByClassName(id);
            
            Array.prototype.forEach.call(x, function(el) {
                // Do stuff here
           //     el.style.display ="none";
                  el.style.opacity ="0.4";
            });
          
     }
 }

 function update() {
    var firstOption = document.getElementById('#z0');
    firstOption.style.display="none";
    var select = document.getElementById('options');
    var option = select.options[select.selectedIndex];
    var blockNameInput = document.getElementById("blockName");
    blockNameInput.value=option.innerText;
}

const containers = document.getElementById("vardy");



containers.addEventListener('dragover', e=> {
    e.preventDefault();
    const afterElement = getDragAfterElement(containers, e.clientX);
    const draggable = document.querySelector(".dragging");
    console.log(afterElement);
    if (afterElement == null) {

        containers.appendChild(draggable);
      } else {

        containers.insertBefore(draggable,  afterElement)
      }})


function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.variants:not(.dragging)')]

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.left  - box.width / 2;
      console.log(offset);
    

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

 