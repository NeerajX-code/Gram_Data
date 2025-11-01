import mongoose from "mongoose";

const mngregaDataSchema = new mongoose.Schema({
  state_name: { type: String, required: true },
  district_name: { type: String, required: true },
  data: {
    type: [
      {
        tot_exp: String,
        Approved_Labour_Budget: Number,
        Average_Wage_rate_per_day_per_person: Number,
        total_households_worked: Number,
        avg_payment_within_15_days: Number,
      },
    ],
    required: true,
  },
  fin_year: { type: String, required: true },
});

const MngregaData = mongoose.model("MngregaData", mngregaDataSchema);

export default MngregaData;
