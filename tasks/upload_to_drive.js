const fs = require('fs');
const readline = require('readline');
const google = require('googleapis').google;
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './credentials/credentials.json';

function authorize(drive_object) {
    var promise = new Promise(function(resolve, reject) {
        // Load client secrets from a local file.
        fs.readFile('./credentials/client_secret.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.

            credentials = JSON.parse(content);
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getAccessToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                drive_object.auth = oAuth2Client;

                resolve(drive_object);
            });
        });

    })
    return promise;
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return callback(err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

var init = function(project) {

    var promise = new Promise(function(resolve, reject) {

        console.log("Uploading files to drive...");

        drive_object = {};
        drive_object.project = project;

        resolve(drive_object);
    })

    return promise;

}

var upload_file = function(tag, filepath, drive_object) {
    var promise = new Promise(function(resolve, reject) {

        if (filepath) {

            const drive = google.drive({ version: 'v3', auth: drive_object.auth });

            p = filepath;

            filepath = p;
            filename = p.split('/')[p.split('/').length - 1];

            console.log("[upload_to_drive] Filepath: " + p);
            console.log("[upload_to_drive] Uploading " + tag + " file...");


            var fileMetadata = { 'name': filename, };
            var media = { mimeType: 'video/mp4', body: fs.createReadStream(filepath), shared: true };


            drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: ['id', 'webViewLink']
            }, function(err, file) {
                if (err) {
                    console.error("File Upload failed: " + err);
                    reject(drive_object);

                } else {

                    fileId = file.data.id;
                    // Make file public
                    var body = {
                        'type': 'anyone',
                        'role': 'reader'
                    };
                    drive.permissions.create({
                        'fileId': fileId,
                        'resource': body
                    }, function(err, file) {
                        if (err) {
                            // Handle error
                            console.error(err);
                        } else {
                            console.log("[upload_to_drive] - " + tag + " - Upload Completed at: https://drive.google.com/file/d/" + fileId);
                            drive_object.project[tag + "_drive_file"] = "https://drive.google.com/uc?export=download&id=" + fileId;
                            resolve(drive_object);
                        }
                    })
                }
            });
        } else {
            console.log("WARN: " + tag + " file does not exist, not uploading.");
            resolve(project);
        }


    })
    return promise;
}

module.exports = function(project) {
    var promise = new Promise((resolve, reject) => {

        init(project)
            .then(authorize)
            .then(upload_file.bind(null, 'music', project.added_music_file))
            .then(upload_file.bind(null, 'watermark', project.watermarked_file))
            .then(function(drive_object) {
                console.log("File(s) Uploaded.");
                resolve(project)
            })
    })
    return promise;
};