export const defaultWelcomeEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; margin-bottom: 20px; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Welcome to the Family!</h2>
      <p>Hi <strong>{{username}}</strong>,</p>
      <p>Welcome to {{storeName}}! We're absolutely thrilled to have you join our community.</p>
      <p>Discover our latest collections and find exactly what you've been looking for. We promise to deliver the best quality and service.</p>
      <center>
        <a href="{{storeUrl}}" class="btn">Start Shopping Now</a>
      </center>
      <p>If you have any questions or need assistance, feel free to reply to this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;

export const defaultOrderConfirmationEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order! We've received it and are processing it right away.</p>
      <p><strong>Order ID:</strong> #{{orderId}}</p>
      
      <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0f172a;">Shipping Address</h3>
        <p style="margin: 0;">
          {{customerName}}<br>
          {{customerAddress}}<br>
          {{customerCity}}, {{customerPostalCode}}<br>
        </p>
      </div>
      
      <h3 style="color: #0f172a;">Order Summary</h3>
      {{itemsHtml}}
      
      <p>We'll send you another email when your order ships.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;

export const defaultOrderProcessingEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Order Status Update</h2>
      <p>Great news regarding your order <strong>#{{orderId}}</strong>.</p>
      <p>The status of your order has been updated to:</p>
      <center>
        <div style="background-color: #f59e0b20; border: 1px solid #f59e0b; color: #f59e0b; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; text-transform: uppercase;">
          {{status}}
        </div>
      </center>
      <p>We are currently packing your items and will notify you as soon as they are shipped!</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;

export const defaultOrderShippedEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Order Status Update</h2>
      <p>Great news regarding your order <strong>#{{orderId}}</strong>.</p>
      <p>Your order has been <strong>SHIPPED</strong> and is on its way to you!</p>
      <center>
        <div style="background-color: #3b82f620; border: 1px solid #3b82f6; color: #3b82f6; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; text-transform: uppercase;">
          {{status}}
        </div>
      </center>
      <p>Thank you for shopping with us! If you have any questions, feel free to contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;

export const defaultOrderDeliveredEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Order Status Update</h2>
      <p>Great news regarding your order <strong>#{{orderId}}</strong>.</p>
      <p>The status of your order has been updated to:</p>
      <center>
        <div style="background-color: #10b98120; border: 1px solid #10b981; color: #10b981; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; text-transform: uppercase;">
          {{status}}
        </div>
      </center>
      <p>We hope you enjoy your purchase! Thank you for choosing us.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;

export const defaultOrderCancelledEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Order Status Update</h2>
      <p>Regarding your order <strong>#{{orderId}}</strong>.</p>
      <p>The status of your order has been updated to:</p>
      <center>
        <div style="background-color: #ef444420; border: 1px solid #ef4444; color: #ef4444; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; text-transform: uppercase;">
          {{status}}
        </div>
      </center>
      <p>If you have any questions or think this was a mistake, please reply to this email to contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;

export const defaultPasswordResetEmail = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; }
    .header { background-color: #d31e28; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 40px 30px; }
    .footer { background-color: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 13px; }
    .footer a { color: #d31e28; text-decoration: none; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; margin-bottom: 20px; }
    h2 { color: #0f172a; margin-top: 0; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{storeName}}</h1>
    </div>
    <div class="body">
      <h2>Reset Your Password</h2>
      <p>You recently requested to reset your password for your {{storeName}} account.</p>
      <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
      <center>
        <a href="{{resetUrl}}" class="btn">Reset My Password</a>
      </center>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 {{storeName}}. All rights reserved.</p>
      <p>Visit us at <a href="{{storeUrl}}">{{storeUrl}}</a></p>
    </div>
  </div>
</body>
</html>`;
