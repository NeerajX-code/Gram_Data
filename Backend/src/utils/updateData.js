import axios from "axios";
import MngregaData from "../models/mngregaData.js";
import dotenv from "dotenv";
dotenv.config();

export async function updateAllStateData() {
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  for (const state of states) {
    try {
      const hasStateData = await MngregaData.findOne({ state_name: state });

      if (hasStateData) {
        console.log(`Updating Data for ${state} already exists.`);

        const params = [
          `api-key=${process.env.GOV_API_KEY}`,
          "format=json",
          "limit=1000",
        ];
        params.push(`filters[state_name]=${encodeURIComponent(state)}`);

        const apiUrl = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?${params.join(
          "&"
        )}`;

        const apiRes = await axios.get(apiUrl);
        const data = apiRes.data;
        hasStateData.data = data.records;
        await hasStateData.save();
      }
    } catch (error) {
      console.error(`Error updating data for ${state}:`, error);
    }
  }
}