import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const app = express();
app.use(cors());

const PORT = 5000;

// 🔐 GA4 Auth
const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account.json", // <-- your JSON file name
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

// 📊 GA4 Analytics Data API
const analyticsData = google.analyticsdata("v1beta");

// ✅ API: Get TOTAL PAGE VIEWS
app.get("/api/analytics/total-page-views", async (req, res) => {
  try {
    const client = await auth.getClient();

    const response = await analyticsData.properties.runReport({
      property: "properties/518251207",
      requestBody: {
        dateRanges: [
          {
            startDate: "2024-01-01",
            endDate: "today",
          },
        ],
        metrics: [
          {
            name: "screenPageViews",
          },
        ],
      },
      auth: client,
    });

    const totalViews =
      response.data.rows?.[0]?.metricValues?.[0]?.value || "0";

    res.json({
      totalPageViews: Number(totalViews),
    });
  } catch (error) {
    console.error("GA4 Error:", error.message);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// 🟢 Health check
app.get("/", (req, res) => {
  res.json({ status: "Analytics backend running 🚀" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
