import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import { updateAllStateData } from "./src/utils/updateData.js";

dotenv.config();

(async () => {
  console.log("⚡ Initial data update...");
  await updateAllStateData();
})();

connectDB();

app.listen(3000, () => console.log("Server running on port 3000"));
