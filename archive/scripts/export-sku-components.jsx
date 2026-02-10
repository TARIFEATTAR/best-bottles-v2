// BEST BOTTLES - Universal Layer Export Script v9 (AUTO-CENTER)
// Organizes output: One folder per SKU, component PNGs inside
// FEATURING: Auto-Trim centering, 1500px Canvas, PNG SaveAs

#target photoshop

try {
    var inputFolder = Folder.selectDialog("Select folder containing PSDs");
    var outputRoot = Folder.selectDialog("Select MASTER Output Folder");

    if (!inputFolder || !outputRoot) {
        alert("Cancelled");
        exit();
    }

    var files = inputFolder.getFiles("*.psd");
    var exportLog = [];
    var exportCount = 0;
    var skuCount = 0;

    exportLog.push("=== BEST BOTTLES PNG EXPORT v9 ===");
    exportLog.push("Mode: AUTO-CENTER (Trim + Expand)");
    exportLog.push("Canvas: 1500x1500px");
    exportLog.push("Naming: PRESERVED");
    exportLog.push("Started: " + new Date().toString());
    exportLog.push("Source: " + inputFolder.fsName);
    exportLog.push("Output: " + outputRoot.fsName);
    exportLog.push("Files: " + files.length);
    exportLog.push("");

    for (var f = 0; f < files.length; f++) {
        var doc = app.open(files[f]);
        var rawName = doc.name.replace(/\.psd$/i, '');
        var sku = rawName.replace(/^\d+\.\s*/, '');

        var skuFolder = new Folder(outputRoot.fsName + "/" + sku);
        if (!skuFolder.exists) {
            skuFolder.create();
        }
        skuCount++;

        exportLog.push("📁 " + sku + "/");

        // 0. Work on a DUPLICATE
        var originalDoc = doc;
        doc = originalDoc.duplicate();
        originalDoc.close(SaveOptions.DONOTSAVECHANGES);

        // Recursively get ALL layers
        var allLayers = [];
        gatherAllLayers(doc, allLayers);

        // v9 STRATEGY: AUTO-CENTER
        // 1. Make ALL layers visible first to establish "Assembly Bounds"
        for (var i = 0; i < allLayers.length; i++) {
            makeLayerVisible(allLayers[i]);
        }

        // 2. TRIM transparent pixels. 
        // This effectively centers the content by removing all uneven whitespace.
        try {
            doc.trim(TrimType.TRANSPARENT, true, true, true, true);
        } catch (e) {
            // Ignore if empty
        }

        // 3. Standardize Size (Scale to max 1000px)
        var targetCanvas = 1500;
        var maxContent = 1000;

        var w = doc.width.as('px');
        var h = doc.height.as('px');

        if (w > maxContent || h > maxContent) {
            if (w > h) {
                doc.resizeImage(UnitValue(maxContent, "px"), null, null, ResampleMethod.BICUBIC);
            } else {
                doc.resizeImage(null, UnitValue(maxContent, "px"), null, ResampleMethod.BICUBIC);
            }
        }

        // 4. Resize Canvas to Target (1500px) - FROM CENTER
        // This guarantees the assembly is dead center.
        doc.resizeCanvas(UnitValue(targetCanvas, "px"), UnitValue(targetCanvas, "px"), AnchorPosition.MIDDLECENTER);

        // --- CRITICAL FIX v10 ---
        // Do NOT trim or re-center individual layers after this point!
        // The coordination system is now locked to 1500x1500px.
        // Exporting a layer via saveAs(PNG) will save the FULL 1500px canvas with the layer in its correct relative spot.

        // Hide everything to prepare for export
        hideAllLayers(doc);

        // Analysis Phase: Map layers
        var exportQueue = [];
        var unmappedLayers = [];

        for (var i = 0; i < allLayers.length; i++) {
            var layer = allLayers[i];
            var layerName = layer.name;
            var assignedName = null;

            if (layerName === 'bottle' || layerName === 'Layer 2') assignedName = 'bottle';
            else if (layerName === 'cap' || layerName === 'Layer 3') assignedName = 'cap';
            else if (layerName === 'fitment' || layerName === 'Layer 4') assignedName = 'fitment';
            else if (layerName === 'pump' || layerName === 'Layer 5') assignedName = 'pump';
            else if (layerName === 'Layer 9') assignedName = 'fitment';
            else if (layerName === 'Layer 10') assignedName = 'overcap';
            else if (layerName === 'Layer 11') assignedName = 'fitment';

            if (assignedName) {
                exportQueue.push({ layer: layer, componentName: assignedName });
            } else {
                unmappedLayers.push(layer);
            }
        }

        // Fallback Logic for unmapped layers
        // 4 LAYERS: bottle, pump, fitment, overcap (for Clear glass with visible dip tube)
        if (unmappedLayers.length === 4) {
            for (var u = 0; u < unmappedLayers.length; u++) {
                var b = unmappedLayers[u].bounds;
                var top = b[1].as('px');
                var w = b[2].as('px') - b[0].as('px');
                var h = b[3].as('px') - b[1].as('px');
                unmappedLayers[u].area = w * h;
                unmappedLayers[u].top = top;
            }
            // Sort by vertical position (top to bottom)
            unmappedLayers.sort(function (a, b) { return a.top - b.top; });
            // Expected order from top to bottom: overcap, fitment, pump, bottle
            exportQueue.push({ layer: unmappedLayers[0], componentName: 'overcap' });
            exportQueue.push({ layer: unmappedLayers[1], componentName: 'fitment' });
            exportQueue.push({ layer: unmappedLayers[2], componentName: 'pump' });
            exportQueue.push({ layer: unmappedLayers[3], componentName: 'bottle' });
        }
        // 3 LAYERS: Original logic (bottle, fitment, overcap)
        else if (unmappedLayers.length === 3) {
            for (var u = 0; u < unmappedLayers.length; u++) {
                var b = unmappedLayers[u].bounds;
                var w = b[2].as('px') - b[0].as('px');
                var h = b[3].as('px') - b[1].as('px');
                unmappedLayers[u].area = w * h;
            }
            unmappedLayers.sort(function (a, b) { return b.area - a.area; });
            exportQueue.push({ layer: unmappedLayers[0], componentName: 'bottle' });
            exportQueue.push({ layer: unmappedLayers[1], componentName: 'overcap' });
            exportQueue.push({ layer: unmappedLayers[2], componentName: 'fitment' });
        }
        else if (unmappedLayers.length > 0) {
            for (var u = 0; u < unmappedLayers.length; u++) {
                exportQueue.push({
                    layer: unmappedLayers[u],
                    componentName: unmappedLayers[u].name.replace(/[^a-z0-9]/gi, '_')
                });
            }
        }

        // Execution Phase
        hideAllLayers(doc);

        for (var q = 0; q < exportQueue.length; q++) {
            var item = exportQueue[q];
            var finalName = sku + "_" + item.componentName + ".png";
            var exportFile = new File(skuFolder.fsName + "/" + finalName);

            makeLayerVisible(item.layer);

            var pngOpts = new PNGSaveOptions();
            pngOpts.compression = 6;
            pngOpts.interlaced = false;

            doc.saveAs(exportFile, pngOpts, true, Extension.LOWERCASE);
            exportLog.push("   ✅ " + item.componentName);
            exportCount++;

            hideAllLayers(doc);
        }

        doc.close(SaveOptions.DONOTSAVECHANGES);
    }

    exportLog.push("");
    exportLog.push("=== COMPLETE ===");
    exportLog.push("Log: " + outputRoot.fsName + "/_export_log.txt");

    var logFile = new File(outputRoot.fsName + "/_export_log.txt");
    logFile.open("w");
    logFile.write(exportLog.join("\n"));
    logFile.close();

    alert("✅ Done! Auto-Centered " + skuCount + " SKUs.");

} catch (e) {
    alert("💥 ERROR at line " + e.line + ":\n" + e.message);
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

function hideAllLayers(container) {
    for (var i = 0; i < container.layers.length; i++) {
        var layer = container.layers[i];
        layer.visible = false;
        if (layer.typename === 'LayerSet') {
            hideAllLayers(layer);
        }
    }
}

function makeLayerVisible(layer) {
    layer.visible = true;
    var parent = layer.parent;
    while (parent && parent.typename !== 'Document') {
        parent.visible = true;
        parent = parent.parent;
    }
}
