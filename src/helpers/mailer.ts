import nodemailer from 'nodemailer'
import User from '@/models/userModel'
import bcryptjs from 'bcryptjs';

export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        // create a hashed token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)
        console.log
        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
                { 
                    $set: {verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 }})
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId,
                { 
                    $set: { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 }})
        }

        // configure mail transport
        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "e370c9e3e424ad",
              pass: "********e283"
            }
          });

        const mailOptions = {
            from: 'hitesh@hitesh.ai',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`
        }

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
}
 