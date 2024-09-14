let lastFocusedInput = null; // Variable to track the last focused input field

const canvas = document.getElementById('projectionCanvas');
// Dragging control
let draggingSubstituent = null;
let offsetX = 0, offsetY = 0;


let substituents = {
    front: [
        { label: document.getElementById('front1').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('f1color').value},
        { label: document.getElementById('front2').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('f2color').value },
        { label: document.getElementById('front3').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('f3color').value }
    ],
    back: [
        { label: document.getElementById('back1').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('b1color').value },
        { label: document.getElementById('back2').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('b2color').value },
        { label: document.getElementById('back3').value, x: 0, y: 0, dragging: false, dragged: false, color: document.getElementById('b3color').value }
    ]
};


let eclipsed_offset = document.getElementById('eclipsed_offset').value;



function drawProjection() {
    //const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
        
        
    substituents['front'][0].label = document.getElementById('front1').value;
    substituents['front'][1].label = document.getElementById('front2').value;
    substituents['front'][2].label = document.getElementById('front3').value;
    
    substituents['back'][0].label = document.getElementById('back1').value;
    substituents['back'][1].label = document.getElementById('back2').value;
    substituents['back'][2].label = document.getElementById('back3').value;

    
    eclipsed_offset = document.getElementById('eclipsed_offset').value;
    const conformation = document.getElementById('conformation').value;
     
    // Set rotation for staggered (60 degrees) or eclipsed (0 degrees)
    const rotation = conformation === 'staggered' ? 60 : eclipsed_offset;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set center of projection
    const centerX = 150;
    const centerY = 150;
    const bondLength = 60;
    const substituentOffset = 10; // Offset to position substituents closer to the end
    const fontSize = '20px'; // Set font size
    const circleRadius = 40;

    // Draw back carbon circle with dashed line
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash for other drawings

    // Draw back bonds and substituents
    drawBonds(ctx, centerX, centerY, bondLength, substituents, rotation, false, true, true, substituentOffset, fontSize, circleRadius, true, 'back');

    drawBonds(ctx, centerX, centerY, bondLength, substituents, 0, true, false, false, substituentOffset, fontSize, circleRadius, false, 'front');
}

// Function to draw bonds and place substituents
function drawBonds(ctx, cx, cy, bondLength, substituents, rotation, isFront = false, isDashed = false, isBack = false, substituentOffset = 10, fontSize = '16px', circleRadius = 50, hideBehindCircle = false, positionKey = 'front') {
    // Define base angles for 120-degree separation
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);

    // Adjust angles based on whether they are front or back bonds
    const angles = isBack ? adjustBackAngles(rotation) : (isFront ? adjustFrontAngles() : baseAngles);

    // Set line style
    ctx.lineWidth = 3;
    // Set font size and text alignment
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';


    for (let i = 0; i < 3; i++) {
        const angle = angles[i];
        const xEnd = cx + bondLength * Math.cos(angle);
        const yEnd = cy + bondLength * Math.sin(angle);

        if (hideBehindCircle && isBack) {
            // Draw only the portion of the bond outside the circle
            drawPartialBond(ctx, cx, cy, xEnd, yEnd, circleRadius);
        } else {
            // Draw the full bond if not hiding behind the circle
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
        }

        // Draw substituent exactly at the end of the bond
        //const labelX = cx + (bondLength + substituentOffset) * Math.cos(angle);
        //const labelY = cy + (bondLength + substituentOffset) * Math.sin(angle);
        //ctx.fillText(substituents[i], labelX, labelY);
        
        
        // Update substituent positions if it's not being dragged or previously dragged
        if (!substituents[positionKey][i].dragging && !substituents[positionKey][i].dragged) {
            substituents[positionKey][i].x = cx + (bondLength + substituentOffset) * Math.cos(angle);
            substituents[positionKey][i].y = cy + (bondLength + substituentOffset) * Math.sin(angle);
        }
        
        ctx.fillStyle = substituents[positionKey][i].color; 
        // Draw substituent at updated position
        ctx.fillText(substituents[positionKey][i].label, substituents[positionKey][i].x, substituents[positionKey][i].y);
        
        
        
        
    }
}

// Function to draw partial bond that is visible outside the circle
function drawPartialBond(ctx, cx, cy, xEnd, yEnd, circleRadius) {
    // Calculate intersection points with the circle
    const dx = xEnd - cx;
    const dy = yEnd - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const t = circleRadius / distance;

    const xIntersect = cx + t * dx;
    const yIntersect = cy + t * dy;

    // Draw only the part of the bond that is outside the circle
    ctx.beginPath();
    ctx.moveTo(xIntersect, yIntersect);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

// Function to adjust angles for back bonds with rotation
function adjustBackAngles(rotation) {
    // Base angles for 120-degree separation
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);

    // Ensure back substituent 3 starts pointing straight down
    const baseAngle3 = -Math.PI / 2; // 90 degrees pointing down

    // Calculate angles for back substituents
    const angles = [
        baseAngle3,
        baseAngle3 + Math.PI * 2 / 3,  // 120 degrees from substituent 3
        baseAngle3 + Math.PI * 4 / 3   // 240 degrees from substituent 3
    ];

    // Rotate all back angles by the given rotation
    return angles.map(angle => angle + (rotation * Math.PI / 180));
}

// Function to adjust angles for front bonds with one vertical
function adjustFrontAngles() {
    // Set one bond vertical, others spaced 120 degrees
    const verticalAngle = -Math.PI / 2; // 90 degrees pointing up
    return [
        verticalAngle,
        verticalAngle + (2 * Math.PI / 3),
        verticalAngle + (4 * Math.PI / 3) // Ensuring the third bond is also correctly placed
    ];
}


function cropImageFromCanvas(ctx) {
  var canvas = ctx.canvas, 
    w = canvas.width, h = canvas.height,
    pix = {x:[], y:[]},
    imageData = ctx.getImageData(0,0,canvas.width,canvas.height),
    x, y, index;
    
    
  // Create a temporary canvas to hold the cropped image
  const tempCanvas = document.createElement('canvas');
  
  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      index = (y * w + x) * 4;
      if (imageData.data[index+3] > 0) {
        pix.x.push(x);
        pix.y.push(y);
      } 
    }
  }
  pix.x.sort(function(a,b){return a-b});
  pix.y.sort(function(a,b){return a-b});
  var n = pix.x.length-1;
  
  w = 1 + pix.x[n] - pix.x[0];
  h = 1 + pix.y[n] - pix.y[0];
  
  tempCanvas.width = w+5;
  tempCanvas.height = h+5;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, pix.x[0]-5, pix.y[0]-5, w+5, h+5, 0, 0, w, h);
  
  return tempCanvas.toDataURL('image/png');      
}


function downloadCroppedImage() {
    //const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
    
    // Define the cropping region
    const cropX = 50; // X-coordinate of the cropping rectangle
    const cropY = 50; // Y-coordinate of the cropping rectangle
    const cropWidth = 300; // Width of the cropping rectangle
    const cropHeight = 300; // Height of the cropping rectangle

    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the cropped region onto the temporary canvas
    tempCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // Convert the temporary canvas to an image
    const dataURL = tempCanvas.toDataURL('image/png');

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'newman_projection.png';
    link.click();
}


function exportCroppedImage() {
    //const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
    
    let image = cropImageFromCanvas(ctx);
    

    
    let imghtml = "<img "+"src='"+image+"'</img>";
     
     
    parent.tinymce.activeEditor.selection.setContent(imghtml);
    parent.tinymce.activeEditor.windowManager.close();
    
}

function cancel() {

    parent.tinymce.activeEditor.windowManager.close();

}



document.addEventListener('DOMContentLoaded', () => {
    // Get all input fields
    const inputFields = document.querySelectorAll('input[type="text"]');
    const conformation = document.getElementById('conformation');

    const colors = document.querySelectorAll('.color-input');
    const eclipsed_input = document.getElementById('eclipsed_offset');
    // Track which input field was last focused
        conformation.addEventListener('change', () => {
            drawProjection();
        });

        colors.forEach(function(input) {
           let hueb = new Huebee(input, {
             saturations: 1,
             setBGColor: true,
             setText: true,
             inputId: input.id,
             shades: 3,
             hues: 6
           });

           hueb.on( 'change', function(color, hue, sat, lum ) {
              
              let labelid = document.getElementById(hueb.anchor.id).previousSibling.id;
              
              let subid = labelid.slice(-1);
              console.log(subid);
                            
              if (labelid.substring(0, 1) == "f") {
              
                substituents['front'][subid -1].color = color;
              
              } else {
                substituents['back'][subid -1].color = color;
              
              }
              drawProjection();

              hueb.close();
            });
           
           
        });
    
    eclipsed_input.addEventListener('change', () => {
            drawProjection();
    });

    // Track which input field was last focused
    inputFields.forEach(input => {
        input.addEventListener('focus', () => {
            lastFocusedInput = input;
        });
    });
    
    // Track which input field was last focused
    inputFields.forEach(input => {
        input.addEventListener('input', (e) => {
        if (Number.isInteger(parseInt(e.data))) {
        const position = e.target.selectionStart - 1; // Subtract 1 to get the position of the last character added
        const subscripts = ["\u2080", "\u2081", "\u2082", "\u2083", "\u2084", "\u2085", "\u2086", "\u2087", "\u2088", "\u2089"];

        let str = document.getElementById(e.target.id).value;
        let newStr = str.substring(0, position) + subscripts[e.data] + str.substring(position + 1);
        
        document.getElementById(e.target.id).value = newStr;
        }
        
        drawProjection();
        });
    });
    

    // Get all table cells containing the Unicode subscripts
    const tableCells = document.querySelectorAll('#unicodeTable td');

    // Add click event listener to each cell
    tableCells.forEach(cell => {
        cell.addEventListener('click', () => {
            const char = cell.getAttribute('data-char');
            insertIntoLastFocusedInput(char);
            drawProjection();
        });
    });
});



// Add mouse event listeners for dragging functionality
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Check if any substituent was clicked
    draggingSubstituent = getClickedSubstituent(mouseX, mouseY);
    if (draggingSubstituent) {
        offsetX = mouseX - draggingSubstituent.x;
        offsetY = mouseY - draggingSubstituent.y;
        draggingSubstituent.dragging = true;
        draggingSubstituent.dragged = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingSubstituent && draggingSubstituent.dragging) {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        draggingSubstituent.x = mouseX - offsetX;
        draggingSubstituent.y = mouseY - offsetY;

        // Redraw canvas with updated positions
        drawProjection();
    }
});

canvas.addEventListener('mouseup', () => {
    //console.log(draggingSubstituent);
    if (draggingSubstituent) {
        
        draggingSubstituent.dragging = false;
        draggingSubstituent = null;
    }
});

function updateSubColors(color) {


}





// Function to detect clicked substituent
function getClickedSubstituent(x, y) {
    const ctx = canvas.getContext('2d');
    for (const positionKey in substituents) {
        let i=0;
        for (const sub of substituents[positionKey]) {
            const width = ctx.measureText(sub.label).width;
            const height = 16; // Font size
            if (x >= sub.x - width / 2 && x <= sub.x + width / 2 &&
                y >= sub.y - height / 2 && y <= sub.y + height / 2) {
                //console.log(sub);
                sub.positionKey = positionKey;
                sub.index = i;
                return sub;
            }
            i=i+1;
        }
    }
    return null;
}



// Function to insert character into the last focused input field
function insertIntoLastFocusedInput(char) {
    // Check if an input field was focused
    if (lastFocusedInput) {
        // Insert the character at the current cursor position in the focused input
        const cursorPosition = lastFocusedInput.selectionStart;
        const currentValue = lastFocusedInput.value;
        
        // Insert the character at the cursor position
        lastFocusedInput.value = currentValue.slice(0, cursorPosition) + char + currentValue.slice(cursorPosition);

        // Move the cursor to the end of the inserted character
        lastFocusedInput.setSelectionRange(cursorPosition + 1, cursorPosition + 1);

        // Focus back on the input after insertion
        lastFocusedInput.focus();
    } else {
        alert('Please click on an input field before selecting a subscript.');
    }
}






// Initialize with default drawing
drawProjection();

