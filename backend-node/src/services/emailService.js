const nodemailer = require("nodemailer");

// Configure email service (you can use Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || ""
  }
});

/**
 * Send account deletion notification email
 * @param {string} email - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} reason - Reason for account deletion
 * @param {string} adminName - Admin's name
 */
async function sendAccountDeletionEmail(email, fullName, reason, adminName) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .reason-box { background: white; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Deleted</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <div class="alert">
                <strong>Important Notice:</strong> Your account with WMT Mobile App has been deleted by an administrator.
              </div>

              <h3>Deletion Details:</h3>
              <div class="reason-box">
                <p><strong>Reason for Account Deletion:</strong></p>
                <p>${reason || 'No specific reason provided'}</p>
              </div>

              <p><strong>Administrator:</strong> ${adminName}</p>
              <p><strong>Deletion Date:</strong> ${new Date().toLocaleString()}</p>

              <h3>What This Means:</h3>
              <ul>
                <li>Your account and all associated data have been removed from our system</li>
                <li>You will no longer be able to login with your phone number</li>
                <li>Any pending appointments or transactions have been cancelled</li>
                <li>Historical records may be retained for compliance purposes</li>
              </ul>

              <h3>Need Help?</h3>
              <p>If you believe this is a mistake or have questions, please contact our support team at support@wmtapp.com</p>

              <div class="footer">
                <p>This is an automated message from WMT Mobile App. Please do not reply to this email.</p>
                <p>&copy; 2026 WMT Mobile App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Account Deletion Notification - WMT Mobile App",
      html: htmlContent,
      text: `Dear ${fullName},\n\nYour account with WMT Mobile App has been deleted by an administrator.\n\nReason: ${reason || 'No specific reason provided'}\nAdministrator: ${adminName}\n\nIf you believe this is a mistake, contact support@wmtapp.com`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Send account locked email
 */
async function sendAccountLockedEmail(email, fullName, reason, adminName) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Suspended</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              <div class="alert">
                Your account has been suspended by an administrator.
              </div>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>Contact support@wmtapp.com for more information.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Account Suspended - WMT Mobile App",
      html: htmlContent
    });
  } catch (error) {
    console.error("Failed to send account locked email:", error);
    throw error;
  }
}

module.exports = {
  sendAccountDeletionEmail,
  sendAccountLockedEmail
};
