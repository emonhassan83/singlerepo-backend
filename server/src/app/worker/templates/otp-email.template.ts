export const getOtpEmailTemplate = (name: string, otp: string, expiresAt: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p>Dear ${name},</p>
      <p>Your one-time verification code is:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 20px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px; color: #333;">
        ${otp}
      </div>
      <p>This code will expire at <strong>${expiresAt}</strong>. Please do not share this OTP with anyone.</p>
      <br>
      <p>Best regards,</p>
      <p>Split Ride Team</p>
    </div>
  `;
};
