import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { google } from "googleapis";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

/**
 * 🔐 GA4 Authentication
 * Uses SERVICE ACCOUNT JSON from ENV (Render-safe)
 */
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT_JSON),
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

/**
 * 📊 GA4 Analytics Data API
 */
const analyticsData = google.analyticsdata("v1beta");

/**
 * ✅ API: Get TOTAL PAGE VIEWS (All-time)
 */
app.get("/api/analytics/total-page-views", async (req, res) => {
  try {
    const client = await auth.getClient();

    const response = await analyticsData.properties.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
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
    console.error("❌ GA4 Error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

/**
 * 🟢 Health Check
 */
app.get("/", (req, res) => {
  res.json({ status: "Analytics backend running 🚀" });
});

/**
 * 🚀 Start Server
 */
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
