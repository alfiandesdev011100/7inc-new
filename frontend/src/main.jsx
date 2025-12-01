import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
// import "cally"; // Uncomment jika digunakan

// --- ADMIN DASHBOARD ---
import AdminApp from "./admin/AdminApp.jsx";

// --- ADMIN PAGES (OLD STRUCTURE - Masih Dipakai) ---
// Pastikan folder sudah direname menjadi 'pages' (bukan 'Page')
import AdminTentangKamiFull from "./admin/pages/TentangKamiFull.jsx";
import AdminBisnisKamiFull from "./admin/pages/BisnisKamiFull.jsx";
import AdminKontakFull from "./admin/pages/KontakFull.jsx";
import AdminLowonganKerja from "./admin/pages/LowonganKerja.jsx"; // Daftar Pelamar
import AdminLowonganKerjaFull from "./admin/pages/LowonganKerjaFull.jsx";
import AdminInternship from "./admin/pages/Internship.jsx";
import AdminSyaratLoker from "./admin/pages/SyaratLoker.jsx";
import AdminIsiBerita from "./admin/pages/IsiBerita.jsx"; // Preview isi berita

// --- ADMIN SETTINGS & HOME EDITORS ---
import AdminProfil from "./admin/settings/Profil.jsx";
import AdminDashboard from "./admin/home/EditNavbar.jsx"; // Edit Navbar & Logo
import AdminEditTentangKami from "./admin/home/EditTentangKami.jsx";
import AdminEditLowonganKerja from "./admin/home/EditLowonganKerja.jsx"; // Edit Konten Loker
import AdminEditBisnisKami from "./admin/home/EditBisnisKami.jsx";
import AdminLink from "./admin/home/EditLink.jsx";
import AdminEditInternship from "./admin/home/EditInternship.jsx";
import AdminEditHeroSection from "./admin/home/EditHeroSection.jsx";

// --- MODULE BARU (REFACTORED - Feature First) ---
import AdminJobPositionsIndex from "./admin/pages/job-positions/Index.jsx";
import AdminNewsIndex from "./admin/pages/news/Index.jsx";

// --- USER (PUBLIC) PAGES ---
import App from "./App.jsx";
import TentangKamiFull from "./pages/TentangKamiFull.jsx";
import BisnisKamiFull from "./pages/BisnisKamiFull.jsx";
import Internship from "./pages/Internship.jsx";
import LowonganKerja from "./pages/LowonganKerja.jsx";
import LowonganKerjaFull from "./pages/LowonganKerjaFull.jsx";
import KontakFull from "./pages/KontakFull.jsx";
import Berita from "./pages/Berita.jsx";
import SyaratLoker from "./pages/SyaratLoker.jsx";
import IsiBerita from "./pages/IsiBerita.jsx";

// --- AUTH & SECURITY ---
import LoginAdmin from "./masuk/LoginAdmin.jsx";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin.jsx";

// --- PLUGINS ---
import "remixicon/fonts/remixicon.css";
import "animate.css";
import AOS from "aos";
import "aos/dist/aos.css";

// Inisialisasi Animation on Scroll
AOS.init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* =========================================
            1. ROUTE PUBLIC (USER / CUSTOMER)
            Dapat diakses oleh siapa saja tanpa login
           ========================================= */}
        <Route path="/" element={<App />} />
        <Route path="/tentang-kami" element={<TentangKamiFull />} />
        <Route path="/bisnis-kami" element={<BisnisKamiFull />} />
        <Route path="/internship" element={<Internship />} />
        <Route path="/lowongan-kerja" element={<LowonganKerja />} />
        <Route path="/lowongan-full" element={<LowonganKerjaFull />} />
        <Route path="/kontak" element={<KontakFull />} />
        <Route path="/berita" element={<Berita />} />
        <Route path="/isi-berita" element={<IsiBerita />} />
        <Route path="/syarat-loker" element={<SyaratLoker />} />

        {/* =========================================
            2. ROUTE LOGIN ADMIN
           ========================================= */}
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/* =========================================
            3. ROUTE ADMIN (PROTECTED)
            Menggunakan logika allowedRoles
           ========================================= */}

        {/* --- GROUP 1: DASHBOARD UMUM --- 
            Bisa diakses oleh: SUPER ADMIN & ADMIN KONTEN
        */}
        <Route
          path="/admin"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminApp />
            </ProtectedRouteAdmin>
          }
        />

        {/* --- GROUP 2: MANAJEMEN KONTEN HARIAN --- 
            Bisa diakses oleh: SUPER ADMIN & ADMIN KONTEN
        */}

        {/* Module Berita (REFACTORED) */}
        <Route
          path="/admin/berita"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminNewsIndex />
            </ProtectedRouteAdmin>
          }
        />
        {/* Redirect route edit lama ke index baru */}
        <Route
          path="/admin/edit-berita"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminNewsIndex />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/isi-berita"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminIsiBerita />
            </ProtectedRouteAdmin>
          }
        />

        {/* Module Lowongan Kerja & Pelamar */}
        <Route
          path="/admin/lowongan-kerja" // Halaman Daftar Pelamar
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminLowonganKerja />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/lowongan-full"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminLowonganKerjaFull />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/syarat-loker"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminSyaratLoker />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/edit-loker" // Halaman Edit Konten Statis Loker
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminEditLowonganKerja />
            </ProtectedRouteAdmin>
          }
        />

        {/* Module Posisi Pekerjaan (REFACTORED - CRUD Master Data) */}
        <Route
          path="/admin/edit-posisi-pekerjaan"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminJobPositionsIndex />
            </ProtectedRouteAdmin>
          }
        />

        {/* Module Internship */}
        <Route
          path="/admin/internship"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminInternship />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/edit-internship"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin", "admin_konten"]}>
              <AdminEditInternship />
            </ProtectedRouteAdmin>
          }
        />

        {/* --- GROUP 3: AREA SENSITIF & KONFIGURASI (KHUSUS SUPER ADMIN) --- 
            Hanya Super Admin yang bisa akses setting vital perusahaan
        */}

        {/* Profil & Akun */}
        <Route
          path="/admin/profil"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminProfil />
            </ProtectedRouteAdmin>
          }
        />

        {/* Informasi Perusahaan */}
        <Route
          path="/admin/tentang-kami"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminTentangKamiFull />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/edit-info" // Edit Halaman Tentang Kami
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminEditTentangKami />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/bisnis-kami"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminBisnisKamiFull />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/edit-bisnis-kami"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminEditBisnisKami />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/kontak"
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminKontakFull />
            </ProtectedRouteAdmin>
          }
        />

        {/* Tampilan Website & Layout */}
        <Route
          path="/admin/dashboard" // Edit Navbar & Logo
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminDashboard />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/edit-appearance" // Edit Hero Section
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminEditHeroSection />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/edit-link" // Edit Link Sosmed
          element={
            <ProtectedRouteAdmin allowedRoles={["super_admin"]}>
              <AdminLink />
            </ProtectedRouteAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
