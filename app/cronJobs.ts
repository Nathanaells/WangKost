import dotenv from "dotenv";
dotenv.config();

import {
  IRentObject,
  IRentWithAdditionals,
  TransactionStatus,
} from "@/types/type";
import cron from "node-cron";
import Queue from "bull";
import dayjs from "dayjs";

const midtransSecret: string = process.env.MIDTRANS_SERVER_KEY as string;
const midtransApiUrl: string = process.env.MIDTRANS_API_URL as string;

const rentQueue = new Queue(
  "Rent Transcoding",
  "redis://default:gpRDTl8PQbDP289p31aHlksWxrOz1cek@redis-15147.c292.ap-southeast-1-1.ec2.cloud.redislabs.com:15147"
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

    let additionalTotal = 0;
    if (rentData.additionals && rentData.additionals.length > 0) {
      additionalTotal = rentData.additionals.reduce((total, additional) => {
        return total + additional.price;
      }, 0);
    }

    const totalAmount = rentData.price + additionalTotal;

    const joinAtDate = dayjs(rentData.joinAt);
    const dueDate = joinAtDate.add(1, "month").toDate();

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

    const midtransOrderId = `ORDER-${transactionId}-${Date.now()}`;
    const midtransPayload = {
      payment_type: "gopay",
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: `Tenant`,
        email: "tenant@wangkost.com",
        phone: "081223323423",
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
        midTransOrderId: midtransOrderId,
      }),
    });

    //n8n

    await fetch("https://wangkost.app.n8n.cloud/webhook-test/send-wa",{
      method : "POST",
      headers : {
        "Content-Type" : ""
      }
    })

    done();
  } catch (error) {
    done(error as Error);
  }
});

cron.schedule("* * * * *", async () => {
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
