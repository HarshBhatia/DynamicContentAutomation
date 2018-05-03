const helpers = require('./helpers');
const ffmpeg = require('fluent-ffmpeg');


module.exports = function(project) {
    var promise = new Promise(function(resolve, reject) {
        console.log("Addding music to project...");
        output_file = helpers.add_prefix_to_file(project.last_processed, 'm');
        ffmpeg()
            .input(project.last_processed)
            .input(project.music_file)
            .complexFilter([
                '[1:0] amix=inputs=1',
            ])
            .outputOptions('-map', '0:0', '-shortest')
            .audioCodec('aac')
            .videoCodec('copy')
            .on('error', function(err, stdout, stderr) {
                console.log('Adding Music Failed: ' + err.message);
                reject(project);
            })
            .on('end', function() {
                project.added_music_file = output_file;
                project.last_processed = output_file;
                resolve(project);
            })
            .save(output_file)
    });
    return promise;
}