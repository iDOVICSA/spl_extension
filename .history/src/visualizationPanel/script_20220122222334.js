(function () {
    // Handle the message inside the webview
    let iterable = new Map() ;
    let wordCloudIterable = new Map();
    window.addEventListener('message', event => {

        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case 'showvariants':
               let jsonObject= JSON.parse(message.data); 
                  for (var value in jsonObject) {  
                iterable.set(value,jsonObject[value]) ;
                 } 
                 let jsonObjectWordCloud= JSON.parse(message.dataWordCloud); 

                 for (var d in jsonObjectWordCloud) {  
                    wordCloudIterable.set(value,jsonObject[d]) ;
                     } 
                     console.log(wordCloudIterable);

            const table = document.getElementById("table");
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
                    bloc.setAttribute("class", "bloc");
                    bloc.setAttribute("title", "Bloc " + element);
                    bloc.setAttribute("id", "bloc" + element);
                    bloc.style.background = Colors[element];
                    variant.appendChild(bloc);
                });
            }
                break;
        }
    });
 
    })();
    