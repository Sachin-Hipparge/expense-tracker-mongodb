const SibApiV3Sdk = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const ForgotPasswordRequest = require("../models/ForgotPasswordRequest");


async function forgotPassword(req, res) {

    console.log("FORGOT PASSWORD API HIT");

    const { email } = req.body;

    console.log("Email received:", email);

    if (!email) {

        return res.status(400).json({
            message: "Email is required"
        });

    }

    try {

        // 1. Find the user

        const user =
            await User.findOne({
                email
            });


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        // 2. Generate unique UUID

        const requestId =
            uuidv4();


        console.log(
            "Generated reset request ID:",
            requestId
        );


        // 3. Save reset request in MongoDB

        await ForgotPasswordRequest.create({

            _id: requestId,

            userId: user._id,

            isActive: true

        });


        console.log(
            "Forgot password request saved"
        );


        // 4. Create reset URL

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password.html?id=${requestId}`;


        console.log(
            "Reset URL:",
            resetUrl
        );


        // 5. Configure Brevo

        const client =
            SibApiV3Sdk.ApiClient.instance;

        const apiKey =
            client.authentications["api-key"];

        apiKey.apiKey =
            process.env.SENDINBLUE_API_KEY;


        const sendSmtpEmail =
            new SibApiV3Sdk.SendSmtpEmail();


        sendSmtpEmail.sender = {

            email:
                process.env.SENDER_EMAIL,

            name:
                "Expense Tracker"

        };


        sendSmtpEmail.to = [

            {
                email:
                    user.email,

                name:
                    user.name
            }

        ];


        sendSmtpEmail.subject =
            "Reset Your Expense Tracker Password";


        sendSmtpEmail.textContent = `
Hello ${user.name},

You requested a password reset for your Expense Tracker account.

Click the link below to reset your password:

${resetUrl}

This link can only be used once.

Thank you,
Expense Tracker
        `;


        // 6. Send email

        const apiInstance =
            new SibApiV3Sdk.TransactionalEmailsApi();


        await apiInstance.sendTransacEmail(
            sendSmtpEmail
        );


        console.log(
            "Brevo email sent successfully"
        );


        res.status(200).json({

            message:
                "Password reset email sent successfully"

        });


    } catch (error) {

        console.log(
            "Forgot password error:",
            error
        );


        res.status(500).json({

            message:
                "Could not process password reset"

        });

    }

}


async function showResetPasswordPage(req, res) {

    const requestId =
        req.params.id;

    try {

        const request =
            await ForgotPasswordRequest.findOne({

                _id: requestId,

                isActive: true

            });


        if (!request) {

            return res.status(400).send(
                "Invalid or expired password reset link"
            );

        }


        // Reset request is valid

        res.redirect(
            `http://127.0.0.1:5500/frontend/reset-password.html?id=${requestId}`
        );


    } catch (error) {

        console.log(
            "Reset link verification error:",
            error
        );

        res.status(500).send(
            "Could not verify reset link"
        );

    }

}


async function resetPassword(req, res) {

    const requestId =
        req.params.id;

    const { password } =
        req.body;


    if (!password) {

        return res.status(400).json({

            message:
                "Password is required"

        });

    }


    try {

        // 1. Find active reset request

        const request =
            await ForgotPasswordRequest.findOne({

                _id: requestId,

                isActive: true

            });


        // Invalid or already-used link

        if (!request) {

            return res.status(400).json({

                message:
                    "Invalid or expired password reset link"

            });

        }


        const userId =
            request.userId;


        // 2. Hash new password

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // 3. Update user's password

        await User.findByIdAndUpdate(

            userId,

            {
                password:
                    hashedPassword
            }

        );


        // 4. Make reset link inactive

        await ForgotPasswordRequest.findByIdAndUpdate(

            requestId,

            {
                isActive: false
            }

        );


        // 5. Success

        res.status(200).json({

            message:
                "Password reset successfully"

        });


    } catch (error) {

        console.log(
            "Reset password error:",
            error
        );

        res.status(500).json({

            message:
                "Could not reset password"

        });

    }

}


module.exports = {

    forgotPassword,

    showResetPasswordPage,

    resetPassword

};