let wordCloudIterable = new Map();
let requireConstraintsFcaIterable  =[];

(function () {
    // Handle the message inside the webview
    let iterable = new Map() ;
    window.addEventListener('message', event => {

        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case 'showvariants':
               let jsonObject= JSON.parse(message.data); 
                  for (var value in jsonObject) {  
                iterable.set(value,jsonObject[value]) ;
                 } 
                 let jsonObjectWordCloud= JSON.parse(message.dataWordCloud); 

                 for (var value in jsonObjectWordCloud) {  
                    wordCloudIterable.set(value,jsonObjectWordCloud[value]) ;
                     } 

                  let jsonObjectdataRequireConstraintsFca= JSON.parse(message.dataRequireConstraintsFca);
                  for (var value in jsonObjectdataRequireConstraintsFca) {
                    requireConstraintsFcaIterable.push(jsonObjectdataRequireConstraintsFca[value]);
                     }                
                  
            const table = document.getElementById("table");
            const table2 = document.getElementById("table2");

            const Colors =['#f94144', '#f3722c', '#90be6d', '#43aa8b','#577590','#001f54','#7d4f50','#f7aef8','#f7aef8','#f7aef8','#f7aef8'];
            
        
            for (let [clef, valeur] of iterable) {
                var variant = document.createElement("div");
                variant.setAttribute("class", "variants");
                var title = document.createElement("div");
                title.setAttribute("class", "title");
                title.innerText = "Variant :"+clef
                table.appendChild(variant);
                variant.appendChild(title);
                valeur.forEach(element => {
                    var bloc = document.createElement("div");
                    bloc.setAttribute("onclick","show(this.id)");
                    bloc.setAttribute("class", "bloc");
                    bloc.setAttribute("title", "Bloc " + element);
                    bloc.setAttribute("id", element);
                    bloc.style.background = Colors[element];
                    variant.appendChild(bloc);
                });
            }
            const container = document.getElementById("rerequireParagraph");
            var constraint = document.createElement("div");
            var constraint2 = document.createElement("div");

            constraint.setAttribute("class", "constraint");
            constraint2.setAttribute("class", "constraint");

            table2.appendChild(constraint);
            table2.appendChild(constraint2);

            requireConstraintsFcaIterable.forEach(element => {
                var rerequireParagraph = document.createElement("constraintDiscovery");
                rerequireParagraph.style.color = "#000000";
                rerequireParagraph.innerHTML = "Block "+ element.firstBlock + " require Block " +element.secondBlock;
                constraint.appendChild(rerequireParagraph);
            });
            requireConstraintsFcaIterable.forEach(element => {
                var rerequireParagraph = document.createElement("constraintDiscovery");
                rerequireParagraph.style.color = "#000000";
                rerequireParagraph.innerHTML = "Block "+ element.firstBlock + " require Block " +element.secondBlock;
                constraint2.appendChild(rerequireParagraph);
            })
                break;
        }
    });
 
    })();
    
    function show(clicked_id){
       anychart.onDocumentReady(function () {
          var data = wordCloudIterable.get(clicked_id);
           // create a chart and set the data
           var chart = anychart.tagCloud();
       // set the parsing mode and configure parsing settings
       chart.data(data, {
           mode: "byWord"
       });
           // set the chart title
           const container = document.getElementById("container");
           container.innerHTML="";
                   // set the container id
           chart.container("container");
       
           // initiate drawing the chart
           chart.draw();
   
       });
   }