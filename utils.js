const nodemailer = require("nodemailer");


module.exports.sendEmail = async function (subject, message, recipient) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'gtag930project@gmail.com',
            pass: '0524289665'
        }
    });

    const mailOptions = {
        from: 'gtag930project@gmail.com',
        to: recipient,
        subject: subject,
        text: 'That was easy!'
    };
    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports.sendSMS = async function (message, phone) {

};
