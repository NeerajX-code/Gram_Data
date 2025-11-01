import React, { useEffect } from "react";
import "./App.css";
import axios from "axios";
import Home from "./components/Home";

const App = () => {
  useEffect(() => {

    async function liveServerCheck() {
      try {
        const response = await axios.get("https://gram-data.onrender.com/health");
        console.log("Server is live:", response.data);
      } catch (error) {
        console.error("Server is not reachable:", error);
      }
    }
    liveServerCheck();
  }, []);

  return (
    <div className="app">
      <Home />
    </div>
  );
};

export default App;
