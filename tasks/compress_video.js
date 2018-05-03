const fs = require("fs");
const hbjs = require('handbrake-js');
const helpers = require('./helpers');

module.exports = function(project) {
    var promise = new Promise(function(resolve, reject) {
        console.log("Compressing Project...");
        output_file = helpers.add_prefix_to_file(project.last_processed, 'c');
        console.log("File size: " + (fs.statSync(project.last_processed).size / 1000000).toFixed(2) + " MB(s)");

        hbjs.spawn({ input: project.last_processed, output: output_file })
            .on('error', err => {
                // invalid user input, no video found etc
                console.log("Compression Failed: " + err);
                reject(project);
            })
            .on('progress', progress => {
                process.stdout.write(
                    "Percent complete: " + progress.percentComplete + " | ETA: " + progress.eta + "\r"
                )
            })
            .on('complete', function(output) {
                project.compressed_file = output_file;
                project.last_processed = output_file;
                process.stdout.write("File size after compression: " + (fs.statSync(project.last_processed).size / 1000000).toFixed(2) + " MB(s)\n");
                resolve(project);

            })

    });
    return promise;
}