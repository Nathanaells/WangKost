"use server";

import { cookies } from "next/headers";

interface IPayment {
  _id: string;
  tenantName: string;
  hostelName: string;
  amount: number;
  status: "PAID" | "UNPAID" | "PENDING";
  dueDate: string;
  paidDate?: string;
  month: string;
}

interface ITransaction {
  _id: string;
  tenantId: string;
  status: string;
  amount: number;
  dueDate: string;
  rentId: string;
  createdAt: string;
  updatedAt: string;
  midTransOrderId?: string;
  midTransTransactionId?: string;
  paidAt?: string;
  hostel?: {
    name: string;
  };
  tenant?: {
    name: string;
  };
}

interface IApiResponse {
  data: ITransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCookies(): Promise<string> {
  const cookieStore = await cookies();
  const access_token = cookieStore.get("access_token");
  const token = access_token?.value as string;
  return token;
}

export async function fetchTransactionsData(
  page: number = 1,
  limit: number = 100,
  status?: string
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) {
      return { success: false, message: "Not authenticated", payments: [] };
    }

    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== "all") {
      params.append("status", status.toUpperCase());
    }

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/transaction?${params}`,
      {
        headers: {
          Cookie: `access_token=${token.value}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch transactions",
        payments: [],
      };
    }

    const apiData: IApiResponse = await response.json();

    // Map API response to payment format
    const mappedPayments: IPayment[] = apiData.data.map(
      (transaction: ITransaction) => {
        const dueDate = new Date(transaction.dueDate);
        const month = dueDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        return {
          _id: transaction._id,
          tenantName: transaction.tenant?.name || "Unknown",
          hostelName: transaction.hostel?.name || "-",
          amount: transaction.amount,
          status: transaction.status as "PAID" | "UNPAID" | "PENDING",
          dueDate: transaction.dueDate,
          paidDate: transaction.paidAt,
          month,
        };
      }
    );

    return { success: true, payments: mappedPayments };
  } catch (error) {
    console.error("Error fetching transactions data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      payments: [],
    };
  }
}
