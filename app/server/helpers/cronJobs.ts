import cron from "node-cron";

export function startTestingCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const startTime = new Date();
      console.log(
        `\n⏰ [${startTime.toISOString()}] Testing Cron Job Running...`
      );

      const API_URL = "http://localhost:3000/api/rents";
      const OWNER_ID = "693dcfd8b69eaa40081ea1f3";
      const JWT_TOKEN =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTNkY2ZkOGI2OWVhYTQwMDgxZWExZjMiLCJlbWFpbCI6Im5hdGhhbmFlbEBnbWFpbC5jb20iLCJwaG9uZU51bWJlciI6IjA4MTIyNzQ0NjU1MCIsImlhdCI6MTc2NTcwNDIxM30.v4xC-yPUl4tGhOaW7nSoEYRLl9xPHgvdl7iJLyWnWM4";
      const N8N_WEBHOOK = "https://wangkost.app.n8n.cloud/webhook-test/send-wa";
      const WHATSAPP_NUMBER = "+6281532812020";
      const rentResponse = await fetch(API_URL, {
        method: "GET",
        headers: {
          "x-owner-id": OWNER_ID,
          Cookie: `access_token=${JWT_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!rentResponse.ok) {
        throw new Error(
          `API Error: ${rentResponse.status} ${rentResponse.statusText}`
        );
      }

      const rents = await rentResponse.json();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const message =
        `🏠 *WangKost Rent Report*\n\n` +
        `⏰ Time: ${startTime.toLocaleString("id-ID")}\n` +
        `📊 Total Rents: ${rents.length}\n` +
        `⚡ API Response Time: ${duration}ms\n\n` +
        `${
          rents.length > 0
            ? `📋 *Recent Rents:*\n${rents
                .slice(0, 3)
                .map(
                  (rent: any, idx: number) =>
                    `${idx + 1}. Room: ${rent.roomId}\n   Price: Rp ${
                      rent.price?.toLocaleString("id-ID") || "N/A"
                    }\n   Join: ${new Date(rent.joinAt).toLocaleDateString(
                      "id-ID"
                    )}`
                )
                .join("\n\n")}`
            : "❌ No rents found"
        }`;

      const whatsappResponse = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: WHATSAPP_NUMBER,
          message: message,
        }),
      });

      if (!whatsappResponse.ok) {
        throw new Error(`n8n Webhook Error: ${whatsappResponse.status}`);
      }

      const whatsappResult = await whatsappResponse.json();
    } catch (error) {
      try {
        await fetch("https://wangkost.app.n8n.cloud/webhook-test/send-wa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: "+6281532812020",
            message:
              `❌ *WangKost Cron Job Error*\n\n` +
              `Time: ${new Date().toLocaleString("id-ID")}\n` +
              `Error: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
          }),
        });
      } catch (notifError) {
        console.error("❌ Failed to send error notification:", notifError);
      }
    }
  });
}

startTestingCron();
