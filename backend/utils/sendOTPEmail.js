const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {                  //Sends code to email for authentication (MFA)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Missing Persons DB" <${process.env.EMAIL_USER}>`,             
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>This code will expire in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;
