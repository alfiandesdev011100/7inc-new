import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Ambil data admin dari localStorage saat load
  useEffect(() => {
    const data = localStorage.getItem("adminData");
    if (data) {
      setAdmin(JSON.parse(data));
    }

    // Efek shadow pada header saat di-scroll
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi Logout Sederhana
  const handleLogout = () => {
    // Hapus data session
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    // Redirect ke login
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      {/* 1. SIDEBAR (Fixed Position) */}
      {/* PERBAIKAN: 
                - Mengubah z-50 menjadi z-40 agar Modal (z-50) bisa muncul di atasnya.
                - Menghapus bg-white dan border karena Sidebar component sudah punya style sendiri (Dark).
            */}
      <div className="fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 transform translate-x-0">
        <Sidebar />
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden ml-64">
        {/* 3. TOP HEADER (Navbar Atas) */}
        {/* PERBAIKAN: Mengubah z-40 menjadi z-30 agar tetap di bawah Sidebar (saat mobile/collapse) & Modal */}
        <header
          className={`sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-white/80 backdrop-blur-md transition-all duration-200 ${
            scrolled ? "shadow-sm" : ""
          }`}
        >
          {/* Bagian Kiri Header (Judul / Sapaan) */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 font-poppins">
              Dashboard
            </h2>
            <p className="text-xs text-gray-500">
              Selamat Datang,{" "}
              <span className="font-semibold text-blue-600">
                {admin?.name || "Admin"}
              </span>
            </p>
          </div>

          {/* Bagian Kanan Header (Profil & Logout) */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                admin?.role === "super_admin"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {admin?.role === "super_admin" ? "Super Admin" : "Content Writer"}
            </div>

            {/* Divider */}
            <div className="h-8 w-[1px] bg-gray-300 mx-1"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors bg-red-50 rounded-lg hover:bg-red-100 active:bg-red-200"
              title="Keluar dari Aplikasi"
            >
              <i className="ri-logout-box-r-line text-lg"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* 4. CONTENT AREA (Tempat Children dirender) */}
        <main className="w-full px-6 py-8 mx-auto">
          {/* Container untuk konten halaman */}
          <div className="min-h-[80vh] animate__animated animate__fadeIn">
            {children}
          </div>

          {/* Footer Kecil (Opsional) */}
          <footer className="mt-10 text-center text-xs text-gray-400 pb-4">
            &copy; {new Date().getFullYear()} Seven INC Admin Panel. All rights
            reserved.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
