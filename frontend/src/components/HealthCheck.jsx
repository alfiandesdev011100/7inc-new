import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const HealthCheck = () => {
    const [status, setStatus] = useState("checking"); // checking, online, offline

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Try to hit a simple public endpoint
                await axios.get(`${API_BASE}/about`, { timeout: 3000 });
                setStatus("online");
            } catch (err) {
                setStatus("offline");
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (status === "online") return null; // Don't show anything if everything is fine

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-10 duration-500">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border ${status === "offline" ? "bg-red-50 border-red-200 text-red-600" : "bg-blue-50 border-blue-200 text-blue-600"
                }`}>
                <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${status === "offline" ? "bg-red-500" : "bg-blue-500"} animate-ping absolute inset-0`}></div>
                    <div className={`w-3 h-3 rounded-full ${status === "offline" ? "bg-red-500" : "bg-blue-500"} relative`}></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-black uppercase tracking-wider leading-none mb-1">
                        {status === "offline" ? "Server Offline" : "Mengecek Koneksi..."}
                    </span>
                    <span className="text-[10px] font-bold opacity-70 leading-none">
                        {status === "offline" ? "Pastikan Laravel Port 8000 Aktif" : "Menghubungkan ke API"}
                    </span>
                </div>
                {status === "offline" && (
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl bg-red-100 hover:bg-red-200 transition-colors"
                        title="Segarkan"
                    >
                        <i className="ri-refresh-line"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default HealthCheck;
