const crypto = require("crypto");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const User = require("../Models/user.mongo");
const Token = require("../Models/token.mongo");
const validator = require("email-validator"); // for email validation
const passwordValidator = require("password-validator");
const sendEmail = require("../Utils/email/sendEmail.email");
const { sendOTP } = require("../Controllers/sendOTP.controller");

require("dotenv").config();

const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT) || 10;
const clientURL = process.env.CLIENT_URL;
const JWTSecret = process.env.JWT_SECRET;
const tokenExpiryTime = 15 * 60 * 1000; // 15 minutes for password reset token

let schema = new passwordValidator();
//define the password schema
schema
  .is()
  .min(8)
  .is()
  .max(62)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .not()
  .spaces()
  .is()
  .not()
  .oneOf(["password", "Password", "password123", "Password123"]);

const login = async (email, password, req, res) => {
  try {
    // validate email
    const isValid = validator.validate(email);
    if (!isValid) {
      return {
        status: 400,
        message: "Invalid email, please try again or signup",
      };
    }

    //validate password
    let validatedPassword = schema.validate(password);
    if (!validatedPassword) {
      return { status: 400, message: "Invalid password, please try again" };
    }

    let user = await User.findOne({ email });
    if (!user) {
      return { status: 400, message: "User not registered" };
    }

    // compare password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { status: 400, message: "Incorrect password, please try again" };
    }

    // generate a new token and encrypt
    let token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(token, bcryptSaltRounds);

    await new Token({
      userId: user._id,
      token: tokenHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + tokenExpiryTime,
    }).save();

    // send OTP
    await sendOTP(req, res, email);

    return { status: 200, user };
    
  } catch (err) {
    console.log(err);
    return { status: 500, message: "Login failed, please try again" };
  }
};

const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    // validate email
    let validatedEmail = validator.validate(email);
    if (!validatedEmail) {
      return {
        status: 400,
        message: "Invalid email, please try again or signup",
      };
    }

    // validate password
    let validatedPassword = schema.validate(password);
    if (!validatedPassword) {
      return { status: 400, message: "Invalid password, please try again" };
    }

    //check if user is already registered
    let user = await User.findOne({ email });
    if (user) {
      return { status: 400, message: "Email already exists" };
    }

    user = new User({
      email,
      password,
    });

    const token = JWT.sign({ id: user._id }, JWTSecret, { expiresIn: "1h" });
    await user.save();

    //send confirmation email

    new Token({
      userId: user.id,
      token,
    }).save();

    return {
      userId: user._id,
      email: user.email,
      token: token,
    };
  } catch (error) {
    return { status: 500, message: "Server error", error: error.message };
  }
};

const requestPasswordReset = async (email) => {
  // validate email
  let validatedEmail = await validate(email);
  if (!validatedEmail.valid) {
    return {
      status: 400,
      message: "Invalid email, please try again or signup",
    };
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { status: 400, message: "User does not exist" };
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, bcryptSaltRounds);

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
      expiresAt: Date.now() + tokenExpiryTime,
    }).save();

    const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
    sendEmail(
      user.email,
      "Password Reset Request",
      { link: link },
      "../Utils/email/templates/requestResetPassword.handlebars"
    );
    return link;
  } catch (error) {
    return { status: 400, message: "Server error", error: error.message };
  }
};

const resetPassword = async (token, email, password) => {
  // validate email
  let validatedEmail = await validate(email);
  if (!validatedEmail.valid) {
    return {
      status: 400,
      message: "Invalid email, please try again",
    };
  }

  // validate password
  let validatedPassword = schema.validate(password);
  if (!validatedPassword) {
    return { status: 400, message: "Invalid password, please try again" };
  }
  try {
    let passwordResetToken = await Token.findOne({ email });
    if (!passwordResetToken) {
      return {
        status: 400,
        message: "Invalid or expired password reset token",
      };
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return {
        status: 400,
        message: "Invalid or expired password reset token",
      };
    }

    if (Date.now() > passwordResetToken.expiresAt) {
      return { status: 400, message: "Token has expired" };
    }

    const hash = await bcrypt.hash(password, bcryptSaltRounds);
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hash } },
      { new: true }
    );

    const user = await User.findOne({ email });
    sendEmail(
      user.email,
      "Password Reset Successfully",
      {},
      "../Utils/email/templates/resetPassword.handlebars"
    );
    await passwordResetToken.deleteOne();
    return true;
  } catch (error) {
    console.log("server error", error.message);
    return { status: 500, message: "Server error", error: error.message };
  }
};

module.exports = {
  login,
  signup,
  requestPasswordReset,
  resetPassword,
};
