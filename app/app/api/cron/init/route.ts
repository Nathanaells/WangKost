import { startInvoiceGenerationCron } from "@/server/helpers/cronJobs";
import { NextRequest, NextResponse } from "next/server";

let cronStarted = false;

export async function GET(req: NextRequest) {
  try {
    if (cronStarted) {
      return NextResponse.json({
        message: "Cron jobs already running",
        status: "running",
      });
    }

    // Start cron jobs
    startInvoiceGenerationCron();
    cronStarted = true;

    return NextResponse.json({
      message: "Cron jobs initialized successfully",
      status: "started",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to start cron jobs" },
      { status: 500 }
    );
  }
}
