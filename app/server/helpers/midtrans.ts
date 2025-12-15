const midtransClient = require("midtrans-client");

interface PaymentData {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export async function createMidtransPayment(
  data: PaymentData
): Promise<{ token: string; redirect_url: string }> {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    const parameter = {
      transaction_details: {
        order_id: data.orderId,
        gross_amount: data.amount,
      },
      customer_details: {
        first_name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
      },
      item_details: data.itemDetails,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/finish`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error("Error creating Midtrans payment:", error);
    throw error;
  }
}

export async function checkPaymentStatus(orderId: string): Promise<any> {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    });

    const status = await snap.transaction.status(orderId);
    return status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
}
