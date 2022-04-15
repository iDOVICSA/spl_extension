 // Get the modal
 var modal = document.getElementById('myModal');

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
    var id = blockNameInput.name;
    var nameOfBlock = listOfBlocks.get(id);
    listOfBlocks.set(id,blockNameInput.value);
    var x= document.getElementsByClassName("#"+id);

    Array.prototype.forEach.call(x, function(el) {
        // Do stuff here
        el.childNodes[0].nodeValue = blockNameInput.value;
    });

    var p= document.getElementsByClassName(id);
 
    Array.prototype.forEach.call(p, function(el) {
        // Do stuff here
        el.title =blockNameInput.value;
    });
    createConstraint();
    const vscode = acquireVsCodeApi();
    vscode.postMessage({
        command: 'alert',
        text: '🐛  on line ' + count
    });
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
