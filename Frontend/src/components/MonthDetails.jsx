const formatCurrency = (v) => {
  if (v === null || v === undefined) return '-';
  return '₹' + Number(v).toLocaleString('en-IN');
}

const StatRow = ({ label, value, emoji }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap:12, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
    <div style={{ color:'#9fb3d6', fontSize:14 }}>{emoji} {label}</div>
    <div style={{ textAlign:'right', fontSize:16, fontWeight:700 }}>{value}</div>
  </div>
);

const MonthDetails = ({ monthKey, lang, records = [] }) => {



  if (!records || records.length === 0) {
    return (
      <div>
        <h3 style={{ margin: 0 }}>{monthKey}</h3>
        <div style={{ marginTop: 12, color: '#9fb3d6' }}>No detailed records available for this month.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
        <h3 style={{ margin: 0 }}>{monthKey} — {records.length} record(s)</h3>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12 }}>
        {records.map((r, i) => (
          <div key={i} style={{ padding:16, borderRadius:12, background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', boxShadow:'0 6px 18px rgba(2,6,23,0.6)' }}>
            <StatRow label={lang === "hi" ? 'कुल व्यय' : 'Total Expenditure'} value={formatCurrency(r.tot_exp)} emoji={'💰'} />
            <StatRow label={lang === "hi" ? 'परिवारों ने काम किया' : 'Households Worked'} value={(r.total_households_worked ?? r.households_worked ?? r.households ?? '-')} emoji={'👨‍👩‍👧‍👦'} />
            <StatRow label={lang === "hi" ? '15 दिन के भीतर औसत भुगतान (%)' : 'Avg Payment within 15d (%)'} value={(r.avg_payment_within_15_days ?? r.avg_payment ?? r.avg_payment_pct ?? '-')} emoji={'💳'} />
            <StatRow label={lang === "hi" ? 'अनुमोदित श्रमिक बजट' : 'Approved Labour Budget'} value={formatCurrency(r.Approved_Labour_Budget ?? r.approved_labour_budget)} emoji={'📊'} />
            <StatRow label={lang === "hi" ? 'औसत वेतन / दिन' : 'Avg Wage / day'} value={(r.Average_Wage_rate_per_day_per_person ?? r.average_wage_rate_per_day_per_person ?? '-')} emoji={'💵'} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthDetails;
