
/*
  Best Bottles - Universal Layer Exporter v2.0
  -----------------------------------------------
  - Recursively processes subfolders (no need to flatten structure).
  - Forces 1000x1000px Canvas.
  - Exports ALL layers found (handling "Layer 1", "Layer 2" naming).
  - Hides background automatically.
*/

#target photoshop

function main() {
    var inputFolder = Folder.selectDialog("Select PARENT folder (containing all your bottle folders)");
    if (!inputFolder) return;

    var outputFolder = Folder.selectDialog("Select folder to save PNGs");
    if (!outputFolder) return;

    var stats = { count: 0 };
    processFolder(inputFolder, outputFolder, stats);

    alert("Complete! Processed " + stats.count + " files.");
}

function processFolder(folder, outputFolder, stats) {
    // 1. Process Files in this folder
    var fileList = folder.getFiles("*.psd");
    for (var i = 0; i < fileList.length; i++) {
        processFile(fileList[i], outputFolder);
        stats.count++;
    }

    // 2. Process Subfolders
    var folderList = folder.getFiles(function (f) { return f instanceof Folder; });
    for (var i = 0; i < folderList.length; i++) {
        processFolder(folderList[i], outputFolder, stats);
    }
}

function processFile(file, outputFolder) {
    try {
        open(file);
        var doc = app.activeDocument;
        var docName = doc.name.replace(/\.[^\.]+$/, '');

        // 1. Force 1000x1000 Canvas (Centered)
        resizeCanvas(doc, 1000, 1000);

        // 2. Hide all layers initially (only if > 1 layer)
        if (doc.layers.length > 1) {
            hideAllLayers(doc);
        }

        // 3. Loop through layers and export each one
        for (var i = 0; i < doc.layers.length; i++) {
            var layer = doc.layers[i];

            // Skip "Background" layer (locked white background)
            if (layer.isBackgroundLayer || layer.name.toLowerCase() === "background") continue;

            // If it's the only layer, it's already visible. Otherwise, show it.
            var wasVisible = layer.visible;
            layer.visible = true;

            // Clean layer name for filename (remove spaces, special chars)
            var cleanLayerName = layer.name.replace(/[^a-z0-9]/gi, '');
            var finalName = docName + "-" + cleanLayerName;

            savePNG(new File(outputFolder + "/" + finalName + ".png"));

            // Restore visibility (or hide if we are toggling)
            if (doc.layers.length > 1) layer.visible = false;
        }

        doc.close(SaveOptions.DONOTSAVECHANGES);
    } catch (e) {
        // If something fails, just close and move on
        // alert("Error on file: " + file + "\n" + e);
        if (app.documents.length > 0) app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
}

function resizeCanvas(doc, width, height) {
    doc.resizeCanvas(new UnitValue(width, "px"), new UnitValue(height, "px"), AnchorPosition.MIDDLECENTER);
}

function hideAllLayers(doc) {
    for (var i = 0; i < doc.layers.length; i++) {
        doc.layers[i].visible = false;
    }
}

function savePNG(file) {
    var pngOpts = new PNGSaveOptions();
    pngOpts.compression = 9;
    pngOpts.interlaced = false;
    app.activeDocument.saveAs(file, pngOpts, true, Extension.LOWERCASE);
}

main();
