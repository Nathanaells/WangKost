import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/server/models/Transaction";
import { TransactionStatus } from "@/types/type";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      status_code,
      gross_amount,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 403 }
      );
    }

    const transaction = await Transaction.where(
      "midTransOrderId",
      order_id
    ).first();

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    let newStatus = transaction.status;
    let paidAt = transaction.paidAt;

    switch (transaction_status) {
      case "capture":
        if (fraud_status === "accept") {
          newStatus = TransactionStatus.paid;
          paidAt = new Date();
        } else if (fraud_status === "challenge") {
          newStatus = TransactionStatus.pending;
        }
        break;

      case "settlement":
        newStatus = TransactionStatus.paid;
        paidAt = new Date();

        break;

      case "pending":
        newStatus = TransactionStatus.pending;

        break;

      case "deny":
      case "cancel":
      case "expire":
        newStatus = TransactionStatus.unpaid;

        break;

      default:
        console.log(`Unknown transaction status: ${transaction_status}`);
    }

    if (newStatus !== transaction.status) {
      await Transaction.where("_id", transaction._id).update({
        status: newStatus,
        paidAt: paidAt,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification processed",
      data: {
        order_id,
        transaction_id: transaction._id,
        old_status: transaction.status,
        new_status: newStatus,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
