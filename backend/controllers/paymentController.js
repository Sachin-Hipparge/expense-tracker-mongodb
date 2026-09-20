const mongoose = require("mongoose");
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const User = require("../models/User");
const Order = require("../models/Order");

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);


// ==================== PURCHASE PREMIUM ====================

async function purchasePremium(req, res) {

    const userId = req.userId;

    try {

        // Get logged-in user

        const user =
            await User.findById(userId);


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        const orderId =
            "ORDER_" + Date.now();


        // Create Cashfree order

        const request = {

            order_id: orderId,

            order_amount: 499,

            order_currency: "INR",

            customer_details: {

                customer_id:
                    user._id.toString(),

                customer_name:
                    user.name,

                customer_email:
                    user.email,

                customer_phone:
                    "9999999999"

            },

            order_meta: {

                return_url:
                    "http://127.0.0.1:5500/frontend/expense.html?order_id={order_id}"

            }

        };


        const response =
            await cashfree.PGCreateOrder(request);


        const paymentSessionId =
            response.data.payment_session_id;


        // Save order in MongoDB

        await Order.create({

            orderId,

            userId,

            amount: 499,

            status: "PENDING"

        });


        res.status(200).json({

            paymentSessionId,

            orderId

        });


    } catch (error) {

        console.log(
            "========== CASHFREE ERROR =========="
        );

        console.log(
            error.response?.data ||
            error.response ||
            error
        );

        console.log(
            "===================================="
        );


        res.status(500).json({

            message: "Cashfree Error",

            error:
                error.response?.data ||
                error.message

        });

    }

}


// ==================== VERIFY PAYMENT ====================

async function verifyPayment(req, res) {

    const orderId =
        req.params.orderId;

    const userId =
        req.userId;


    try {

        // Check that order belongs to user

        const order =
            await Order.findOne({
                orderId,
                userId
            });


        if (!order) {

            return res.status(404).json({

                message: "Order not found"

            });

        }


        // Ask Cashfree about payment

        const response =
            await cashfree.PGOrderFetchPayments(
                orderId
            );


        const payments =
            response.data;


        if (
            !payments ||
            payments.length === 0
        ) {

            return res.status(200).json({

                message: "Payment pending"

            });

        }


        const payment =
            payments[0];


        // ==================== SUCCESS ====================

        if (
            payment.payment_status ===
            "SUCCESS"
        ) {

            // MongoDB transaction

            const session =
                await mongoose.startSession();

            session.startTransaction();


            try {

                // Update order

                await Order.findOneAndUpdate(
                    { orderId },
                    {
                        status: "SUCCESS"
                    },
                    { session }
                );


                // Make user premium

                await User.findByIdAndUpdate(
                    userId,
                    {
                        isPremium: true
                    },
                    { session }
                );


                // Commit

                await session.commitTransaction();

                session.endSession();


                res.status(200).json({

                    message:
                        "Transaction successful",

                    isPremium: true

                });


            } catch (transactionError) {

                await session.abortTransaction();
                session.endSession();

                throw transactionError;

            }

        }


        // ==================== FAILED ====================

        else if (
            payment.payment_status ===
            "FAILED"
        ) {

            await Order.findOneAndUpdate(
                { orderId },
                {
                    status: "FAILED"
                }
            );


            res.status(200).json({

                message:
                    "TRANSACTION FAILED"

            });

        }


        // ==================== PENDING ====================

        else {

            res.status(200).json({

                message:
                    "Payment pending"

            });

        }


    } catch (error) {

        console.log(
            "Payment verification error:",
            error
        );


        res.status(500).json({

            message:
                "Could not verify payment"

        });

    }

}


module.exports = {

    purchasePremium,

    verifyPayment

};