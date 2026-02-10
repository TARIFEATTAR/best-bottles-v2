// MINIMAL DEBUG SCRIPT - Diagnose layer structure
// Run this on ONE PSD to see what's happening

#target photoshop

try {
    alert("Script starting...");

    var inputFolder = Folder.selectDialog("Select folder containing PSDs");
    if (!inputFolder) {
        alert("No input folder selected");
    } else {
        alert("Input folder: " + inputFolder.fsName);

        var files = inputFolder.getFiles("*.psd");
        alert("Found " + files.length + " PSD files");

        if (files.length > 0) {
            // Just process the FIRST file
            var doc = app.open(files[0]);
            alert("Opened: " + doc.name);

            var layerInfo = "";
            layerInfo += "Document: " + doc.name + "\n";
            layerInfo += "Total top-level layers/groups: " + doc.layers.length + "\n\n";

            function listLayers(container, indent) {
                var info = "";
                for (var i = 0; i < container.layers.length; i++) {
                    var layer = container.layers[i];
                    info += indent + "Layer " + i + ": '" + layer.name + "' (type: " + layer.typename + ")\n";
                    if (layer.typename === 'LayerSet') {
                        info += listLayers(layer, indent + "  ");
                    }
                }
                return info;
            }

            layerInfo += listLayers(doc, "");

            alert(layerInfo);

            doc.close(SaveOptions.DONOTSAVECHANGES);
            alert("Done! Check console for layer info.");
        }
    }
} catch (e) {
    alert("ERROR: " + e.message + " (line " + e.line + ")");
}
