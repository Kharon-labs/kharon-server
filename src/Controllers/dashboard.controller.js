const express = require("express");
const User = require("../Models/user.mongo");

async function dashboard(req, res) {
  try {
    const email = req.user?.email || req.query.email;
    
    if(!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    console.log('user:', email);
    

    const user = await User.findOne({ email }).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = {
      email: user.email,
      username: user.username,
      twoFAEnabled: user.twoFAEnabled,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    return res
      .status(200)
      .json({
        message: "User dashboard retrieved successfully",
        data: userDetails,
      });
  } catch (err) {
    console.log("Error fetching user dashboard:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { dashboard };