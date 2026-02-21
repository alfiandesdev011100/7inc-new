import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

const ProtectedRouteAdmin = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("adminToken");
  const adminDataString = localStorage.getItem("adminData");
  const location = useLocation();

  // ================================
  // 1. CEK LOGIN
  // ================================
  if (!token || !adminDataString) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const adminData = JSON.parse(adminDataString);
  // ================================
  // 1.5. HANDLING LEGACY ROLE (admin_konten -> writer)
  // ================================
  // Jika user masih punya data lama di localStorage
  if (adminData.role === "admin_konten") {
    // Opsi A: Update otomatis (sedikit berisiko jika DB belum sync, tapi kita sudah migrate)
    adminData.role = "writer";
    localStorage.setItem("adminData", JSON.stringify(adminData));
    // Force reload untuk apply changes
    window.location.reload();
    return null;
  }

  const userRole = adminData.role;

  // ================================
  // 2. CEK ROLE (Authorization)
  // ================================
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`Role mismatch! User: ${userRole}, Allowed: ${allowedRoles}`);

    // JANGAN redirect ke halaman yang sama (Loop trap)
    // Jika user mencoba akses /writer tapi role bukan writer, lempar ke login atau dashboard masing-masing

    if (userRole === "admin" || userRole === "super_admin") {
      return <Navigate to="/admin" replace />;
    }

    if (userRole === "writer") {
      // Jika dia writer tapi mencoba akses halaman admin
      return <Navigate to="/writer/dashboard" replace />;
    }

    // Default: Lempar keluar
    localStorage.clear(); // Hapus sesi error
    return <Navigate to="/admin/login" replace />;
  }

  // ================================
  // 3. JIKA LOLOS SEMUA CEK → IZINKAN
  // ================================
  return children ? children : <Outlet />;
};

export default ProtectedRouteAdmin;
