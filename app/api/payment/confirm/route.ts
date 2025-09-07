import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc, addDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    console.log('🔍 Payment Confirm: Processing session:', sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const clientEmail = (session.customer_details?.email || (session.metadata?.clientEmail as string) || '').trim();
    const clientName = (session.metadata?.clientName as string) || '';
    const amountTotal = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.amount || 0);
    const pendingPaymentId = session.metadata?.pendingPaymentId as string | undefined;
    const invoiceNumber = (session.metadata?.invoiceNumber as string) || sessionId;
    const baseAmount = session.metadata?.baseAmount ? Number(session.metadata.baseAmount) : 0;
    const bonusAmount = Math.max(0, amountTotal - baseAmount);
    const transactionId = (typeof session.payment_intent === 'object' && session.payment_intent?.id)
      ? session.payment_intent.id
      : (session.payment_intent as string) || sessionId;

    console.log('💰 Payment Confirm: Amount calculations:', {
      amountTotal,
      baseAmount,
      bonusAmount,
      pendingPaymentId,
      invoiceNumber
    });

    // Update Firestore document with complete payment information
    if (pendingPaymentId) {
      try {
        console.log('📝 Payment Confirm: Updating pending payment document:', pendingPaymentId);
        const ref = doc(db, 'pendingPayments', pendingPaymentId);
        const snap = await getDoc(ref);
        const currentStatus = snap.exists() ? (snap.data().status as string) : undefined;
        
        if (currentStatus !== 'completed') {
          const updateData = {
            status: 'completed' as const,
            stripeSessionId: session.id,
            updatedAt: serverTimestamp(),
            bonusAmount: bonusAmount,
            totalAmount: amountTotal,
            // Preserve existing fields
            ...(snap.exists() && {
              baseAmount: snap.data().baseAmount || baseAmount,
              description: snap.data().description,
              clientName: snap.data().clientName,
              clientEmail: snap.data().clientEmail,
              notes: snap.data().notes,
              invoiceNumber: invoiceNumber
            })
          };

          console.log('📝 Payment Confirm: Update data:', updateData);
          await updateDoc(ref, updateData);
          console.log('✅ Payment Confirm: Pending payment updated successfully');

          // Find and update the most recent invoice for this client
          try {
            console.log('📄 Payment Confirm: Looking for existing invoice for client:', clientEmail);
            const pendingPaymentData = snap.data();
            if (!pendingPaymentData) {
              throw new Error('Pending payment data not found');
            }

            // Query for the most recent invoice for this client email
            const invoiceQuery = query(
              collection(db, 'invoices'),
              where('clientEmail', '==', clientEmail),
              orderBy('createdAt', 'desc'),
              limit(1)
            );

            const invoiceSnapshot = await getDocs(invoiceQuery);
            
            if (!invoiceSnapshot.empty) {
              // Found an existing invoice - update it to paid
              const invoiceDoc = invoiceSnapshot.docs[0];
              const invoiceId = invoiceDoc.id;
              const invoiceData = invoiceDoc.data();
              
              console.log('📄 Payment Confirm: Found existing invoice:', invoiceId, 'Status:', invoiceData.status);
              
              // Update the invoice to paid status
              const updateData: any = {
                status: 'paid' as const,
                paidAt: new Date(),
                updatedAt: serverTimestamp(),
                stripeSessionId: session.id,
                transactionId: transactionId,
                bonusAmount: bonusAmount,
                total: amountTotal,
                notes: bonusAmount > 0 ? `Includes $${bonusAmount.toFixed(2)} bonus payment` : undefined
              };

              // Update items if there's a bonus amount
              if (bonusAmount > 0) {
                const existingItems = invoiceData.items || [];
                const hasBonusItem = existingItems.some((item: any) => item.description.includes('Bonus'));
                
                if (!hasBonusItem) {
                  existingItems.push({
                    id: `${existingItems.length + 1}`,
                    description: 'Additional Payment (Bonus)',
                    quantity: 1,
                    unitPrice: bonusAmount,
                    total: bonusAmount,
                    type: 'service'
                  });
                }
                
                updateData.items = existingItems;
              }

              await updateDoc(doc(db, 'invoices', invoiceId), updateData);
              console.log('✅ Payment Confirm: Invoice updated to paid status:', invoiceId);
            } else {
              // No existing invoice found - create a new one
              console.log('📄 Payment Confirm: No existing invoice found, creating new one...');
              
              const newInvoiceData = {
                invoiceNumber,
                clientName: pendingPaymentData.clientName,
                clientEmail: pendingPaymentData.clientEmail,
                items: [
                  {
                    id: '1',
                    description: pendingPaymentData.description || 'Leadership Consultation',
                    quantity: 1,
                    unitPrice: pendingPaymentData.baseAmount || baseAmount,
                    total: pendingPaymentData.baseAmount || baseAmount,
                    type: 'service'
                  }
                ],
                subtotal: amountTotal,
                taxAmount: 0,
                total: amountTotal,
                currency: 'USD',
                status: 'paid' as const,
                issueDate: new Date(),
                dueDate: new Date(),
                paidAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                stripeSessionId: session.id,
                transactionId: transactionId,
                bonusAmount: bonusAmount,
                notes: bonusAmount > 0 ? `Includes $${bonusAmount.toFixed(2)} bonus payment` : undefined
              };

              // Add bonus item if there's a bonus amount
              if (bonusAmount > 0) {
                newInvoiceData.items.push({
                  id: '2',
                  description: 'Additional Payment (Bonus)',
                  quantity: 1,
                  unitPrice: bonusAmount,
                  total: bonusAmount,
                  type: 'service'
                });
              }

              const invoiceRef = await addDoc(collection(db, 'invoices'), newInvoiceData);
              console.log('✅ Payment Confirm: New invoice created and marked as paid:', invoiceRef.id);
            }
          } catch (invoiceError) {
            console.error('❌ Payment Confirm: Failed to update/create invoice:', invoiceError);
            // Don't fail the entire process if invoice update fails
          }
        } else {
          console.log('ℹ️ Payment Confirm: Payment already marked as completed');
        }
      } catch (e) {
        console.error('❌ Payment Confirm: Firestore update failed:', e);
      }
    } else {
      console.log('⚠️ Payment Confirm: No pendingPaymentId found in session metadata');
    }

    // Generate PDF invoice and send enhanced email
    try {
      if (clientEmail) {
        console.log('📧 Payment Confirm: Starting enhanced email process...');
        const emailService = EmailService.getInstance();
        
        // Generate PDF invoice with proper amounts (including bonus if applicable)
        let pdfAttachment = undefined;
        
        if (pendingPaymentId) {
          try {
            console.log('📄 Payment Confirm: Fetching invoice data for PDF generation...');
            const ref = doc(db, 'pendingPayments', pendingPaymentId);
            const docSnap = await getDoc(ref);
            if (docSnap.exists()) {
              const pendingPayment = docSnap.data();
              const docBaseAmount = Number(pendingPayment.baseAmount || baseAmount);
              const docTotalAmount = amountTotal;
              const docBonusAmount = Math.max(0, docTotalAmount - docBaseAmount);
              
              console.log('💰 Payment Confirm: Payment amounts from document:', {
                docBaseAmount,
                docTotalAmount,
                docBonusAmount
              });
              
              // Create items array with base service and bonus if applicable
              const items = [{
                id: '1',
                description: pendingPayment.description || 'Leadership Consultation',
                quantity: 1,
                unitPrice: docBaseAmount,
                total: docBaseAmount,
                type: 'service' as const
              }];
              
              // Add bonus item if there's a bonus amount
              if (docBonusAmount > 0) {
                items.push({
                  id: '2',
                  description: 'Additional Payment (Bonus)',
                  quantity: 1,
                  unitPrice: docBonusAmount,
                  total: docBonusAmount,
                  type: 'service' as const
                });
              }
              
              const invoiceData = {
                invoiceNumber,
                clientName: pendingPayment.clientName,
                clientEmail: pendingPayment.clientEmail,
                items,
                subtotal: docTotalAmount,
                taxAmount: 0,
                total: docTotalAmount,
                dueDate: new Date(),
                bonusAmount: docBonusAmount,
                notes: docBonusAmount > 0 ? `Includes $${docBonusAmount.toFixed(2)} bonus payment` : undefined
              };
              
              console.log('📄 Payment Confirm: Invoice data for PDF:', invoiceData);
              console.log('📄 Payment Confirm: Generating PDF for payment confirmation...');
              
              const { PDFService } = await import('@/lib/services/PDFService');
              const pdfService = PDFService.getInstance();
              const pdf = await pdfService.generateInvoicePDF(invoiceData, invoiceNumber);
              
              if (pdf.success && pdf.data) {
                pdfAttachment = {
                  filename: `invoice-${invoiceNumber}.pdf`,
                  content: pdf.data,
                  contentType: 'application/pdf'
                };
                console.log('✅ Payment Confirm: PDF generated successfully, size:', pdf.data.length, 'bytes');
              } else {
                console.log('❌ Payment Confirm: PDF generation failed:', pdf.error);
              }
            } else {
              console.log('❌ Payment Confirm: Pending payment document not found');
            }
          } catch (fetchError) {
            console.error('❌ Payment Confirm: Failed to fetch invoice data:', fetchError);
          }
        } else {
          console.log('⚠️ Payment Confirm: No pendingPaymentId found for PDF generation');
        }
        
        console.log('📧 Payment Confirm: Sending enhanced payment confirmation email...');
        const emailResult = await emailService.sendPaymentConfirmationWithPDF({
          to: clientEmail,
          clientName: clientName || clientEmail,
          invoiceNumber,
          amount: amountTotal,
          paymentMethod: session.payment_method_types?.[0] || 'card',
          transactionId,
          pdfAttachment
        });
        
        console.log('📧 Payment Confirm: Email result:', emailResult);
        
        if (!emailResult.success) {
          console.error('❌ Payment Confirm: Email sending failed:', emailResult.error);
        }
      } else {
        console.log('❌ Payment Confirm: No client email found');
      }
    } catch (e) {
      console.error('❌ Payment Confirm: Failed to send enhanced payment confirmation email:', e);
    }

    return NextResponse.json({
      amount: `USD ${amountTotal.toFixed(2)}`,
      service: clientName ? `Leadership Consultation for ${clientName}` : 'Leadership Consultation',
      email: clientEmail || '—',
      date: new Date().toLocaleDateString(),
      transactionId,
      invoiceNumber,
      baseAmount: `USD ${baseAmount.toFixed(2)}`,
      bonusAmount: `USD ${bonusAmount.toFixed(2)}`,
      totalAmount: `USD ${amountTotal.toFixed(2)}`
    });
  } catch (error) {
    console.error('❌ Payment Confirm: Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}


