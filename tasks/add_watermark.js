const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');
const helpers = require('./helpers');


module.exports = function(project) {
    var promise = new Promise(function(resolve, reject) {
        console.log("Adding Watermark...");
        output_file = helpers.add_prefix_to_file(project.last_processed, 'w');
        ffmpeg()
            .input(project.last_processed)
            .input(WATERMARK_PATH)
            .videoCodec('libx264')
            .outputOptions('-pix_fmt yuv420p')
            .complexFilter([
                "overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2"
            ])
            .on('progress', function(progress) {
                process.stdout.write('[add_waternark] Embedding Watermark: ' + progress.percent.toFixed(2) + '% done\r');
            })
            .on('error', function(err, stdout, stderr) {
                console.log('[add_waternark] Adding Watermark Failed: ' + err.message);
                reject(promise);
            })
            .on('end', function() {
                project.watermarked_file = output_file;
                project.last_processed = output_file;
                console.log('Watermark Added');
                resolve(project);
            })
            .saveToFile(output_file);
    });
    return promise;
}