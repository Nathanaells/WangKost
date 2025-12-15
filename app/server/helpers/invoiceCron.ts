import cron from "node-cron";
import Rent from "../models/Rent";
import Tenant from "../models/Tenant";
import Room from "../models/Room";
import Transaction from "../models/Transaction";
import { TransactionStatus } from "@/types/type";

// Configuration
const N8N_WEBHOOK = process.env.N8N_WEBHOOK as string;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY as string;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION as string;
const MIDTRANS_API_URL = process.env.MIDTRANS_API_URL as string;

export function startInvoiceGenerationCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const startTime = new Date();

      const rents = await Rent.where("leaveAt", null).get();
      let processedCount = 0;
      let skippedCount = 0;

      for (const rent of rents) {
        try {
          const joinDate = new Date(rent.joinAt);
          const minutesSinceJoin = Math.floor(
            (startTime.getTime() - joinDate.getTime()) / (1000 * 60)
          );
          const daysSinceJoin = Math.floor(
            (startTime.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          console.log(
            `\n📅 Rent ID: ${rent._id} - Minutes since join: ${minutesSinceJoin} (${daysSinceJoin} days)`
          );
          if (minutesSinceJoin < 1) {
            console.log(
              `⏭️  Skipping - Too soon (need at least 1 minute for testing)`
            );
            skippedCount++;
            continue;
          }

          const existingTransaction = await Transaction.where(
            "rentId",
            rent._id
          ).first();

          if (existingTransaction) {
            skippedCount++;
            continue;
          }

          const rentInstance = await Rent.find(rent._id);
          if (!rentInstance) {
            continue;
          }

          const additionals = await rentInstance.additionals().get();

          let totalAmount = rent.price;
          let additionalDetails: any[] = [];

          for (const additional of additionals) {
            totalAmount += additional.price;
            additionalDetails.push({
              name: additional.name,
              price: additional.price,
            });
          }

          if (additionalDetails.length > 0) {
            additionalDetails.forEach((add) => {
              console.log(
                `   - ${add.name}: Rp ${add.price.toLocaleString("id-ID")}`
              );
            });
          }

          const tenant = await Tenant.find(rent.tenantId);
          if (!tenant) {
            console.log(`❌ Tenant not found`);
            continue;
          }

          console.log(`👤 Tenant Info:`);
          console.log(`   - ID: ${tenant._id}`);
          console.log(`   - Name: ${tenant.name}`);
          console.log(`   - Phone: ${tenant.phoneNumber}`);
          const room = await Room.find(rent.roomId);

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
          const orderId = `INV-${rent._id}-${Date.now()}`;

          const midtransPayload = {
            transaction_details: {
              order_id: orderId,
              gross_amount: totalAmount,
            },
            customer_details: {
              first_name: tenant.name,
              email: tenant.email,
              phone: tenant.phoneNumber,
            },
            item_details: [
              {
                id: `room-${room?._id}`,
                price: rent.price,
                quantity: 1,
                name: `Room Rent`,
              },
              ...additionalDetails.map((add, idx) => ({
                id: `additional-${idx}`,
                price: add.price,
                quantity: 1,
                name: add.name,
              })),
            ],
            enabled_payments: [
              "gopay",
              "shopeepay",
              "qris",
              "bca_va",
              "bni_va",
              "bri_va",
              "permata_va",
              "other_va",
            ],
          };

          const authString = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
            "base64"
          );

          const midtransResponse = await fetch(MIDTRANS_API_URL, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify(midtransPayload),
          });

          const responseText = await midtransResponse.text();

          if (!midtransResponse.ok) {
            throw new Error(
              `Midtrans Error: ${midtransResponse.status} - ${responseText}`
            );
          }

          const midtransResult = JSON.parse(responseText);
          const newTransaction = await Transaction.create({
            tenantId: rent.tenantId,
            rentId: rent._id,
            amount: totalAmount,
            status: TransactionStatus.pending,
            dueDate: dueDate,
            midTransTransactionId: midtransResult.token,
            midTransOrderId: orderId,
          });

          console.log(`✅ Transaction saved: ${newTransaction._id}`);

          // Step 10: Prepare WhatsApp message with payment link
          const paymentUrl = midtransResult.redirect_url;

          const message =
            `🏠 *WangKost - Invoice Payment*\n\n` +
            `Hi ${tenant.name}! 👋\n\n` +
            `📅 Invoice Date: ${new Date().toLocaleDateString("id-ID")}\n` +
            `📍 Room ID: ${room?._id || "N/A"}\n` +
            `⏰ Billing Period: Day ${daysSinceJoin}\n\n` +
            `💰 *Payment Details:*\n` +
            `🏠 Room Rent: Rp ${rent.price.toLocaleString("id-ID")}\n` +
            (additionalDetails.length > 0
              ? additionalDetails
                  .map(
                    (add) =>
                      `➕ ${add.name}: Rp ${add.price.toLocaleString("id-ID")}`
                  )
                  .join("\n") + "\n"
              : "") +
            `━━━━━━━━━━━━━━━\n` +
            `💵 *TOTAL: Rp ${totalAmount.toLocaleString("id-ID")}*\n\n` +
            `� *Payment Link:*\n` +
            `${paymentUrl}\n\n` +
            `Choose your payment method:\n` +
            `✅ GoPay / ShopeePay / QRIS\n` +
            `✅ Bank Transfer (BCA/BNI/BRI/Permata)\n` +
            `✅ All major payment methods\n\n` +
            `🔖 Order ID: ${orderId}\n` +
            `📆 Due Date: ${dueDate.toLocaleDateString("id-ID")}\n\n` +
            `⚠️ Please complete payment before due date!\n` +
            `Thank you! 🙏`;

          // Step 11: Send WhatsApp notification via n8n
          // Ensure phone number has +62 format
          let phoneNumber = tenant.phoneNumber;
          if (!phoneNumber.startsWith("+")) {
            phoneNumber = phoneNumber.startsWith("62")
              ? `+${phoneNumber}`
              : phoneNumber.startsWith("0")
              ? `+62${phoneNumber.substring(1)}`
              : `+62${phoneNumber}`;
          }

          console.log(`📱 Sending invoice to ${phoneNumber}...`);
          const whatsappPayload = {
            phoneNumber: phoneNumber,
            message: message,
          };
          console.log(
            `📤 WhatsApp Payload:`,
            JSON.stringify(whatsappPayload, null, 2)
          );

          const whatsappResponse = await fetch(N8N_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(whatsappPayload),
          });

          const whatsappResponseText = await whatsappResponse.text();
          console.log(
            `📥 WhatsApp Response Status: ${whatsappResponse.status}`
          );
          console.log(`📥 WhatsApp Response Body:`, whatsappResponseText);

          if (!whatsappResponse.ok) {
            console.log(
              `⚠️  Warning: WhatsApp notification failed (${whatsappResponse.status})`
            );
          } else {
            console.log(`✅ WhatsApp invoice sent successfully!`);
          }

          processedCount++;
          console.log(
            `✅ Invoice processed successfully for Rent ID: ${rent._id}`
          );
        } catch (rentError) {
          console.error(`❌ Error processing rent ${rent._id}:`, rentError);
          // Continue with next rent
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📊 Cron Job Summary:`);
      console.log(`✅ Invoices Generated: ${processedCount}`);
      console.log(`⏭️  Rents Skipped: ${skippedCount}`);
      console.log(`⏱️  Total Duration: ${duration}ms`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    } catch (error) {
      console.error("❌ Invoice Generation Cron Error:", error);

      // Send error notification to admin WhatsApp
      try {
        await fetch(N8N_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: "+6281227446550", // Admin number
            message:
              `❌ *WangKost Cron Job Error*\n\n` +
              `⏰ Time: ${new Date().toLocaleString("id-ID")}\n` +
              `🐛 Error: ${
                error instanceof Error ? error.message : "Unknown error"
              }\n\n` +
              `Please check server logs!`,
          }),
        });
      } catch (notifError) {
        console.error("❌ Failed to send error notification:", notifError);
      }
    }
  });
}
