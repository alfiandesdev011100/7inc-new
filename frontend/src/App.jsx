import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HSStaticMethods } from "preline";

import PreLoader from "./components/PreLoader";
import LandingContent from "./components/LandingContent";

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Efek 1: Loading Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2-3 detik
    return () => clearTimeout(timer);
  }, []);

  // Efek 2: Inisialisasi Preline UI agar interaksi JS jalan
  useEffect(() => {
    import("preline/preline");
  }, []);

  useEffect(() => {
    setTimeout(() => {
      HSStaticMethods.autoInit();
    }, 100);
  }, [location.pathname]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen bg-[#1E222A]">
          <PreLoader />
        </div>
      ) : (
        <LandingContent />
      )}
    </>
  );
}

export default App;
