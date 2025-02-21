import nodemailer from 'nodemailer'

async function sendotpfunc(otp, mailto) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'salludon@gmail.com',
            pass: 'nobr oais etho dixd'
        }
    });
      
    const mailOptions = {
        from: 'salludon@gmail.com',
        to: `${mailto}`,
        subject: 'OTP to Reset Password',
        text: `Agli bar se mat bhulna, bar bar nahi bhejenge..., Apka OTP: ${otp}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });    
}
export default sendotpfunc;