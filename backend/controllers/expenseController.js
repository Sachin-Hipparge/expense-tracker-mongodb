const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const User = require("../models/User");

const { categorizeExpense } =
    require("../services/aiService");


// ==================== ADD EXPENSE ====================

async function addExpense(req, res) {

    const { amount, description, note } = req.body;
    const userId = req.userId;

    try {

        // Categorize expense using Gemini AI

        const category =
            await categorizeExpense(description);


        // Start MongoDB transaction

        const session =
            await mongoose.startSession();

        session.startTransaction();


        try {

            // Create expense

            await Expense.create(
                [
                    {
                        amount,
                        description,
                        category,
                        userId,
                        note
                    }
                ],
                { session }
            );


            // Update user's total expense

            await User.findByIdAndUpdate(
                userId,
                {
                    $inc: {
                        totalExpense: amount
                    }
                },
                { session }
            );


            // Commit transaction

            await session.commitTransaction();

            session.endSession();


            res.status(201).json({
                message: "Expense added successfully",
                category: category
            });


        } catch (transactionError) {

            await session.abortTransaction();
            session.endSession();

            throw transactionError;
        }


    } catch (error) {

        console.log(
            "Add expense error:",
            error
        );

        res.status(500).json({
            message: "Failed to add expense"
        });

    }

}


// ==================== GET EXPENSES ====================

async function getExpenses(req, res) {

    const userId = req.userId;

    try {

       const expenses = await Expense.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

const formattedExpenses = expenses.map((expense) => ({
    id: expense._id.toString(),
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
    note: expense.note,
    createdAt: expense.createdAt
}));

res.status(200).json(formattedExpenses);


    } catch (error) {

        console.log(
            "Get expenses error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch expenses"
        });

    }

}


// ==================== DELETE EXPENSE ====================

async function deleteExpense(req, res) {

    const expenseId = req.params.id;
    const userId = req.userId;

    try {

        // Start MongoDB transaction

        const session =
            await mongoose.startSession();

        session.startTransaction();


        try {

            // Find expense belonging to current user

            const expense =
                await Expense.findOne({
                    _id: expenseId,
                    userId: userId
                }).session(session);


            if (!expense) {

                await session.abortTransaction();
                session.endSession();

                return res.status(403).json({
                    message:
                        "You cannot delete this expense"
                });

            }


            // Store amount before deleting

            const amount = expense.amount;


            // Delete expense

            await Expense.deleteOne(
                {
                    _id: expenseId,
                    userId: userId
                },
                { session }
            );


            // Reduce total expense

            await User.findByIdAndUpdate(
                userId,
                {
                    $inc: {
                        totalExpense: -amount
                    }
                },
                { session }
            );


            // Commit transaction

            await session.commitTransaction();

            session.endSession();


            res.status(200).json({
                message:
                    "Expense deleted successfully"
            });


        } catch (transactionError) {

            await session.abortTransaction();
            session.endSession();

            throw transactionError;
        }


    } catch (error) {

        console.log(
            "Delete expense error:",
            error
        );

        res.status(500).json({
            message: "Failed to delete expense"
        });

    }

}


module.exports = {
    addExpense,
    getExpenses,
    deleteExpense
};