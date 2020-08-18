const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'aalakbarov97@gmail.com',
        subject: 'Welcome Text',
        text: `Welcome to Task App ${name}. Let me know how you handle app.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'aalakbarov97@gmail.com',
        subject: 'Cancel Reason',
        text: 'Could you send reasons that you canceled membership'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}