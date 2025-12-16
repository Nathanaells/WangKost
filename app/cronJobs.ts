import dotenv from "dotenv";
dotenv.config();

import {
  IRentObject,
  IRentWithAdditionals,
  IRespTenant,
  TransactionStatus,
} from "@/types/type";
import cron from "node-cron";
import Queue from "bull";
import dayjs from "dayjs";
import Tenant from "./server/models/Tenant";

const midtransSecret: string = process.env.MIDTRANS_SERVER_KEY as string;
const midtransApiUrl: string = process.env.MIDTRANS_API_URL as string;

const rentQueue = new Queue(
  "Rent Transcoding",
  process.env.REDIS_URL as string
);

rentQueue.process(async function (job, done) {
  try {
    const rentId = job.data.rentId;
    const rentResp = await fetch(
      `http://localhost:3000/api/rents/${rentId}/rentAdditionals`
    );

    if (!rentResp.ok) {
      throw new Error(`Failed to fetch rent ${rentId}`);
    }

    const rentData: IRentWithAdditionals = await rentResp.json();

    console.log(rentData, "<<< RENT DATA");

    const tenant = await Tenant.where("_id", rentData.tenantId).first();

    console.log(tenant, "<<< TENANT");
    if (!tenant) {
      throw new Error(`Tenant not found for rent ${rentId}`);
    }
    // const respTenant = await fetch(
    //   `http://localhost:3000/api/tenants/${rentData.tenantId}`
    // );

    // if (!respTenant) {
    //   throw new Error("Failed to get Tenant");
    // }
    // const tenant: IRespTenant = await respTenant.json();

    let additionalTotal = 0;
    if (rentData.additionals && rentData.additionals.length > 0) {
      additionalTotal = rentData.additionals.reduce((total, additional) => {
        return total + additional.price;
      }, 0);
    }

    const totalAmount = rentData.price + additionalTotal;

    const dueDate = dayjs(rentData.joinAt);

    const transactionResp = await fetch(
      "http://localhost:3000/api/transaction",
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
    console.log(transactionId, "<<< TRANSACTION ID");

    const midtransPayload = {
      payment_type: "gopay",
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

    await fetch(`http://localhost:3000/api/transaction/${transactionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        midTransTransactionId: midtransResult.token,
        midTransOrderId: transactionId,
      }),
    });

    // Build WhatsApp message with bills details
    const formattedDueDate = dayjs(dueDate).format("DD MMMM YYYY");
    let message = `🏠 *TAGIHAN KOST - ${tenant.name}*\n\n`;
    message += `📅 *Jatuh Tempo:* ${formattedDueDate}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Rent price
    message += `🏠 *Biaya Sewa Kamar*\n`;
    message += `Rp ${rentData.price.toLocaleString("id-ID")}\n\n`;

    // Additionals
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
      "https://wangkost.app.n8n.cloud/webhook-test/send-wa",
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
      console.log(respN8N, "<<< RESP N8N");
      console.error("Failed to send WhatsApp notification");
    }

    done();
  } catch (error) {
    done(error as Error);
  }
});

cron.schedule("* * * * * *", async () => {
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
