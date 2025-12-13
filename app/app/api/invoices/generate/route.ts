import { UnauthorizedError } from "@/server/errorHandler/classError";
import customError from "@/server/errorHandler/customError";
import Rent from "@/server/models/Rent";
import Room from "@/server/models/Room";
import Tenant from "@/server/models/Tenant";
import Hostel from "@/server/models/Hostel";
import Additional from "@/server/models/Additional";
import Transaction from "@/server/models/Transaction";
import { TransactionStatus } from "@/types/type";
import { generateInvoicePDF } from "@/server/helpers/pdfGenerator";
import { createMidtransPayment } from "@/server/helpers/midtrans";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/invoices/generate
 * Generate invoice for a rent and create Midtrans payment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerId = req.headers.get("x-owner-id");
    if (!ownerId) throw new UnauthorizedError();

    const { rentId } = body;
    const rentObjectId = new ObjectId(rentId);

    // Get rent data with populated fields
    const rent = await Rent.where("_id", rentObjectId).first();
    if (!rent) throw new Error("Rent not found");

    // Get related data
    const room = await Room.where("_id", rent.roomId).first();
    const tenant = await Tenant.where("_id", rent.tenantId).first();
    const hostel = await Hostel.where("_id", room?.hostelId).first();

    // Get additionals
    const additionalIds = rent.additionals || [];
    const additionals = await Additional.whereIn("_id", additionalIds).get();

    // Calculate next month's date
    const joinDate = new Date(rent.joinAt);
    const nextMonth = new Date(joinDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${rentId}`;
    const monthYear = nextMonth.toLocaleDateString("id-ID", {
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
      dueDate: nextMonth.toLocaleDateString("id-ID"),
      paymentUrl: midtransPayment.redirect_url,
    });

    // Create transaction record
    await Transaction.create({
      tenantId: rent.tenantId,
      rentId: rent._id,
      amount: rent.price,
      status: TransactionStatus.pending,
      dueDate: nextMonth,
      midTransOrderId: invoiceNumber,
    } as any);

    // Return PDF as base64 and payment URL
    return NextResponse.json({
      message: "Invoice generated successfully",
      data: {
        invoiceNumber,
        paymentUrl: midtransPayment.redirect_url,
        paymentToken: midtransPayment.token,
        pdfBase64: pdfBuffer.toString("base64"),
        tenantPhone: tenant?.phoneNumber,
        tenantEmail: tenant?.email,
      },
    });
  } catch (error: unknown) {
    console.error("Error generating invoice:", error);
    const { message, status } = customError(error);
    return NextResponse.json({ message }, { status });
  }
}
