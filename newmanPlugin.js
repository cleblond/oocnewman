tinymce.PluginManager.add('newmanprojection', function(editor, url) {
    editor.addButton('newmanprojection', {
        text: 'Newman Projection',
        icon: false,
        onclick: function() {
            editor.windowManager.open({
                title: 'Newman Projection',
                body: [
                    {
                        type: 'container',
                        html: `
                            <canvas id="projectionCanvas" width="400" height="400" style="border:1px solid black;"></canvas>
                            <br />
                            <label>Front Substituents:</label>
                            <input type="text" id="front1" value="A" />
                            <input type="text" id="front2" value="B" />
                            <input type="text" id="front3" value="C" />
                            <br />
                            <label>Back Substituents:</label>
                            <input type="text" id="back1" value="X" />
                            <input type="text" id="back2" value="Y" />
                            <input type="text" id="back3" value="Z" />
                            <br />
                            <button onclick="drawProjection()">Redraw</button>
                        `
                    }
                ],
                buttons: [
                    {
                        text: 'Insert',
                        onclick: function() {
                            const dataUrl = document.getElementById('projectionCanvas').toDataURL();
                            editor.insertContent('<img src="' + dataUrl + '" />');
                            editor.windowManager.close();
                        }
                    },
                    {
                        text: 'Close',
                        onclick: 'close'
                    }
                ]
            });
            
            // Call the drawing function after the modal is open
            drawProjection();
        }
    });
});

