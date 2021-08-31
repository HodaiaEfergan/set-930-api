const axios=require("axios").default;
const mailgun = require("mailgun-js");
// const nodemailer = require("nodemailer");
//
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'gtag930project@gmail.com',
//         pass: '0524289665'
//     }
// });
//
// const mailOptions = {
//     from: 'gtag930project@gmail.com',
//     to: "hodaiaefergan@gmail.com",
//     subject: "subject",
//     text: 'That was easy!'
// };
// transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Email sent: ' + info.response);
//     }
// });
//
module.exports.sendSMS = async function  sendSMS(phone,message){
    const apiKey = 'WEDB53wYXpP8llpnm/23Ig==';
    let url = 'http://api.pulseem.com/api/v1/SmsApi/SendSms';
    let body = {
        "SendId": new Date().getTime(),
        "IsAsync": false,
        "SMSSendData": {
            "FromNumber": "set-930",
            "ToNumberList": [phone],
            "ReferenceList": ["10"],
            "TextList": [message],
            "IsAutomaticUnsubscribeLink": false
        }
    }

    let res = axios.post(url,body,{
        headers:{
            'APIKEY':apiKey
        }
    });

    console.log(res.data);
}
module.exports.sendEmail = async function  sendEmail(mail,message) {
    const apiKey = 'WEDB53wYXpP8llpnm/23Ig==';
    let url = 'http://api.pulseem.com/api/v1/EmailApi/SendEmail';
    let body =
    {
        "SendId": "mysendid",
        "IsAsync": false,
        "EmailSendData": {
        "FromEmail": "hodaia.h@8tec.co.il",
            "FromName": "8tec",
            "Subject": [
            message
        ],

            "languageCode": 1,
            "ToEmails": [
            mail


        ],
            "ToNames": [
            "toNames1"

        ],
            "ExternalRef": [
            "ExternalRef1"

        ]

    }
    }

    let res = axios.post(url, body, {
        headers: {
            'APIKEY': apiKey
        }
    });
}
// You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.





