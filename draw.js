/*
*  Block of drawing sectors
*/
document.addEventListener("DOMContentLoaded", function(){
    const img1_id = 'ra1';
    const rectangles_id = 'id_difference_zones';
    const min_width = 40;
    const min_height = 40;
    const rectform = document.getElementById(rectangles_id);
    const canvas = document.getElementById(img1_id);
    const container = canvas.parentElement;


    function CreateSector(x0, y0, width, height) {
        let sector = document.createElement("div");
        sector.classList.add("rectangle");
        // set position
        sector.style.webkitTransform = sector.style.transform = `translate(${x0}px, ${y0}px)`;
        sector.style.width = `${width}px`;
        sector.style.height = `${height}px`;
        // extra attributes for dragging
        sector.setAttribute('data-x', x0);
        sector.setAttribute('data-y', y0);
        sector.textContent = container.childElementCount;  // will +1
        container.appendChild(sector);
    }

    function Init() {
        let childrens = container.children;
        for (let n = 1; childrens.length > 1;) {
            if (childrens[n].tagName === "DIV") childrens[n].remove();
        };

        let rectangles = JSON.parse(rectform.textContent);
        rectangles.forEach((item, i, arr) => CreateSector(...item));
    }

    // make textarea readonly
    rectform.setAttribute("disabled", "disabled");
    // make readed for send to django
    window.onsubmit = () => rectform.removeAttribute("disabled")


    Init();

// exec every change
    function upload() {
        rectanges = Array.from(document.getElementsByClassName('rectangle'));
        coords = rectanges.map((item, i, arr) => [
                parseInt(item.getAttribute('data-x')),
                parseInt(item.getAttribute('data-y')),
                parseInt(item.style.width.replace('px', '')),
                parseInt(item.style.height.replace('px', ''))
            ]
        );
        rectform.textContent = JSON.stringify(coords);
    }


/*
*  Block of dragging sectors
*/

    function dragMoveListener(event) {
        let target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)'

        // update the posiion attributes
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
        upload();
    }

    interact('.rectangle')
        .draggable({
            // keep the element within the area of it's parent
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: canvas,
                })
            ],

            listeners: {
                // call this function on every dragmove event
                move: dragMoveListener
            }
        })


/*
*  Block of resizing sectors
*/

    interact('.rectangle')
        .resizable({
            // resize from all edges and corners
            edges: {left: true, right: true, bottom: true, top: true},

            listeners: {
                move(event) {
                    var target = event.target
                    var x = (parseFloat(target.getAttribute('data-x')) || 0)
                    var y = (parseFloat(target.getAttribute('data-y')) || 0)

                    // update the element's style
                    target.style.width = event.rect.width + 'px'
                    target.style.height = event.rect.height + 'px'

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left
                    y += event.deltaRect.top

                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)'

                    target.setAttribute('data-x', x)
                    target.setAttribute('data-y', y)
                    upload();
                }
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: canvas
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: {width: min_width, height: min_height}
                })
            ]
        })
});