// ULTRA SIMPLE TEST - Export ONE layer from ONE file
// This will show exactly where it fails

#target photoshop

try {
    alert("Step 1: Starting script");

    var inputFolder = Folder.selectDialog("Select folder containing PSDs");
    if (!inputFolder) { alert("Cancelled at input"); exit(); }

    alert("Step 2: Input folder = " + inputFolder.fsName);

    var outputFolder = Folder.selectDialog("Select output folder");
    if (!outputFolder) { alert("Cancelled at output"); exit(); }

    alert("Step 3: Output folder = " + outputFolder.fsName);

    var files = inputFolder.getFiles("*.psd");
    alert("Step 4: Found " + files.length + " PSDs");

    if (files.length === 0) {
        alert("No PSD files found!");
        exit();
    }

    // Open just the first file
    var doc = app.open(files[0]);
    alert("Step 5: Opened " + doc.name);

    // Get layers
    var allLayers = [];
    for (var i = 0; i < doc.layers.length; i++) {
        var lyr = doc.layers[i];
        if (lyr.typename === 'ArtLayer' && !lyr.isBackgroundLayer) {
            allLayers.push(lyr);
        }
    }
    alert("Step 6: Found " + allLayers.length + " exportable layers");

    if (allLayers.length === 0) {
        alert("No exportable layers!");
        doc.close(SaveOptions.DONOTSAVECHANGES);
        exit();
    }

    // Hide all, then show first
    for (var i = 0; i < doc.layers.length; i++) {
        doc.layers[i].visible = false;
    }
    allLayers[0].visible = true;

    alert("Step 7: About to export layer '" + allLayers[0].name + "'");

    // Try export
    var exportFile = new File(outputFolder.fsName + "/TEST_EXPORT.png");
    alert("Step 8: Export path = " + exportFile.fsName);

    var opts = new ExportOptionsSaveForWeb();
    opts.format = SaveDocumentType.PNG;
    opts.PNG8 = false;
    opts.transparency = true;
    opts.quality = 100;

    alert("Step 9: About to call exportDocument...");

    doc.exportDocument(exportFile, ExportType.SAVEFORWEB, opts);

    alert("Step 10: Export succeeded! Check: " + exportFile.fsName);

    doc.close(SaveOptions.DONOTSAVECHANGES);
    alert("DONE - Test passed!");

} catch (e) {
    alert("💥 ERROR at line " + e.line + ":\n" + e.message);
}
