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
    Array.prototype.forEach.call(x, function(el) {
        // Do stuff here
        el.childNodes[0].nodeValue = blockNameInput.value;
    });

    Array.prototype.forEach.call(block, function(el) {
        // Do stuff here
        el.style.background = newColor;
    });

    var p= document.getElementsByClassName(id);
 
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
}




const draggbles = document.getElementsByClassName(".variants");
const containers = document.getElementById("vardy");

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
      const box = child.getBoundingClientRect()
      const offset = y - box.left  - box.width / 2
      console.log(offset);
    

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element
  }