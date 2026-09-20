const User = require("../models/User");

async function getLeaderboard(req, res) {
    const userId = req.userId;

    try {
        const currentUser = await User.findById(userId)
            .select("isPremium");

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!currentUser.isPremium) {
            return res.status(403).json({
                message: "Premium membership required"
            });
        }

        const users = await User.find()
            .select("name totalExpense")
            .sort({ totalExpense: -1 })
            .lean();

        const leaderboard = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            totalExpense: user.totalExpense
        }));

        res.status(200).json(leaderboard);

    } catch (error) {
        console.log("Leaderboard error:", error);

        res.status(500).json({
            message: "Database error"
        });
    }
}

module.exports = {
    getLeaderboard
};