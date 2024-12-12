const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config();

const bcryptSalt = parseInt(process.env.BCRYPT_SALT) || 10;

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    twoFAEnabled: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date, 
      default: Date.now
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const hash = await bcrypt.hash(this.password, bcryptSalt);
  this.password = hash;
  next();
});

module.exports = mongoose.model("User", userSchema);
