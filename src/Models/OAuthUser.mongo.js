const mongoose = require("mongoose");

const OAuthUserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OAuthUser", OAuthUserSchema);
