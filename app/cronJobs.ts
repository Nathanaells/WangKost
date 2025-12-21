import dotenv from "dotenv";
dotenv.config();

import {
  IRentObject,
  IRentWithAdditionals,
  ITransaction,
  TransactionStatus,
} from "@/types/type";
import cron from "node-cron";
import Queue from "bull";
import dayjs from "dayjs";
import Tenant from "./server/models/Tenant";
import Transaction from "./server/models/Transaction";
import { ObjectId } from "mongodb";

const midtransSecret: string = process.env.MIDTRANS_SERVER_KEY as string;
const midtransApiUrl: string = process.env.MIDTRANS_API_URL as string;

console.log("Cron job started...");

const rentQueue = new Queue(
  "Rent Transcoding",
  process.env.REDIS_URL as string
);

rentQueue.process(async function (job, done) {
  try {
    console.log(`Processing rent ${job.data.rentId}...`);
    const rentId = job.data.rentId;
    const rentObjectId = new ObjectId(rentId);

    const transaction = await Transaction.where("rentId", rentObjectId).first();

    if (transaction) {
      console.log(`Transaction already exists for rent ${rentId}, skipping...`);
      done();
      return;
    }
    const rentResp = await fetch(
      `http://localhost:3000/api/rents/${rentId}/rentAdditionals`
    );

    if (!rentResp.ok) {
      throw new Error(`Failed to fetch rent ${rentId}`);
    }

    const rentData: IRentWithAdditionals = await rentResp.json();
    const tenant = await Tenant.where("_id", rentData.tenantId).first();

    if (!tenant) {
      throw new Error(`Tenant not found for rent ${rentId}`);
    }

    let additionalTotal = 0;
    if (rentData.additionals && rentData.additionals.length > 0) {
      additionalTotal = rentData.additionals.reduce((total, additional) => {
        return total + additional.price;
      }, 0);
    }

    const totalAmount = rentData.price + additionalTotal;

    const dueDate = dayjs(rentData.joinAt);

    const transactionResp = await fetch(
      "http://localhost:3000/api/publicTransaction",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: rentData.tenantId,
          rentId: rentData._id,
          amount: totalAmount,
          dueDate: dueDate,
          status: TransactionStatus.unpaid,
        }),
      }
    );

    if (!transactionResp.ok) {
      const errorData = await transactionResp.json();
      throw new Error(`Failed to create transaction: ${errorData.message}`);
    }

    const transactionResult = await transactionResp.json();

    const transactionId = transactionResult.transactionId;

    const midtransPayload = {
      payment_type: "credit_card",
      transaction_details: {
        order_id: transactionId,
        gross_amount: totalAmount,
      },
      customer_details: {
        name: tenant.name,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
      },
    };

    const midtransResp = await fetch(midtransApiUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Basic ${Buffer.from(midtransSecret + ":").toString(
          "base64"
        )}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    if (!midtransResp.ok) {
      const errorText = await midtransResp.text();
      throw new Error(`Failed to create Midtrans payment: ${errorText}`);
    }

    const midtransResult = await midtransResp.json();

    await fetch(
      `http://localhost:3000/api/publicTransaction/${transactionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          midTransTransactionId: midtransResult.token,
          midTransOrderId: transactionId,
        }),
      }
    );

    const formattedDueDate = dayjs(dueDate).format("DD MMMM YYYY");
    let message = `🏠 *TAGIHAN KOST - ${tenant.name}*\n\n`;
    message += `📅 *Jatuh Tempo:* ${formattedDueDate}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `🏠 *Biaya Sewa Kamar*\n`;
    message += `Rp ${rentData.price.toLocaleString("id-ID")}\n\n`;

    if (rentData.additionals && rentData.additionals.length > 0) {
      message += `📦 *Biaya Tambahan:*\n`;
      rentData.additionals.forEach((additional) => {
        message += `• ${additional.name}: Rp ${additional.price.toLocaleString(
          "id-ID"
        )}\n`;
      });
      message += `\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL TAGIHAN*\n`;
    message += `*Rp ${totalAmount.toLocaleString("id-ID")}*\n\n`;

    message += `🔗 *Link Pembayaran:*\n`;
    message += `${midtransResult.redirect_url}\n\n`;

    message += `Silakan lakukan pembayaran sebelum tanggal jatuh tempo.\n`;
    message += `Terima kasih! 🙏`;

    // Send to n8n webhook
    const respN8N = await fetch(
      "https://wangkost.app.n8n.cloud/webhook/send-wa",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: tenant.phoneNumber,
          message: message,
        }),
      }
    );

    if (!respN8N.ok) {
      console.error("Failed to send WhatsApp notification");
    }

    done();
  } catch (error) {
    done(error as Error);
  }
});

cron.schedule("*/15 * * * * *", async () => {
  try {
    const resp = await fetch("http://localhost:3000/api/rents");

    if (!resp.ok) {
      throw new Error("Error fetching rents");
    }

    const rents: IRentObject[] = await resp.json();

    rents.forEach(async (rent) => {
      const rentId = rent._id.toString();
      await rentQueue.add({ rentId });
      console.log(`[Cron] Added rent ${rentId} to queue`);
    });
  } catch (error: unknown) {
    console.error("[Cron] Error:", error);
  }
});

cron.schedule("* * * * *", async () => {
  const nowDate = new Date();
  const transcation = await Transaction.where("dueDate", ">", nowDate).get();
  /* 
    1. Map rent ID transaction,
    2. Dapetin tenant,
    3. Update Tenant status jadi false, kirim notifikasi ke wa pakai n8n dan dibuat stack baru
    */
});
