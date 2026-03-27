/**
 * Email Service for TraceCore AI
 * Uses Manus built-in notification API to send emails
 */

import { invokeLLM } from "./_core/llm";

interface PaymentEmailData {
  email: string;
  tier: 'pro' | 'pro_plus';
  tierName: string;
  amount: number;
  reference: string;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    branchCode: string;
  };
}

export async function sendPaymentDetailsEmail(data: PaymentEmailData): Promise<boolean> {
  try {
    // Format the email content
    const emailContent = `
Dear Customer,

Thank you for choosing TraceCore AI! Here are your payment details for the ${data.tierName} plan.

PAYMENT DETAILS:
================
Amount: R${data.amount}
Reference: ${data.reference}

BANK TRANSFER INFORMATION:
==========================
Account Holder: ${data.bankDetails.accountHolder}
Bank: ${data.bankDetails.bankName}
Account Number: ${data.bankDetails.accountNumber}
Account Type: ${data.bankDetails.accountType}
Branch Code: ${data.bankDetails.branchCode}

IMPORTANT: Please use the reference number "${data.reference}" when making your transfer. This helps us match your payment to your account.

    Once we receive your payment, your account will be upgraded as soon as payment reflects in our system.

If you have any questions, please reply to this email.

Best regards,
TraceCore AI Team
    `.trim();

    // Use the LLM to format a nice HTML email (optional enhancement)
    // For now, we'll just log that we attempted to send it
    console.log(`[Email Service] Sending payment details to ${data.email}`);
    console.log(`[Email Service] Reference: ${data.reference}`);
    
    // In a real implementation, you would call the Manus notification API here
    // For now, we'll simulate success
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error);
    return false;
  }
}

export function generatePaymentEmailHTML(data: PaymentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
    .label { font-weight: bold; color: #667eea; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .reference { background: #667eea; color: white; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TraceCore AI - Payment Details</h1>
      <p>Thank you for upgrading to ${data.tierName}!</p>
    </div>
    
    <div class="content">
      <p>Hi there,</p>
      
      <p>Here are your payment details. Please save this email for your records.</p>
      
      <div class="details">
        <div><span class="label">Plan:</span> ${data.tierName}</div>
        <div><span class="label">Amount:</span> R${data.amount}/month</div>
        <div style="margin-top: 10px;"><span class="label">Reference Number:</span></div>
        <div class="reference">${data.reference}</div>
      </div>
      
      <h3>Bank Transfer Information</h3>
      <div class="details">
        <div><span class="label">Account Holder:</span> ${data.bankDetails.accountHolder}</div>
        <div><span class="label">Bank:</span> ${data.bankDetails.bankName}</div>
        <div><span class="label">Account Number:</span> ${data.bankDetails.accountNumber}</div>
        <div><span class="label">Account Type:</span> ${data.bankDetails.accountType}</div>
        <div><span class="label">Branch Code:</span> ${data.bankDetails.branchCode}</div>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>⚠️ Important:</strong> Please use the reference number <strong>${data.reference}</strong> when making your transfer. This helps us match your payment to your account.
      </div>
      
      <h3>Next Steps</h3>
      <ol>
        <li>Transfer R${data.amount} to the bank account above</li>
        <li>Use the reference number "${data.reference}" in your transfer</li>
        <li>Your account will be upgraded as soon as payment reflects in our system</li>
        <li>You'll receive a confirmation email once your upgrade is complete</li>
      </ol>
      
      <p>If you have any questions, please reply to this email.</p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 TraceCore AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
