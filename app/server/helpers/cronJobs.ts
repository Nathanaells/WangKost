import { IRentObject } from "@/types/type";
import cron from "node-cron";
import Queue from "bull";

const rentQueue = new Queue(
  "Rent Transcoding",
  "redis://default:gpRDTl8PQbDP289p31aHlksWxrOz1cek@redis-15147.c292.ap-southeast-1-1.ec2.cloud.redislabs.com:15147"
);

rentQueue.process(async function (job, done) {
  try {
    console.log("Processing job:", job.data);
    done();
  } catch (error) {
    console.error("Processing error:", error);
    done(error as Error);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    const resp = await fetch("http://localhost:3000/api/rents");

    if (!resp.ok) {
      throw new Error("Error Fetching Data");
    }

    const rents: IRentObject[] = await resp.json();

    for (let i = 0; i < rents.length; i++) {
      const rentId = `rentId${i + 1}`;
      await rentQueue.add({ [rentId]: rents[i]._id });
    }
  } catch (error: unknown) {
    console.error("Cron error:", error);
  }
});
