import { useEffect, useState } from "react";
import axios from "axios";
import MonthDetails from "./MonthDetails";
import { useLanguage } from "../hooks/useLanguage";

const monthOrder = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const numericValue = (record, candidates) => {
  for (const c of candidates) {
    if (record[c] !== undefined && record[c] !== null) {
      const v = parseFloat(String(record[c]).replace(/[^0-9.-]+/g, ""));
      if (!isNaN(v)) return v;
    }
  }
  return 0;
};

const monthLabelFromRecord = (r) => {
  const keys = Object.keys(r || {});
  const mk = keys.find((k) => /month|mnth|mon/i.test(k));
  if (mk) return String(r[mk]);
  const m2 = keys.find((k) => /month_name|mnth_name/i.test(k));
  if (m2) return String(r[m2]);
  const m3 = keys.find((k) => /mth|mm|m_/i.test(k));
  if (m3) return String(r[m3]);
  return "Unknown";
};

const normalizeMonthLabel = (raw) => {
  let label = String(raw || "").trim();
  const num = parseInt(label, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    const monthsArr = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    label = monthsArr[num - 1];
  }
  if (label.length === 0) return "Unknown";
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const Home = () => {
  const { lang, t, toggle } = useLanguage();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [finYear, setFinYear] = useState("2024-2025");
  const [rawRecords, setRawRecords] = useState([]);
  const [monthsData, setMonthsData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`;
          const res = await fetch(url, {
            headers: {
              "User-Agent": "GramData-App",
              "Accept-Language": "en",
            },
          });
          const json = await res.json();
          const { state, state_district } = json.address;
          if (state) setStateName(state);
          console.log("Detected district:", state_district);
          if (state_district)
            setDistrict(state_district || json.address.city_district || "");
        } catch (err) {
          console.error(err);
          setError("Unable to reverse-geocode your location");
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        setError("Permission denied or unable to get location");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 5 }
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (!district || !stateName) {
      setError("Please provide district and state (detected or filled)");
      return;
    }
    setLoading(true);
    try {
      const payload = { district, stateName, fin_year: finYear };
      const res = await axios.post(`https://gram-data.onrender.com/api/mgnrega/`, payload);
      const records = res.data?.data || [];

      setRawRecords(records);

      // Build monthsData strictly from months present in server data
      const grouped = new Map();
      records.forEach((r) => {
        const label = normalizeMonthLabel(monthLabelFromRecord(r));
        const tot = numericValue(r, ["tot_exp"]);
        if (!grouped.has(label)) grouped.set(label, 0);
        grouped.set(label, grouped.get(label) + (isNaN(tot) ? 0 : tot));
      });
      const monthsDataOrdered = monthOrder
        .filter((m) => grouped.has(m))
        .map((m) => ({
          month: m,
          tot_exp_lakhs: +(grouped.get(m) / 100000).toFixed(2),
        }));

      setMonthsData(monthsDataOrdered);
      setSelectedMonth(null);
      // Clear previous error on success
      setError("");
      if (records.length === 0) setError("No records found for the selection");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Error fetching data from server"
      );
      setMonthsData([]);
      setSelectedMonth(null);
      setRawRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-card">
      <div className="home-header">
        <div className="brand">
          <div className="logo">GD</div>
          <div>
            <h1 style={{ fontSize: 20 }}>{t("title")}</h1>
            <p style={{ marginTop: 6, color: "#9fb3d6" }}>
              {t("selectDistrict")}
            </p>
          </div>
        </div>

        <div className="controls" style={{ alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "#9fb3d6", marginRight: 12 }}>
            {loadingLocation ? t("detectingLocation") : t("locationReady")}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={toggle}
              aria-label="Toggle language"
              title="Language"
              className="btn"
              style={{ padding: "8px 12px" }}
            >
              {lang === "en" ? "English / हिंदी" : "English / हिंदी"}
            </button>
            <button onClick={detectLocation} className="btn">
              {t("detectLocation")}
            </button>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>{"State"}</label>
          <input
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder="State (auto)"
          />
        </div>
        <div className="field">
          <label>{t("selectDistrict")}</label>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="District (auto)"
          />
        </div>
        <div className="field">
          <label>Financial Year</label>
          <select value={finYear} onChange={(e) => setFinYear(e.target.value)}>
            {Array.from({ length: 3 }).map((_, i) => {
              const start = 2023 + i;
              const label = `${start}-${start + 1}`;
              return (
                <option key={label} value={label}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="submit-row">
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSubmit} className="btn">
            {loading ? "Loading…" : t("fetchData")}
          </button>
        </div>
      </div>

      {/* Month buttons area (large, responsive) */}
      <div style={{ marginTop: 20 }}>
        <div className="month-grid">
          {monthsData.map((d) => (
            <button
              key={d.month}
              className={`month-pill ${
                selectedMonth === d.month ? "active" : ""
              }`}
              onClick={() => setSelectedMonth(d.month)}
              aria-pressed={selectedMonth === d.month}
              aria-label={`${d.month} - total expenditure ${d.tot_exp_lakhs} lakhs`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" fill="#22c55e" />
                  <path
                    d="M8 12h8M10 8h6M10 16h6"
                    stroke="#05204a"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <text
                    x="12"
                    y="13"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#05204a"
                  >
                    ₹
                  </text>
                </svg>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: selectedMonth === d.month ? "#04233a" : "#e6eef8",
                    }}
                  >
                    📅 {d.month}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 15,
                      color: selectedMonth === d.month ? "#04233a" : "#9fb3d6",
                      fontWeight: 800,
                    }}
                  >
                    ₹ {d.tot_exp_lakhs} L
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div
          className="error-card"
          style={{
            position: "fixed",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          role="alert"
        >
          <div
            className="error-left"
            style={{ width: "clamp(250px,40vw,400px)" }}
          >
            <div style={{ fontSize: 20 }}>⚠️</div>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>
                Something went wrong
              </div>
              <div style={{ color: "#5b0b0b" }}>{error}</div>
            </div>
          </div>
          <div>
            <button
              className="error-close"
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="details" style={{ marginTop: 18 }}>
        {error ? null : null}
        {selectedMonth ? (
          <MonthDetails
            monthKey={selectedMonth}
            records={rawRecords.filter((r) => {
              const m = normalizeMonthLabel(monthLabelFromRecord(r));
              return m === selectedMonth;
            })}
          />
        ) : (
          <div style={{ color: "#9fb3d6" }}>{t("clickMonth")}</div>
        )}
      </div>
    </div>
  );
};

export default Home;
