import axios from "axios";
import redis from "../db/redis.js";
import MngregaData from "../models/mngregaData.js";

export const getDistrictData = async (req, res) => {
  try {
    const { district, stateName, fin_year } = req.body;

    if (!district || !stateName) {
      return res.status(400).json({ message: "Choose your district and state" });
    }

    const cacheKey = `${stateName}_${district}_${fin_year}`;
    const cached = await redis.get(cacheKey);

    // 🔹 Serve from cache if available
    if (cached) {
      return res.status(200).json({
        message: "Data fetched from Redis cache ✅",
        data: JSON.parse(cached),
      });
    }

    // 🔹 Build API URL dynamically
    const params = [
      `api-key=${process.env.GOV_API_KEY}`,
      "format=json",
      "limit=1500",
    ];

    params.push(`filters[state_name]=${encodeURIComponent(stateName.toUpperCase())}`);
    if (fin_year) params.push(`filters[fin_year]=${encodeURIComponent(fin_year)}`);
    if (district) params.push(`filters[district_name]=${encodeURIComponent(district.toUpperCase())}`);

    const apiUrl = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?${params.join("&")}`;

    // 🔹 Fetch data with browser-like headers
    const apiRes = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
      },
    });

    const records = apiRes.data?.records || [];

    if (records.length === 0) {
      return res.status(404).json({
        message: "No data found for the given filters",
        url: apiUrl,
      });
    }

    // 🔹 Summarize per month
    const summary = {};

    for (const record of records) {
      const month = record.month || record.Month || record.MONTH;
      if (!month) continue;

      if (!summary[month]) {
        summary[month] = {
          month,
          tot_exp: 0,
          Approved_Labour_Budget:record.Approved_Labour_Budget || 0,
          Average_Wage_rate_per_day_per_person:record.Average_Wage_rate_per_day_per_person || 0,
          total_households_worked: 0,
          avg_payment_within_15_days: 0,
          count: 0,
        };
      }

      summary[month].tot_exp += parseFloat(record.Total_Exp || 0);
      summary[month].total_households_worked += parseInt(record.Total_Households_Worked || 0);
      summary[month].avg_payment_within_15_days += parseFloat(record.percentage_payments_gererated_within_15_days || 0);
      summary[month].count += 1;
    }

    // 🔹 Convert to array and finalize averages
    const monthlyData = Object.values(summary).map((m) => ({
      month: m.month,
      tot_exp: m.tot_exp.toFixed(2),
      Approved_Labour_Budget: m.Approved_Labour_Budget,
      Average_Wage_rate_per_day_per_person: m.Average_Wage_rate_per_day_per_person,
      total_households_worked: m.total_households_worked,
      avg_payment_within_15_days: (m.avg_payment_within_15_days / m.count).toFixed(2),
    }));

    // 🔹 Cache the summarized data
    await redis.set(cacheKey, JSON.stringify(monthlyData), "EX", 3600 * 12); // cache for 12 hours

    // 🔹 Optional: Store in DB (for offline use)
    await MngregaData.create({
      state_name: stateName,
      district_name: district,
      fin_year,
      data: monthlyData,
    });

    return res.status(200).json({
      message: "Data fetched and summarized successfully ✅",
      data: monthlyData,
    });
  } catch (error) {
    console.error("Error fetching district data:", error.message);
    return res.status(500).json({
      message: "Server Error ❌",
      error: error.message,
    });
  }
};