 // Get the modal
 var modal = document.getElementById('myModal');
 const vscode = acquireVsCodeApi();

// Get the <span> element that closes the modal
//Close of header MODAL
var span = document.getElementsByClassName("close")[0];
//Close of footer MODAL
var span2 = document.getElementsByClassName("close")[1];

//

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

span2.onclick = function() {
    modal.style.display = "none";
}

function saveChangesButton() {
    console.log("Information saved succesfully");
    var blockNameInput = document.getElementById("blockName");
    //get the new color
    var newColor = document.getElementById("favcolor").value;
    //get block ID
    var id = blockNameInput.name;
    var nameOfBlock = listOfBlocks.get(id);
    listOfBlocks.get(id).blockName  =blockNameInput.value;
    listOfBlocks.get(id).colorOfBlock  =newColor;
    var checkMark = document.getElementById("checkmarkColor"+id);
    var x= document.getElementsByClassName("#"+id);
    var block= document.getElementsByClassName("bloc "+id);

    checkMark.style.background=newColor;
    //change name in diffrent blocks
    Array.prototype.forEach.call(x, function(el) {
        // Do stuff here
        el.childNodes[0].nodeValue = blockNameInput.value;
    });

    Array.prototype.forEach.call(block, function(el) {
        // Do stuff here
        el.style.background = newColor;
    });

    var p= document.getElementsByClassName(id);
     //change name in diffrent checkbox

    Array.prototype.forEach.call(p, function(el) {
        // Do stuff here
        el.title =blockNameInput.value;
    });
    createConstraint();
    //send data to backend
    const jsonObject = {};
    jsonObject["blockId"]=id;
    jsonObject["newName"]=blockNameInput.value;
    jsonObject["newColor"]=newColor;
    jsonObject["mssgToShow"]="Block Renamed "+blockNameInput.value +" with succes";
    vscode.postMessage({
        command: 'alert',
        text: jsonObject,
    });
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};



function renameAllBlocks(){
    for (let [clef, valeur] of listOfBlocks) {
        if(valeur.tfIdfWordCloud.length>0){
            let newBlockName =valeur.tfIdfWordCloud[0].x;
            listOfBlocks.get(clef).blockName  =newBlockName;
            //change name in diffrent blocks
            var x= document.getElementsByClassName("#"+clef);

     Array.prototype.forEach.call(x, function(el) {
        // Do stuff here
        el.childNodes[0].nodeValue = newBlockName;
    });

    var p= document.getElementsByClassName(clef);
     //change name in diffrent checkbox

    Array.prototype.forEach.call(p, function(el) {
        // Do stuff here
        el.title =newBlockName;
    });
    createConstraint();

    const jsonObject = {};
    jsonObject["blockId"]=id;
    jsonObject["newName"]=blockNameInput.value;
    jsonObject["newColor"]=newColor;
    jsonObject["mssgToShow"]="Block Renamed with succes";
    vscode.postMessage({
        command: 'alert',
        text: jsonObject,
    });

        }

}

}


