// DEBUG - Check layer names in Roll-on files
#target photoshop

try {
    var inputFolder = Folder.selectDialog("Select folder containing PSDs");
    if (!inputFolder) { alert("Cancelled"); exit(); }

    var files = inputFolder.getFiles("*.psd");
    var report = "=== LAYER STRUCTURE REPORT ===\n\n";

    // Check first 5 files of different types
    var checkCount = Math.min(files.length, 10);

    for (var f = 0; f < checkCount; f++) {
        var doc = app.open(files[f]);
        var rawName = doc.name.replace(/\.psd$/i, '');
        var sku = rawName.replace(/^\d+\.\s*/, '');

        report += "📁 " + sku + "\n";

        // Get all layers
        var allLayers = [];
        gatherAllLayers(doc, allLayers);

        for (var i = 0; i < allLayers.length; i++) {
            report += "   Layer: '" + allLayers[i].name + "'\n";
        }
        report += "\n";

        doc.close(SaveOptions.DONOTSAVECHANGES);
    }

    alert(report);

} catch (e) {
    alert("ERROR: " + e.message);
}

function gatherAllLayers(container, arr) {
    for (var i = 0; i < container.layers.length; i++) {
        var layer = container.layers[i];
        if (layer.typename === 'LayerSet') {
            gatherAllLayers(layer, arr);
        } else if (layer.typename === 'ArtLayer' && !layer.isBackgroundLayer) {
            arr.push(layer);
        }
    }
}
