const uploadToDrive = require('./tasks/upload_to_drive');
const sendEmail = require('./tasks/send_email');
const generatePaymentLink = require('./tasks/generate_payment')
const compressVideo = require('./tasks/compress_video')
const addMusic = require('./tasks/add_music')
const addWatermark = require('./tasks/add_watermark')


WATERMARK_PATH = 'vp/watermark.png';
VIDEO_PATH = "vp/rv2.mp4";
MUSIC_PATH = "vp/mangal.mp4";


var init = function() {
    var promise = new Promise(function(resolve, reject) {
        console.log("Initializing Project...");
        project = {
            rendered_file: VIDEO_PATH,
            video_title: "GREEN ETHNIC",
            user_email: "ramnani777@gmail.com",
            user_phone: "9393888821",
            user_name: "Ramoji",
            user_last_name: "",
            path: "output/",
            uid: "ABC",
            music_file: MUSIC_PATH,
            last_processed: VIDEO_PATH,
            drive_file: "",
            price: 1999,
            // added_music_file: "vp/rvideos_c_m.mp4",
            // watermarked_file: "vp/rvideos_m_w.mp4",
            // music_drive_file: 'https://drive.google.com/uc?export=download&id=1jtLNP2BlMQSR8n5I7rtLNcAmRX4i9q7v',
            // watermark_drive_file: 'https://drive.google.com/uc?export=download&id=1T10FC8FCSJVV4JQbMcPoEk731HWssXs8',
            payment_link: "https://pmny.in/QIoLBRFzG1px"
        }
        resolve(project);
    });
    return promise;
};



init()
    .then(compressVideo)
    .then(addMusic)
    .then(addWatermark)
    .then(uploadToDrive)
    .then(generatePaymentLink)
    .then(sendEmail)
    .then(function(project) {
        console.log("Completed!");
        console.log(project);
        // console.log("Project Object:");
    }).catch(err => {
        console.log("Proejct Failed!");
        console.log(err);
    })