import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

export async function createTransporter() {
  const settings = await getSettings();

  if (settings.mailMethod === "sendmail") {
    return nodemailer.createTransport({
      sendmail: true,
      newline: "unix",
      path: "/usr/sbin/sendmail",
    });
  }

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
    throw new Error("SMTP settings are not fully configured in the Admin Panel.");
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.encryption === "ssl", // true for 465, false for other ports
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const settings = await getSettings();
    const transporter = await createTransporter();

    const fromAddress = `"${settings.fromName || settings.storeName || 'SnapShop'}" <${settings.fromEmail || settings.smtpUser}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// HTML TEMPLATES
// -------------------------------------------------------------

const getBaseTemplate = (title: string, content: string, storeName: string = "SnapShop", storeUrl: string = "#") => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8fafc;
        margin: 0;
        padding: 0;
        color: #334155;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }
      .header {
        background-color: #d31e28;
        padding: 30px 20px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 1px;
      }
      .body {
        padding: 40px 30px;
      }
      .footer {
        background-color: #0f172a;
        color: #94a3b8;
        text-align: center;
        padding: 20px;
        font-size: 13px;
      }
      .footer a {
        color: #d31e28;
        text-decoration: none;
      }
      .btn {
        display: inline-block;
        background-color: #0f172a;
        color: #ffffff !important;
        padding: 14px 28px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      h2 {
        color: #0f172a;
        margin-top: 0;
      }
      p {
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${storeName}</h1>
      </div>
      <div class="body">
        <h2>${title}</h2>
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
        <p>Visit us at <a href="${storeUrl}">${storeUrl}</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const getWelcomeEmailHtml = (username: string, storeName: string, storeUrl: string, customTemplate?: string) => {
  if (customTemplate) {
    return customTemplate
      .replace(/{{username}}/g, username)
      .replace(/{{storeName}}/g, storeName)
      .replace(/{{storeUrl}}/g, storeUrl);
  }
  const content = `
    <p>Hi <strong>${username}</strong>,</p>
    <p>Welcome to ${storeName}! We're absolutely thrilled to have you join our community.</p>
    <p>Discover our latest collections and find exactly what you've been looking for. We promise to deliver the best quality and service.</p>
    <center>
      <a href="${storeUrl}" class="btn">Start Shopping Now</a>
    </center>
    <p>If you have any questions or need assistance, feel free to reply to this email.</p>
  `;
  return getBaseTemplate("Welcome to the Family!", content, storeName, storeUrl);
};

export const getPasswordResetHtml = (resetUrl: string, storeName: string, storeUrl: string, customTemplate?: string) => {
  if (customTemplate) {
    return customTemplate
      .replace(/{{resetUrl}}/g, resetUrl)
      .replace(/{{storeName}}/g, storeName)
      .replace(/{{storeUrl}}/g, storeUrl);
  }
  const content = `
    <p>You recently requested to reset your password for your ${storeName} account.</p>
    <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
    <center>
      <a href="${resetUrl}" class="btn">Reset My Password</a>
    </center>
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
  `;
  return getBaseTemplate("Reset Your Password", content, storeName, storeUrl);
};

export const getOrderStatusHtml = (orderId: string, status: string, storeName: string, storeUrl: string, customTemplate?: string) => {
  if (customTemplate) {
    return customTemplate
      .replace(/{{orderId}}/g, orderId)
      .replace(/{{status}}/g, status)
      .replace(/{{storeName}}/g, storeName)
      .replace(/{{storeUrl}}/g, storeUrl);
  }
  const statusColor = status === "delivered" ? "#10b981" : status === "cancelled" ? "#ef4444" : "#f59e0b";
  const content = `
    <p>Great news regarding your order <strong>#${orderId}</strong>.</p>
    <p>The status of your order has been updated to:</p>
    <center>
      <div style="background-color: ${statusColor}20; border: 1px solid ${statusColor}; color: ${statusColor}; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; text-transform: uppercase;">
        ${status}
      </div>
    </center>
    <p>Thank you for shopping with us! If you have any questions, feel free to contact our support team.</p>
  `;
  return getBaseTemplate("Order Status Update", content, storeName, storeUrl);
};

export const getOrderConfirmationHtml = (order: any, storeName: string, storeUrl: string, currency: string, customTemplate?: string) => {
  const orderId = order._id.toString();
  
  let itemsHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
    <thead>
      <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
        <th style="padding: 10px 0;">Item</th>
        <th style="padding: 10px 0;">Qty</th>
        <th style="padding: 10px 0; text-align: right;">Price</th>
      </tr>
    </thead>
    <tbody>`;
    
  order.items.forEach((item: any) => {
    itemsHtml += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0;">
          <strong>${item.name}</strong>
          ${item.size ? `<br><small style="color: #64748b;">Size: ${item.size}</small>` : ''}
          ${item.color ? `<br><small style="color: #64748b;">Color: ${item.color}</small>` : ''}
        </td>
        <td style="padding: 12px 0;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right;">${currency}${item.price.toFixed(2)}</td>
      </tr>
    `;
  });
  
  itemsHtml += `
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding: 12px 0; text-align: right; font-weight: bold;">Subtotal:</td>
        <td style="padding: 12px 0; text-align: right;">${currency}${order.totalAmount.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>`;

  if (customTemplate) {
    return customTemplate
      .replace(/{{orderId}}/g, orderId)
      .replace(/{{storeName}}/g, storeName)
      .replace(/{{storeUrl}}/g, storeUrl)
      .replace(/{{itemsHtml}}/g, itemsHtml)
      .replace(/{{customerName}}/g, order.customer.name)
      .replace(/{{customerAddress}}/g, order.customer.address)
      .replace(/{{customerCity}}/g, order.customer.city)
      .replace(/{{customerPostalCode}}/g, order.customer.postalCode || '');
  }

  const content = `
    <p>Thank you for your order! We've received it and are processing it right away.</p>
    <p><strong>Order ID:</strong> #${orderId}</p>
    
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #0f172a;">Shipping Address</h3>
      <p style="margin: 0;">
        ${order.customer.name}<br>
        ${order.customer.address}<br>
        ${order.customer.city}, ${order.customer.postalCode || ''}<br>
      </p>
    </div>
    
    <h3 style="color: #0f172a;">Order Summary</h3>
    ${itemsHtml}
    
    <p>We'll send you another email when your order ships.</p>
  `;
  
  return getBaseTemplate("Order Confirmation", content, storeName, storeUrl);
};
