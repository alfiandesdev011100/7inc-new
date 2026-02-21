import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// --- ADMIN DASHBOARD ---
import AdminApp from "./admin/AdminApp.jsx";

// --- ADMIN PAGES (OLD STRUCTURE - Masih Dipakai) ---
import AdminTentangKamiFull from "./admin/pages/TentangKamiFull.jsx";
import AdminBisnisKamiFull from "./admin/pages/BisnisKamiFull.jsx";
import AdminKontakFull from "./admin/pages/KontakFull.jsx";
import AdminLowonganKerja from "./admin/pages/LowonganKerja.jsx";
import AdminLowonganKerjaFull from "./admin/pages/LowonganKerjaFull.jsx";
import AdminInternship from "./admin/pages/Internship.jsx";
import AdminSyaratLoker from "./admin/pages/SyaratLoker.jsx";
import AdminIsiBerita from "./admin/pages/IsiBerita.jsx";

// --- ADMIN SETTINGS & HOME EDITORS ---
import AdminProfil from "./admin/settings/Profil.jsx";
import AdminDashboard from "./admin/home/EditNavbar.jsx";
import AdminEditTentangKami from "./admin/home/EditTentangKami.jsx";
import AdminEditLowonganKerja from "./admin/home/EditLowonganKerja.jsx";
import AdminEditBisnisKami from "./admin/home/EditBisnisKami.jsx";
import AdminLink from "./admin/home/EditLink.jsx";
import AdminEditInternship from "./admin/home/EditInternship.jsx";
import AdminEditHeroSection from "./admin/home/EditHeroSection.jsx";

// --- MODULE BARU ---
import AdminJobPositionsIndex from "./admin/pages/job-positions/Index.jsx";
import AdminNewsIndex from "./admin/pages/news/Index.jsx";
import AdminJobApplicationsIndex from "./admin/pages/job-applications/Index.jsx";
import AdminInternshipApplicationsIndex from "./admin/pages/internship-applications/Index.jsx";
import AdminContactMessageIndex from "./admin/pages/contacts/Index.jsx";
import AdminTaskIndex from "./admin/pages/tasks/Index.jsx";
import HubBeranda from "./admin/pages/hubs/HubBeranda.jsx";
import HubBerita from "./admin/pages/hubs/HubBerita.jsx";
import AdminActivityLog from "./admin/pages/activity-log/Index.jsx";

// --- WRITER ROLE COMPONENTS ---
import WriterLayout from "./writer/layouts/WriterLayout.jsx";
import WriterDashboard from "./writer/pages/dashboard/Index.jsx";
import WriterArticlesIndex from "./writer/pages/articles/Index.jsx";
import WriterArticleForm from "./writer/pages/articles/Form.jsx";
import WriterTaskIndex from "./writer/pages/tasks/Index.jsx";
import WriterProfile from "./writer/pages/Profile.jsx";

// --- USER PUBLIC PAGES ---
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
import Register from "./masuk/Register.jsx";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin.jsx";

// --- PLUGINS ---
import "remixicon/fonts/remixicon.css";
import "animate.css";
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init();

/* =======================================================
   🔥 REDIRECT KHUSUS SETELAH LOGIN
 ======================================================= */

const RedirectBasedOnRole = () => {
  const token = localStorage.getItem("adminToken");
  const adminData = localStorage.getItem("adminData");

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = JSON.parse(adminData).role;

  if (role === "admin" || role === "super_admin") return <Navigate to="/admin" replace />;
  if (role === "writer") return <Navigate to="/writer/dashboard" replace />;

  return <Navigate to="/admin/login" replace />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ... existing routes ... */}
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

          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/redirect" element={<RedirectBasedOnRole />} />

          <Route path="/writer" element={<ProtectedRouteAdmin allowedRoles={["writer"]} />}>
            <Route index element={<Navigate to="/writer/dashboard" replace />} />
            <Route path="dashboard" element={<WriterDashboard />} />
            <Route path="articles" element={<WriterArticlesIndex />} />
            <Route path="articles/create" element={<WriterArticleForm />} />
            <Route path="articles/edit/:id" element={<WriterArticleForm />} />
            <Route path="tasks" element={<WriterTaskIndex />} />
            <Route path="profile" element={<WriterProfile />} />
          </Route>

          <Route path="/admin" element={<ProtectedRouteAdmin allowedRoles={["admin", "super_admin"]} />}>
            <Route index element={<AdminApp />} />
            <Route path="berita" element={<AdminNewsIndex />} />
            <Route path="edit-berita" element={<AdminNewsIndex />} />
            <Route path="isi-berita" element={<AdminIsiBerita />} />
            <Route path="lowongan-kerja" element={<AdminLowonganKerja />} />
            <Route path="job-applications" element={<AdminJobApplicationsIndex />} />
            <Route path="lowongan-full" element={<AdminLowonganKerjaFull />} />
            <Route path="syarat-loker" element={<AdminSyaratLoker />} />
            <Route path="edit-loker" element={<AdminEditLowonganKerja />} />
            <Route path="edit-posisi-pekerjaan" element={<AdminJobPositionsIndex />} />
            <Route path="internship" element={<AdminInternship />} />
            <Route path="internship-applications" element={<AdminInternshipApplicationsIndex />} />
            <Route path="edit-internship" element={<AdminEditInternship />} />
            <Route path="tasks" element={<AdminTaskIndex />} />
            <Route path="activity-log" element={<AdminActivityLog />} />
            <Route path="profil" element={<AdminProfil />} />
            <Route path="tentang-kami" element={<AdminTentangKamiFull />} />
            <Route path="edit-info" element={<AdminEditTentangKami />} />
            <Route path="bisnis-kami" element={<AdminBisnisKamiFull />} />
            <Route path="edit-bisnis-kami" element={<AdminEditBisnisKami />} />
            <Route path="kontak" element={<AdminKontakFull />} />
            <Route path="contacts" element={<AdminContactMessageIndex />} />
            <Route path="hub-beranda" element={<HubBeranda />} />
            <Route path="hub-berita" element={<HubBerita />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="edit-appearance" element={<AdminEditHeroSection />} />
            <Route path="edit-link" element={<AdminLink />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
