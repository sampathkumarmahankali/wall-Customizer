require('dotenv').config();

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email configuration
const emailConfig = {
  from: {
    email: process.env.FROM_EMAIL || 'noreply@wallora.com',
    name: 'Wallora Team'
  },
  templates: {
    welcome: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Welcome email template ID
    passwordReset: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Password reset template ID
    newsletter: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Newsletter template ID
    activityAlert: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // Activity alert template ID
  }
};

// Email templates (fallback if SendGrid templates are not used)
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Wallora! 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Wallora!</h1>
          <p style="margin: 10px 0; font-size: 18px;">Your creative journey starts here</p>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! 👋</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Wallora, your ultimate wall customization platform! We're excited to have you on board.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">🎨 What you can do:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Create stunning wall designs with AI assistance</li>
              <li>Customize your living spaces with our tools</li>
              <li>Save and manage your design sessions</li>
              <li>Export your creations in high quality</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/create" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Start Creating Now
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 Wallora. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (resetLink, userName) => ({
    subject: 'Reset Your Wallora Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Password Reset</h1>
          <p style="margin: 10px 0; font-size: 18px;">Secure your account</p>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Wallora account.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons. If you didn't request this password reset, 
            please ignore this email and your password will remain unchanged.
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your password or this reset link with anyone.
            </p>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 Wallora. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  activityAlert: (userName, activityType, activityDetails) => ({
    subject: `New Activity on Wallora - ${activityType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Activity Alert</h1>
          <p style="margin: 10px 0; font-size: 18px;">Your wall design activity</p>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We noticed some activity on your Wallora account that you might want to know about.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">📊 Activity Summary:</h3>
            <p style="color: #666; line-height: 1.6;"><strong>Type:</strong> ${activityType}</p>
            <p style="color: #666; line-height: 1.6;"><strong>Details:</strong> ${activityDetails}</p>
            <p style="color: #666; line-height: 1.6;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Your Profile
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 Wallora. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  newsletter: (userName, newsletterContent) => ({
    subject: 'Wallora Newsletter - Latest Updates & Tips',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Wallora Newsletter</h1>
          <p style="margin: 10px 0; font-size: 18px;">Stay updated with the latest features</p>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Here's what's new at Wallora this week!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${newsletterContent}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/create" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Start Creating
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 Wallora. All rights reserved.</p>
          <p style="margin-top: 10px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe" style="color: #ccc;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `
  })
};

module.exports = {
  sgMail,
  emailConfig,
  emailTemplates
}; 