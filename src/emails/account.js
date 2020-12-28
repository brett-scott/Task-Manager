const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: 'Welcome to Task Manager!',
        text: `Welcome ${name} to Task Manager! If you have any issues please feel free to send an email.`
    }).catch((e) => {
        console.log(e)
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}, let us know if there is anything we could of done to keep you on board.`
    }).catch((e) => {
        console.log(e)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}