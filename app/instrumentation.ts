/**
 * Next.js Instrumentation Hook
 * Auto-runs when server starts (both dev and production)
 * Perfect for initializing cron jobs!
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Instrumentation disabled
    // Uncomment below to enable cron jobs
    // console.log("🚀 [Instrumentation] Server starting...");
    // const { startInvoiceGenerationCron } = await import(
    //   "./server/helpers/cronJobs"
    // );
    // startInvoiceGenerationCron();
    // console.log("✅ [Instrumentation] Cron jobs initialized!");
  }
}
