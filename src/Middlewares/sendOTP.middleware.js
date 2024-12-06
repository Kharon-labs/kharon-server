const { sendOTP } = require('../Controllers/sendOTP.controller');

const sendOTPWrapper = async (req, res) => {
    try {
      const { email } = req.body;
      const response = await sendOTP(email);
      return res.status(200).json(response);
    } catch (err) {
      console.error("Error in sendOTP:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  module.exports = { sendOTPWrapper };
  