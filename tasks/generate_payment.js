var payumoney = require('payumoney-node');

MERCHANT_KEY = "q5tg7PPU"
MERCHANT_SALT = "DTWo35XeRE"
AUTHORIZATION_HEADER = "J/fu+JRgwxezPaTCnVntarkFeA1s9Djs6gPu9HMEdgc="

payumoney.setKeys(MERCHANT_KEY, MERCHANT_SALT, AUTHORIZATION_HEADER);

payumoney.isProdMode(true);

module.exports = function(project) {
    var promise = new Promise(function(resolve, reject) {

        console.log("Generating payment...");
        var paymentData = {
            productinfo: project.video_title,
            txnid: project.user_name + "R70",
            amount: project.price*0.7,
            email: "ramnani777@gmail.com",
            phone: project.user_phone,
            lastname: project.user_last_name,
            firstname: project.user_name,
            surl: project.music_drive_file, //"http://localhost:3000/payu/success"
            furl: "https://bulaava.in", //"http://localhost:3000/payu/fail"
        };
        payumoney.makePayment(paymentData, function(error, response) {
            if (error) {
                // Some error
                console.log(error);
            } else {
                // Payment redirection link
                project.payment_link = response;
                resolve(project)
            }
        });
    });
    return promise;
}