import React, { useEffect } from "react";
import "./App.css";
import axios from "axios";
import Home from "./components/Home";

const App = () => {
  useEffect(() => {
    liveServerCheck();

    async function liveServerCheck() {
      try {
        const response = await axios.get("/health");
        console.log("Server is live:", response.data);
      } catch (error) {
        console.error("Server is not reachable:", error);
      }
    }
  }, []);

  return (
    <div className="app">
      <Home />
    </div>
  );
};

export default App;
