const fs = require('fs');
const ejs = require('ejs');
const readline = require('readline');

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

function authorize(mail_object) {
    var promise = new Promise(function(resolve, reject) {
        console.log("[send_email] Authorizing GMail API...");

        // Load client secrets from a local file.
        fs.readFile('./credentials/client_secret_gmail.json', function processClientSecrets(err, content) {
            if (err) { return console.log('Error loading client secret file: ' + err); }
            // Authorize a client with the loaded credentials, then call the
            // Gmail API.
            credentials = JSON.parse(content);
            var clientSecret = credentials.installed.client_secret;
            var clientId = credentials.installed.client_id;
            var redirectUrl = credentials.installed.redirect_uris[0];
            // var auth = new googleAuth();
            var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
            fs.readFile(TOKEN_PATH, function(err, token) {
                if (err) return getNewToken(oauth2Client, callback);
                oauth2Client.credentials = JSON.parse(token);
                mail_object.auth = oauth2Client;
                resolve(mail_object);
            });
        });

    })
    return promise;
}

function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

function makeBody(to, from, subject, message) {

}

function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}


var prepare_body = function(mail_object) {
    var promise = new Promise(function(resolve, reject) {


        console.log("[send_email] Preparing Mail Body...");

        var templateString = fs.readFileSync('./email_templates/video_delivery.ejs', 'utf-8');

        var content = ejs.render(templateString, { data: mail_object.project });

        var str = ["Content-Type: text/html; charset=\"UTF-8\"\n",
            "MIME-Version: 1.0\n",
            "Content-Transfer-Encoding: 7bit\n",
            "to: ", mail_object.project.user_email, "\n",
            "from: ", 'support@bulaava.in', "\n",
            "subject: ", 'BULAAVA VIDEO DELIVERY', "\n\n",
            content
        ].join('');

        var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

        mail_object.body = encodedMail;
        resolve(mail_object);

    })
    return promise;

}

var request_api = function(mail_object) {
    var promise = new Promise(function(resolve, reject) {
        console.log("[send_email] Requesting GMail API...");
        var gmail = google.gmail('v1');
        gmail.users.messages.send({
                auth: mail_object.auth,
                userId: 'me',
                resource: {
                    raw: mail_object.body
                }
            },
            function(err, response) {
                if (err) {
                    console.log("[send_email] Sending mail failed: " + err);
                    reject(mail_object);
                } else {
                    resolve(mail_object);
                }
            });
    })
    return promise;
}

var init = function(project) {

    var promise = new Promise(function(resolve, reject) {
        console.log("Emailing user...");

        mail_object = {};

        mail_object.project = project;
        resolve(mail_object);

    })
    return promise;
}


module.exports = function(project) {
    var promise = new Promise((resolve, reject) => {

        init(project)
            .then(authorize)
            .then(prepare_body)
            .then(request_api)
            .then(function(project) {
                // console.log(mail_object);
                console.log("Mail Sent.");
                resolve(project)
            })
    })
    return promise;
};