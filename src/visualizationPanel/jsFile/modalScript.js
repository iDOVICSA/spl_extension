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
    /*var blockNameInput = document.getElementById("blockName");
    var id = blockNameInput.name;
    var nameOfBlock = listOfBlocks.get(id);
    listOfBlocks.set(id,"yacine");
    var x= document.getElementsByClassName("#"+id);
    console.log(x);

    Array.prototype.forEach.call(x, function(el) {
        // Do stuff here
        el.innerText = blockNameInput.value;
    });*/
  
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}