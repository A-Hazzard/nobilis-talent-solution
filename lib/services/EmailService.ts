import nodemailer from "nodemailer";
import type { EmailData, InvoiceEmailData } from "@/lib/types/services";

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Initialize transporter with environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });

    // Initialize email service
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Generate simple HTML email
   */
  private generateSimpleHTML(subject: string, content: string): string {
    return `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${subject}</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Payne Leadership</h1>
                      <p>${subject}</p>
                  </div>
                  
                  <div class="content">
                      ${content}
                  </div>
                  
                  <div class="footer">
                      <p>Payne Leadership<br>
                      123 Business St, City, State 12345<br>
                      +1 (555) 123-4567 | contact@payneleadership.com</p>
                  </div>
              </div>
          </body>
          </html>
          `;
  }

  /**
   * Send a generic email
   */
  async sendEmail(
    data: EmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: data.from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        attachments: data.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(
    data: InvoiceEmailData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const dueDate = data.invoice.dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const itemsHtml = data.invoice.items
        .map(
          (item) =>
            `<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
          <span>${item.description}</span>
          <span>$${item.total.toFixed(2)}</span>
        </div>`
        )
        .join("");

      const content = `
        <p>Dear ${data.clientName},</p>
        
        ${data.customMessage ? `<p>${data.customMessage}</p>` : ''}
        
        <p>Please find your invoice details below.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Invoice #${data.invoice.invoiceNumber}</h3>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          
          <h4>Services:</h4>
          ${itemsHtml}
          
          <div style="font-weight: bold; font-size: 1.2em; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea;">
            <div style="display: flex; justify-content: space-between; padding: 10px 0;">
              <span>Total:</span>
              <span>$${data.invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <p>Please review the invoice above and complete your payment at your earliest convenience.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/payment?invoice=${data.invoice.invoiceNumber}" 
           style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Pay Now</a>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        Payne Leadership Team</p>
      `;

      const html = this.generateSimpleHTML("Invoice", content);

      const emailData: EmailData = {
        to: data.clientEmail,
        subject: "Invoice #" + data.invoice.invoiceNumber,
        html,
      };

      // Add PDF attachment if provided
      if (data.pdfAttachment) {
        emailData.attachments = [
          {
            filename: data.pdfAttachment.filename,
            content: data.pdfAttachment.content,
            contentType: data.pdfAttachment.contentType,
          },
        ];
      }

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error("Error sending invoice email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetLink: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const content = `
        <p>Hello,</p>
        
        <p>We received a request to reset your password for your account. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        
        <p>Best regards,<br>
        Payne Leadership Team</p>
      `;

      const html = this.generateSimpleHTML("Password Reset Request", content);

      return await this.sendEmail({
        to,
        subject: "Password Reset Request - Payne Leadership",
        html,
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const content = `
        <p>Hello ${userName},</p>
        
        <p>Welcome to Payne Leadership! We're thrilled to have you as part of our community.</p>
        
        <p>Here's what you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our services</li>
          <li>Schedule a consultation</li>
          <li>Access our resources</li>
        </ul>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
           style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Go to Dashboard</a>
        
        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>
        Payne Leadership Team</p>
      `;

      const html = this.generateSimpleHTML(
        "Welcome to Payne Leadership!",
        content
      );

      return await this.sendEmail({
        to,
        subject: "Welcome to Payne Leadership!",
        html,
      });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send contact form confirmation email to user
   */
  async sendContactConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    company?: string;
    challenges: string;
    contactMethod: 'email' | 'phone';
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const content = `
        <p>Dear ${data.firstName} ${data.lastName},</p>
        
        <p>Thank you for reaching out to Payne Leadership! We've received your message and appreciate you taking the time to share your challenges with us.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h4>Your Message Summary:</h4>
          <p><strong>Company:</strong> ${data.company || 'Not specified'}</p>
          <p><strong>Preferred Contact Method:</strong> ${data.contactMethod === 'email' ? 'Email' : 'Phone'}</p>
          <p><strong>Your Challenges:</strong></p>
          <p style="font-style: italic; margin-left: 20px;">"${data.challenges}"</p>
        </div>
        
        <p>Our team will review your information and get back to you within 24 hours via your preferred contact method (${data.contactMethod === 'email' ? 'email' : 'phone'}).</p>
        
        <p>In the meantime, you might find these resources helpful:</p>
        <ul>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/resources">Free Leadership Resources</a></li>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/services">Our Services</a></li>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/blog">Leadership Blog</a></li>
        </ul>
        
        <p>If you have any urgent questions, feel free to call us directly at +1 (555) 123-4567.</p>
        
        <p>Best regards,<br>
        Kareem Payne<br>
        Payne Leadership</p>
      `;

      const html = this.generateSimpleHTML("Thank You for Contacting Us", content);

      return await this.sendEmail({
        to: data.to,
        subject: "Thank You for Contacting Payne Leadership",
        html,
      });
    } catch (error) {
      console.error("Error sending contact confirmation email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send contact form notification email to admin
   */
  async sendContactNotification(data: {
    to: string;
    contactData: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      company?: string;
      challenges: string;
      contactMethod: 'email' | 'phone';
      submittedAt: string;
    };
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const content = `
        <p>New contact form submission received!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h4>Contact Details:</h4>
          <p><strong>Name:</strong> ${data.contactData.firstName} ${data.contactData.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.contactData.email}">${data.contactData.email}</a></p>
          ${data.contactData.phone ? `<p><strong>Phone:</strong> <a href="tel:${data.contactData.phone}">${data.contactData.phone}</a></p>` : ''}
          ${data.contactData.company ? `<p><strong>Company:</strong> ${data.contactData.company}</p>` : ''}
          <p><strong>Preferred Contact Method:</strong> ${data.contactData.contactMethod === 'email' ? 'Email' : 'Phone'}</p>
          <p><strong>Submitted:</strong> ${new Date(data.contactData.submittedAt).toLocaleString()}</p>
          
          <h4>Challenges:</h4>
          <p style="font-style: italic; margin-left: 20px;">"${data.contactData.challenges}"</p>
        </div>
        
        <p><strong>Action Required:</strong> Please respond to this contact within 24 hours.</p>
        
        <div style="margin: 20px 0;">
          <a href="mailto:${data.contactData.email}?subject=Re: Your inquiry to Payne Leadership" 
             style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-right: 10px;">Reply via Email</a>
          
          ${data.contactData.phone ? `<a href="tel:${data.contactData.phone}" 
             style="display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px;">Call Now</a>` : ''}
        </div>
        
        <p>Contact ID: ${data.contactData.id}</p>
      `;

      const html = this.generateSimpleHTML("New Contact Form Submission", content);

      return await this.sendEmail({
        to: data.to,
        subject: `New Contact: ${data.contactData.firstName} ${data.contactData.lastName} - ${data.contactData.company || 'No Company'}`,
        html,
      });
    } catch (error) {
      console.error("Error sending contact notification email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(data: {
    to: string;
    clientName: string;
    invoiceNumber: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const content = `
        <p>Dear ${data.clientName},</p>
        
        <p>Thank you for your payment! We've successfully processed your transaction.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h4>Payment Details:</h4>
          <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
          <p><strong>Amount Paid:</strong> $${data.amount.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Your payment has been received and your invoice has been marked as paid. You can view your payment history in your dashboard.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/invoices" 
           style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Invoices</a>
        
        <p>If you have any questions about this payment, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        Payne Leadership Team</p>
      `;

      const html = this.generateSimpleHTML("Payment Confirmation", content);

      return await this.sendEmail({
        to: data.to,
        subject: `Payment Confirmation - Invoice #${data.invoiceNumber}`,
        html,
      });
    } catch (error) {
      console.error("Error sending payment confirmation email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(data: {
    to: string;
    clientName: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: string;
    meetingLink?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const content = `
        <p>Dear ${data.clientName},</p>
        
        <p>Your appointment has been successfully scheduled! We're looking forward to working with you.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h4>Appointment Details:</h4>
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Date:</strong> ${data.appointmentDate}</p>
          <p><strong>Time:</strong> ${data.appointmentTime}</p>
          <p><strong>Duration:</strong> ${data.duration}</p>
          ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">Join Meeting</a></p>` : ''}
        </div>
        
        <p>Please add this appointment to your calendar. You'll receive a reminder 24 hours before the scheduled time.</p>
        
        ${data.meetingLink ? `
        <p><strong>Important:</strong> This will be a virtual meeting. Please ensure you have a stable internet connection and a quiet environment for our session.</p>
        ` : `
        <p><strong>Location:</strong> We'll contact you with the meeting location details closer to the appointment date.</p>
        `}
        
        <p>If you need to reschedule or cancel this appointment, please contact us at least 24 hours in advance.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/calendar" 
           style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Calendar</a>
        
        <p>Best regards,<br>
        Kareem Payne<br>
        Payne Leadership</p>
      `;

      const html = this.generateSimpleHTML("Appointment Confirmation", content);

      return await this.sendEmail({
        to: data.to,
        subject: `Appointment Confirmation - ${data.serviceName}`,
        html,
      });
    } catch (error) {
      console.error("Error sending booking confirmation email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      console.error("Email configuration test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
