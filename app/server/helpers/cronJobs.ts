import cron from "node-cron";
import Rent from "../models/Rent";
import Room from "../models/Room";
import Tenant from "../models/Tenant";
import Hostel from "../models/Hostel";
import Additional from "../models/Additional";
import Transaction from "../models/Transaction";
import { TransactionStatus } from "@/types/type";
import { generateInvoicePDF } from "./pdfGenerator";
import { createMidtransPayment } from "./midtrans";

/**
 * Cron job to generate invoices 7 days before due date
 * Runs every day at 00:00 (midnight)
 */
export function startInvoiceGenerationCron() {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running invoice generation cron job...");

    try {
      // Get all active rents
      const rents = await Rent.where("leaveAt", null).get();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const rent of rents) {
        try {
          // Calculate next payment date (1 month from joinAt)
          const joinDate = new Date(rent.joinAt);
          let nextPaymentDate = new Date(joinDate);

          // Find the next payment date
          while (nextPaymentDate <= today) {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          }

          // Check if we're 7 days before next payment
          const daysUntilPayment = Math.ceil(
            (nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilPayment === 7) {
            // Check if invoice already generated for this period
            const existingTransaction = await Transaction.where("rentId", rent._id)
              .where("dueDate", nextPaymentDate)
              .first();

            if (existingTransaction) {
              console.log(`Invoice already exists for rent ${rent._id}`);
              continue;
            }

            // Get related data
            const room = await Room.where("_id", rent.roomId).first();
            const tenant = await Tenant.where("_id", rent.tenantId).first();
            const hostel = await Hostel.where("_id", room?.hostelId).first();

            // Get additionals
            const additionalIds = rent.additionals || [];
            const additionals = await Additional.whereIn("_id", additionalIds).get();

            // Generate invoice number
            const invoiceNumber = `INV-${Date.now()}-${rent._id}`;
            const monthYear = nextPaymentDate.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            });

            // Create Midtrans payment
            const itemDetails = [
              {
                id: `room-${room?._id}`,
                price: room?.fixedCost || 0,
                quantity: 1,
                name: `Sewa Kamar - ${hostel?.name}`,
              },
              ...additionals.map((add: any) => ({
                id: `add-${add._id}`,
                price: add.price,
                quantity: 1,
                name: add.name,
              })),
            ];

            const midtransPayment = await createMidtransPayment({
              orderId: invoiceNumber,
              amount: rent.price,
              customerName: tenant?.name || "",
              customerEmail: tenant?.email || "",
              customerPhone: tenant?.phoneNumber || "",
              itemDetails,
            });

            // Generate PDF
            const pdfBuffer = await generateInvoicePDF({
              invoiceNumber,
              tenantName: tenant?.name || "",
              roomNumber: `Room ${room?._id?.toString().slice(-4)}`,
              hostelName: hostel?.name || "",
              hostelAddress: hostel?.address || "",
              monthYear,
              rentPrice: room?.fixedCost || 0,
              additionals: additionals.map((add: any) => ({
                name: add.name,
                price: add.price,
              })),
              totalPrice: rent.price,
              dueDate: nextPaymentDate.toLocaleDateString("id-ID"),
              paymentUrl: midtransPayment.redirect_url,
            });

            // Create transaction record
            await Transaction.create({
              tenantId: rent.tenantId,
              rentId: rent._id,
              amount: rent.price,
              status: TransactionStatus.pending,
              dueDate: nextPaymentDate,
              midTransOrderId: invoiceNumber,
            } as any);

            // Send to n8n webhook for WhatsApp notification
            const pdfBase64 = pdfBuffer.toString("base64");
            const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

            if (n8nWebhookUrl) {
              await fetch(n8nWebhookUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  phoneNumber: tenant?.phoneNumber,
                  tenantName: tenant?.name,
                  invoiceNumber,
                  paymentUrl: midtransPayment.redirect_url,
                  pdfBase64,
                  dueDate: nextPaymentDate.toLocaleDateString("id-ID"),
                  amount: rent.price,
                }),
              });

              console.log(`Invoice sent to ${tenant?.name} via WhatsApp`);
            }

            console.log(`Invoice generated for rent ${rent._id}`);
          }
        } catch (error) {
          console.error(`Error processing rent ${rent._id}:`, error);
        }
      }

      console.log("Invoice generation cron job completed");
    } catch (error) {
      console.error("Error in invoice generation cron job:", error);
    }
  });

  console.log("Invoice generation cron job started (runs daily at midnight)");
}
