import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase/admin';
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

    const { sessionId, skipEmail } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    console.log('🔍 Payment Confirm: Processing session:', sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    
    console.log('🔍 Payment Confirm: Session metadata:', session.metadata);
    console.log('🔍 Payment Confirm: Session amount_total:', session.amount_total);

    const clientEmail = (session.customer_details?.email || (session.metadata?.clientEmail as string) || '').trim();
    const clientName = (session.metadata?.clientName as string) || '';
    const amountTotal = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.amount || 0);
    const pendingPaymentId = session.metadata?.pendingPaymentId as string | undefined;
    const invoiceNumber = (session.metadata?.invoiceNumber as string) || sessionId;
    const baseAmount = session.metadata?.baseAmount ? Number(session.metadata.baseAmount) : 0;
    const bonusAmount = Math.max(0, amountTotal - baseAmount);
    
    console.log('🔍 Payment Confirm: Extracted values:', {
      pendingPaymentId,
      invoiceNumber,
      baseAmount,
      bonusAmount,
      amountTotal
    });
    
    console.log('💰 Payment Confirm: Amount breakdown:', {
      amountTotal,
      baseAmount,
      bonusAmount,
      calculation: `${amountTotal} - ${baseAmount} = ${bonusAmount}`
    });
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

    // Utility: remove undefined values so Firestore doesn't reject writes
    const pruneUndefined = <T extends Record<string, any>>(obj: T): T => {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          result[key] = value;
        }
      }
      return result as T;
    };

    // Update Firestore document with complete payment information
    console.log('🔥 FIREBASE: Initializing Firestore connection...');
    const db = getAdminFirestore();
    console.log('🔥 FIREBASE: Firestore connection established successfully');
    
    if (pendingPaymentId) {
      try {
        console.log('🔥 FIREBASE: Updating existing pending payment document:', pendingPaymentId);
        const ref = db.collection('pendingPayments').doc(pendingPaymentId);
        console.log('🔥 FIREBASE: Getting document snapshot...');
        const snap = await ref.get();
        console.log('🔥 FIREBASE: Document exists:', snap.exists);
        const currentStatus = snap.exists ? (snap.data()?.status as string) : undefined;
        console.log('🔥 FIREBASE: Current status:', currentStatus);
        
        if (currentStatus !== 'completed') {
          const updateDataRaw = {
            status: 'completed' as const,
            stripeSessionId: session.id,
            updatedAt: new Date(),
            bonusAmount: bonusAmount, // Always save bonus amount, even if 0
            totalAmount: amountTotal, // Always save total amount
            // Preserve existing fields
            ...(snap.exists && {
              baseAmount: snap.data()?.baseAmount || baseAmount,
              description: snap.data()?.description,
              clientName: snap.data()?.clientName,
              clientEmail: snap.data()?.clientEmail,
              notes: snap.data()?.notes,
              invoiceNumber: invoiceNumber
            })
          };

          // Only include notes when we actually have text; remove undefined values
          if (bonusAmount > 0) {
            (updateDataRaw as any).notes = `Includes $${bonusAmount.toFixed(2)} bonus payment`;
          }
          const updateData = pruneUndefined(updateDataRaw);

          console.log('🔥 FIREBASE: Update data for pending payment:', updateData);
          console.log('🔥 FIREBASE: Bonus amount being saved:', bonusAmount, 'Type:', typeof bonusAmount);
          console.log('🔥 FIREBASE: Attempting to update pending payment document...');
          await ref.update(updateData);
          console.log('🔥 FIREBASE: ✅ Pending payment updated successfully with bonus amount:', bonusAmount);
          
          // Verify the update by reading the document back
          console.log('🔥 FIREBASE: Verifying update by reading document back...');
          const verifySnap = await ref.get();
          if (verifySnap.exists) {
            const updatedData = verifySnap.data();
            console.log('🔥 FIREBASE: ✅ Document verification - Status:', updatedData?.status);
            console.log('🔥 FIREBASE: ✅ Document verification - Bonus Amount:', updatedData?.bonusAmount);
            console.log('🔥 FIREBASE: ✅ Document verification - Total Amount:', updatedData?.totalAmount);
          } else {
            console.log('🔥 FIREBASE: ❌ Document not found after update!');
          }

          // Find and update the most recent invoice for this client
          try {
            console.log('🔥 FIREBASE: Looking for existing invoice for client:', clientEmail);
            const pendingPaymentData = snap.data();
            if (!pendingPaymentData) {
              throw new Error('Pending payment data not found');
            }

            // Query for the most recent invoice for this client email
            console.log('🔥 FIREBASE: Querying invoices collection for client email:', clientEmail);
            const invoiceSnapshot = await db.collection('invoices')
              .where('clientEmail', '==', clientEmail)
              .orderBy('createdAt', 'desc')
              .limit(1)
              .get();
            console.log('🔥 FIREBASE: Invoice query completed. Found', invoiceSnapshot.size, 'invoices');
            
            if (!invoiceSnapshot.empty) {
              // Found an existing invoice - update it to paid
              const invoiceDoc = invoiceSnapshot.docs[0];
              const invoiceId = invoiceDoc.id;
              const invoiceData = invoiceDoc.data();
              
              console.log('🔥 FIREBASE: Found existing invoice:', invoiceId, 'Status:', invoiceData.status);
              console.log('🔥 FIREBASE: Current invoice data:', invoiceData);
              
              // Update the invoice to paid status
              const invoiceUpdateRaw: any = {
                status: 'paid' as const,
                paidAt: new Date(),
                updatedAt: new Date(),
                stripeSessionId: session.id,
                transactionId: transactionId,
                bonusAmount: bonusAmount,
                total: amountTotal,
                notes: bonusAmount > 0 ? `Includes $${bonusAmount.toFixed(2)} bonus payment` : undefined
              };
              const updateData = pruneUndefined(invoiceUpdateRaw);
              console.log('🔥 FIREBASE: Invoice update data:', updateData);

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

              console.log('🔥 FIREBASE: Attempting to update invoice document:', invoiceId);
              await db.collection('invoices').doc(invoiceId).update(updateData);
              console.log('🔥 FIREBASE: ✅ Invoice updated to paid status:', invoiceId);
              
              // Verify the invoice update
              console.log('🔥 FIREBASE: Verifying invoice update...');
              const verifyInvoiceSnap = await db.collection('invoices').doc(invoiceId).get();
              if (verifyInvoiceSnap.exists) {
                const updatedInvoiceData = verifyInvoiceSnap.data();
                console.log('🔥 FIREBASE: ✅ Invoice verification - Status:', updatedInvoiceData?.status);
                console.log('🔥 FIREBASE: ✅ Invoice verification - Bonus Amount:', updatedInvoiceData?.bonusAmount);
                console.log('🔥 FIREBASE: ✅ Invoice verification - Total:', updatedInvoiceData?.total);
              } else {
                console.log('🔥 FIREBASE: ❌ Invoice not found after update!');
              }
            } else {
              // No existing invoice found - create a new one
              console.log('🔥 FIREBASE: No existing invoice found, creating new one...');
              
              const newInvoiceRaw = {
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
                newInvoiceRaw.items.push({
                  id: '2',
                  description: 'Additional Payment (Bonus)',
                  quantity: 1,
                  unitPrice: bonusAmount,
                  total: bonusAmount,
                  type: 'service'
                });
              }

              const newInvoiceData = pruneUndefined(newInvoiceRaw);
              console.log('🔥 FIREBASE: Creating new invoice with data:', newInvoiceData);
              const invoiceRef = await db.collection('invoices').add(newInvoiceData);
              console.log('🔥 FIREBASE: ✅ New invoice created and marked as paid:', invoiceRef.id);
              
              // Verify the new invoice creation
              console.log('🔥 FIREBASE: Verifying new invoice creation...');
              const verifyNewInvoiceSnap = await invoiceRef.get();
              if (verifyNewInvoiceSnap.exists) {
                const newInvoiceData = verifyNewInvoiceSnap.data();
                console.log('🔥 FIREBASE: ✅ New invoice verification - Status:', newInvoiceData?.status);
                console.log('🔥 FIREBASE: ✅ New invoice verification - Bonus Amount:', newInvoiceData?.bonusAmount);
                console.log('🔥 FIREBASE: ✅ New invoice verification - Total:', newInvoiceData?.total);
              } else {
                console.log('🔥 FIREBASE: ❌ New invoice not found after creation!');
              }
            }
          } catch (invoiceError) {
            console.error('❌ Payment Confirm: Failed to update/create invoice:', invoiceError);
            // Don't fail the entire process if invoice update fails
          }
        } else {
          console.log('🔥 FIREBASE: Payment already marked as completed');
        }
      } catch (e) {
        console.error('🔥 FIREBASE: ❌ Firestore update failed:', e);
      }
    } else {
      // No pendingPaymentId - create a new pending payment document for tracking
      console.log('🔥 FIREBASE: No pendingPaymentId found, creating new pending payment document');
      try {
        const newPendingPaymentRaw = {
          clientName: clientName || 'Unknown Client',
          clientEmail: clientEmail || 'unknown@example.com',
          baseAmount: baseAmount,
          bonusAmount: bonusAmount,
          totalAmount: amountTotal,
          description: session.metadata?.optionName || 'Leadership Consultation',
          status: 'completed' as const,
          stripeSessionId: session.id,
          invoiceNumber: invoiceNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: bonusAmount > 0 ? `Includes $${bonusAmount.toFixed(2)} bonus payment` : undefined
        };

        const newPendingPaymentData = pruneUndefined(newPendingPaymentRaw);
        console.log('🔥 FIREBASE: Creating new pending payment with data:', newPendingPaymentData);
        const newPendingPaymentRef = await db.collection('pendingPayments').add(newPendingPaymentData);
        console.log('🔥 FIREBASE: ✅ New pending payment created with ID:', newPendingPaymentRef.id);
        
        // Verify the new pending payment creation
        console.log('🔥 FIREBASE: Verifying new pending payment creation...');
        const verifyNewPendingSnap = await newPendingPaymentRef.get();
        if (verifyNewPendingSnap.exists) {
          const newPendingData = verifyNewPendingSnap.data();
          console.log('🔥 FIREBASE: ✅ New pending payment verification - Status:', newPendingData?.status);
          console.log('🔥 FIREBASE: ✅ New pending payment verification - Bonus Amount:', newPendingData?.bonusAmount);
          console.log('🔥 FIREBASE: ✅ New pending payment verification - Total Amount:', newPendingData?.totalAmount);
        } else {
          console.log('🔥 FIREBASE: ❌ New pending payment not found after creation!');
        }
      } catch (e) {
        console.error('🔥 FIREBASE: ❌ Failed to create new pending payment:', e);
      }
    }

    console.log('🔥 FIREBASE: ===== FIREBASE OPERATIONS COMPLETED =====');
    console.log('🔥 FIREBASE: Summary - PendingPaymentId:', pendingPaymentId ? 'Updated existing' : 'Created new');
    console.log('🔥 FIREBASE: Summary - Client Email:', clientEmail);
    console.log('🔥 FIREBASE: Summary - Amount Total:', amountTotal);
    console.log('🔥 FIREBASE: Summary - Bonus Amount:', bonusAmount);
    console.log('🔥 FIREBASE: Summary - Invoice Number:', invoiceNumber);

    // Generate PDF invoice and send enhanced email (only if not skipping)
    try {
      if (clientEmail && !skipEmail) {
        console.log('📧 Payment Confirm: Starting enhanced email process...');
        const emailService = EmailService.getInstance();
        
        // Generate PDF invoice with proper amounts (including bonus if applicable)
        let pdfAttachment = undefined;
        
        try {
          console.log('📄 Payment Confirm: Preparing invoice data for PDF generation...');
          
          // Create items array with base service and bonus if applicable
          const items = [{
            id: '1',
            description: session.metadata?.optionName || 'Leadership Consultation',
            quantity: 1,
            unitPrice: baseAmount,
            total: baseAmount,
            type: 'service' as const
          }];
          
          // Add bonus item if there's a bonus amount
          if (bonusAmount > 0) {
            items.push({
              id: '2',
              description: 'Additional Payment (Bonus)',
              quantity: 1,
              unitPrice: bonusAmount,
              total: bonusAmount,
              type: 'service' as const
            });
          }
          
          const _invoiceData = {
            invoiceNumber,
            clientName: clientName || 'Unknown Client',
            clientEmail: clientEmail || 'unknown@example.com',
            issueDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            items,
            subtotal: amountTotal,
            taxAmount: 0,
            total: amountTotal,
            bonusAmount: bonusAmount,
            notes: bonusAmount > 0 ? `Includes $${bonusAmount.toFixed(2)} bonus payment` : undefined
          };
          
          console.log('📄 Payment Confirm: Invoice data prepared (PDF generation skipped - frontend only)');
          // PDF generation is now frontend-only
          // The confirmation email will be sent without PDF attachment
        } catch (pdfError) {
          console.error('❌ Payment Confirm: Failed to generate PDF:', pdfError);
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


