const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gtag930project@gmail.com',
        pass: '0524289665'
    }
});

const mailOptions = {
    from: 'gtag930project@gmail.com',
    to: "hodaiaefergan@gmail.com",
    subject: "subject",
    text: 'That was easy!'
};
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});

