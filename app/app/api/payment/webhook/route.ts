import customError from "@/server/errorHandler/customError";
import Transaction from "@/server/models/Transaction";
import { TransactionStatus } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/payment/webhook
 * Handle Midtrans payment notification webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureKey = body.signature_key;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    if (signatureKey !== expectedSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 }
      );
    }

    // Get transaction
    const transaction = await Transaction.where(
      "midTransOrderId",
      orderId
    ).first();

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update transaction status based on Midtrans status
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let newStatus = transaction.status;
    let paidAt = transaction.paidAt;

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        newStatus = TransactionStatus.paid;
        paidAt = new Date();
      }
    } else if (transactionStatus === "settlement") {
      newStatus = TransactionStatus.paid;
      paidAt = new Date();
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      newStatus = TransactionStatus.unpaid;
    } else if (transactionStatus === "pending") {
      newStatus = TransactionStatus.pending;
    }

    // Update transaction
    await Transaction.where("_id", transaction._id).update({
      status: newStatus,
      paidAt: paidAt,
      midTransTransactionId: body.transaction_id,
    } as any);

    console.log(`Transaction ${orderId} updated to ${newStatus}`);

    return NextResponse.json({
      message: "Webhook processed successfully",
      status: newStatus,
    });
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
