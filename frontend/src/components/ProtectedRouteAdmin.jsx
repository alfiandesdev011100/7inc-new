import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Tambahkan prop 'allowedRoles' (array)
const ProtectedRouteAdmin = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("adminToken");
  const adminDataString = localStorage.getItem("adminData");
  const location = useLocation();

  // 1. Cek Token: Jika tidak ada token, tendang ke login
  if (!token || !adminDataString) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Parse data admin untuk ambil rolenya
  const adminData = JSON.parse(adminDataString);
  const userRole = adminData.role;

  // 2. Cek Role: Jika halaman ini butuh role khusus, dan user tidak punya role itu
  // Contoh: Halaman butuh ['super_admin'], tapi user role-nya 'admin_konten'
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect ke halaman dashboard admin utama atau halaman unauthorized
    // Di sini saya redirect ke dashboard admin biasa agar aman
    return <Navigate to="/admin" replace />;
  }

  // Jika lolos semua cek, tampilkan halaman
  return children;
};

export default ProtectedRouteAdmin;
