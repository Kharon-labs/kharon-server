const mongoose = require("mongoose");

const blackListedTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 43200, // token deletes in 12 hours
    }
});

module.exports = mongoose.model("blacklistedToken", blackListedTokenSchema);