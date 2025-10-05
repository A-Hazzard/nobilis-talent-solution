# Webhook Debugging Guide

## 🚨 **Critical Issue: Webhook Secret Configuration**

The main blocker preventing your webhooks from working is that the `STRIPE_WEBHOOK_SECRET` in your `.env` file is still set to a placeholder value.

### **Current Problem**
```env
# This is a placeholder and will cause webhook failures
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Solution: Get the Real Webhook Secret**

1. **Go to Stripe Dashboard**: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. **Find your webhook endpoint** (should be pointing to your domain)
3. **Click on the webhook** to view details
4. **Click "Reveal signing secret"**
5. **Copy the secret** (starts with `whsec_`)
6. **Update your `.env` file**:

```env
# Replace with the actual secret from Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_actual_secret_here
```

---

## 🧪 **Testing the Fixes**

### **Step 1: Check Webhook Configuration**

Test if your webhook configuration is correct:

```bash
curl -X GET http://localhost:3000/api/payment/webhook/test
```

**Expected Response**: JSON with configuration status and instructions

**If you see**: `"isPlaceholderSecret": true` - You need to update the webhook secret

### **Step 2: Test Webhook Logic**

Once you have a pending payment ID, test the webhook logic:

```bash
curl -X POST http://localhost:3000/api/payment/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "pendingPaymentId": "your_actual_pending_payment_id",
    "simulatePayment": true
  }'
```

**This will test**:
- ✅ Pending payment lookup
- ✅ PDF generation
- ✅ Email sending
- ✅ Bonus amount calculations

### **Step 3: Monitor Server Logs**

Watch your server console for detailed logs. Each webhook request gets a unique ID:

```
🚀 [webhook_1234567890_abc123] Webhook received at 2025-01-15T10:30:00.000Z
🔍 [webhook_1234567890_abc123] Environment check: { hasStripe: true, hasWebhookSecret: true, ... }
📝 [webhook_1234567890_abc123] Request details: { bodyLength: 1234, hasSignature: true, ... }
✅ [webhook_1234567890_abc123] Webhook signature verified successfully
💰 [webhook_1234567890_abc123] Payment successful for session: { sessionId: "cs_...", ... }
```

---

## 🔍 **What the Enhanced Webhook Now Does**

### **1. Comprehensive Logging**
- **Request ID tracking** for each webhook call
- **Timing information** for performance monitoring
- **Detailed step-by-step logging** for debugging
- **Environment validation** to catch configuration issues

### **2. Enhanced Error Handling**
- **Specific error messages** instead of generic failures
- **Webhook secret validation** to detect placeholder values
- **Request ID in error responses** for correlation
- **Detailed error context** for troubleshooting

### **3. Improved Bonus Amount Handling**
- **Proper calculation** of bonus amounts
- **Firebase document preservation** during updates
- **Enhanced invoice data** with bonus breakdown
- **PDF generation** with bonus item details

### **4. Currency Formatting Fixes**
- **Consistent USD display** regardless of browser locale
- **Currency utility functions** for different contexts
- **Email formatting** with proper USD symbols

---

## 🚀 **Testing Workflow**

### **Phase 1: Configuration Check**
```bash
# 1. Check webhook configuration
curl -X GET http://localhost:3000/api/payment/webhook/test

# 2. Update webhook secret if needed
# 3. Restart your development server
```

### **Phase 2: Logic Testing**
```bash
# 1. Create a pending payment (if you don't have one)
# 2. Test webhook logic with test endpoint
curl -X POST http://localhost:3000/api/payment/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"pendingPaymentId": "actual_id", "simulatePayment": true}'

# 3. Check logs for detailed information
# 4. Verify PDF generation and email sending
```

### **Phase 3: Live Testing**
```bash
# 1. Make a real Stripe payment
# 2. Monitor webhook logs
# 3. Check if invoice email is received
# 4. Verify Firebase document updates
```

---

## 📊 **Expected Results After Fixes**

### **Webhook Logs Should Show**:
```
🚀 [webhook_id] Webhook received at timestamp
🔍 [webhook_id] Environment check: { hasStripe: true, hasWebhookSecret: true, ... }
📝 [webhook_id] Request details: { bodyLength: X, hasSignature: true, ... }
✅ [webhook_id] Webhook signature verified successfully
📨 [webhook_id] Processing event: checkout.session.completed (ID: evt_...)
💰 [webhook_id] Payment successful for session: { sessionId: "cs_...", ... }
🧮 [webhook_id] Amount calculations: { amount: 75, baseAmount: 50, bonusAmount: 25, ... }
📝 [webhook_id] Updating pending payment document: payment_id
✅ [webhook_id] Pending payment updated successfully
📄 [webhook_id] Generating PDF for payment confirmation...
✅ [webhook_id] PDF generated successfully, size: X bytes
📧 [webhook_id] Sending payment confirmation email...
📧 [webhook_id] Email result: { success: true }
✅ [webhook_id] Webhook processed successfully in Xms
```

### **Customer Should Receive**:
- ✅ **Payment confirmation email** with invoice attached
- ✅ **PDF invoice** showing both base amount and bonus
- ✅ **Proper USD formatting** (not TT$)
- ✅ **Complete payment details**

### **Firebase Document Should Show**:
- ✅ **`baseAmount`**: Original service cost
- ✅ **`bonusAmount`**: Additional payment amount
- ✅ **`totalAmount`**: Combined total
- ✅ **`status`**: "completed"
- ✅ **`stripeSessionId`**: Stripe session ID

---

## 🚨 **Common Issues and Solutions**

### **Issue: "Webhook signature verification failed"**
**Cause**: Webhook secret mismatch
**Solution**: Update `STRIPE_WEBHOOK_SECRET` in `.env` file

### **Issue: "Webhook secret is still placeholder"**
**Cause**: Environment variable not updated
**Solution**: Replace placeholder with actual secret from Stripe dashboard

### **Issue: "Stripe is not configured"**
**Cause**: Missing environment variables
**Solution**: Check all Stripe-related environment variables

### **Issue: No webhook logs appearing**
**Cause**: Webhook not being called by Stripe
**Solution**: Verify webhook URL in Stripe dashboard matches your endpoint

---

## 📞 **Getting Help**

### **If Webhook Still Not Working**:
1. **Check the test endpoint** for configuration issues
2. **Verify webhook secret** is correctly set
3. **Check Stripe dashboard** for webhook delivery status
4. **Monitor server logs** for detailed error information
5. **Use the test endpoint** to verify logic works

### **If You Need More Debugging**:
- The enhanced webhook now provides comprehensive logging
- Each request has a unique ID for tracking
- Test endpoint allows testing without real Stripe calls
- All error messages include context and request IDs

---

## 🎯 **Success Checklist**

- [ ] Webhook secret updated in `.env` file
- [ ] Webhook configuration test passes
- [ ] Webhook logic test passes
- [ ] Real Stripe payment triggers webhook
- [ ] Customer receives invoice email
- [ ] PDF invoice shows bonus amount
- [ ] Firebase document updated correctly
- [ ] Currency displays as USD consistently

---

*This guide covers the fixes implemented for your Stripe payment issues. The main blocker is updating the webhook secret, after which the enhanced logging and error handling will help you debug any remaining issues.*

