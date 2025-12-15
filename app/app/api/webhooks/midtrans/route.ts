import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/server/models/Transaction";
import { TransactionStatus } from "@/types/type";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract notification data
    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      status_code,
      gross_amount,
    } = body;

    // Verify signature (security check)
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY || "Mid-server-T7T35sAlTGGZufA3x7H3MNQ1";
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
      console.error(`❌ Transaction not found for order_id: ${order_id}`);
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    console.log(`📦 Transaction found: ${transaction._id}`);
    console.log(`📊 Current status: ${transaction.status}`);
    console.log(`📊 Midtrans status: ${transaction_status}`);

    let newStatus = transaction.status;
    let paidAt = transaction.paidAt;

    switch (transaction_status) {
      case "capture":
        if (fraud_status === "accept") {
          newStatus = TransactionStatus.paid;
          paidAt = new Date();
          console.log("✅ Payment captured and accepted");
        } else if (fraud_status === "challenge") {
          newStatus = TransactionStatus.pending;
          console.log("⚠️  Payment challenged - under review");
        }
        break;

      case "settlement":
        // Payment successful
        newStatus = TransactionStatus.paid;
        paidAt = new Date();
        console.log("✅ Payment settled successfully");
        break;

      case "pending":
        // Waiting for payment
        newStatus = TransactionStatus.pending;
        console.log("⏳ Payment pending");
        break;

      case "deny":
      case "cancel":
      case "expire":
        // Payment failed/cancelled/expired
        newStatus = TransactionStatus.unpaid;
        console.log(`❌ Payment ${transaction_status}`);
        break;

      default:
        console.log(`⚠️  Unknown transaction status: ${transaction_status}`);
    }

    // Update transaction if status changed
    if (newStatus !== transaction.status) {
      await Transaction.where("_id", transaction._id).update({
        status: newStatus,
        paidAt: paidAt,
      });

      console.log(
        `✅ Transaction updated: ${transaction.status} → ${newStatus}`
      );

      // TODO: Send WhatsApp notification for payment success/failure
      if (newStatus === TransactionStatus.paid) {
        console.log(
          "💰 Payment confirmed! Consider sending success WhatsApp notification"
        );
        // You can add WhatsApp notification here
      }
    } else {
      console.log("ℹ️  No status change, skipping update");
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
    console.error("❌ Midtrans Webhook Error:", error);
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
