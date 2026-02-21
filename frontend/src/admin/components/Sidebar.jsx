import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [role, setRole] = useState("");
  // State untuk dropdown menu
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const data = localStorage.getItem("adminData");
    if (data) {
      const parsed = JSON.parse(data);
      setRole(parsed.role);
    }
  }, []);

  // Helper Component: Menu Item
  const MenuItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

    return (
      <li>
        <Link
          to={to}
          className={`flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
            ? "text-white bg-blue-600 shadow-lg shadow-blue-500/30"
            : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
        >
          {isActive && (
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 animate-pulse"></span>
          )}
          <i
            className={`${icon} text-lg transition-colors duration-200 ${isActive ? "text-cyan-200" : "text-gray-500 group-hover:text-gray-300"
              }`}
          />
          <span className="ms-3">{label}</span>
        </Link>
      </li>
    );
  };

  // Helper Component: Dropdown Menu
  const DropdownMenu = ({ title, icon, id, children }) => {
    const isOpen = openMenus[id];

    // Auto open if child is active
    // (Logic simplified for reliability: user toggles manually, or we could add auto-open logic if we passed paths)

    return (
      <li>
        <button
          type="button"
          onClick={() => setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }))}
          className={`flex items-center w-full p-3 text-sm font-medium rounded-lg transition-all duration-200 group text-gray-400 hover:text-white hover:bg-white/5`}
        >
          <i className={`${icon} text-lg text-gray-500 group-hover:text-gray-300 transition-colors duration-200`} />
          <span className="flex-1 ms-3 text-left whitespace-nowrap">{title}</span>
          <i className={`ri-arrow-down-s-line transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <ul className={`py-2 space-y-1 pl-4 transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
          <div className="border-l border-gray-700 pl-2 space-y-1">
            {children}
          </div>
        </ul>
      </li>
    );
  };

  return (
    <aside
      className="h-full w-full bg-[#111827] border-r border-gray-800 flex flex-col"
      aria-label="Sidebar"
    >
      {/* Brand Logo / Header */}
      <div className="flex-none flex items-center justify-center h-20 border-b border-gray-800 bg-[#111827]">
        <Link to="/admin" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <span className="text-white font-bold text-lg">7</span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-wide text-white font-poppins">
            SEVEN <span className="text-blue-500">INC</span>
          </span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {/* Main Menu (Everyone) */}
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main Menu
          </div>

          <MenuItem to="/admin" icon="ri-dashboard-3-line" label="Dashboard" />

          <MenuItem to="/admin/berita" icon="ri-article-line" label="Artikel" />

          {/* Lowongan Kerja Group */}
          <DropdownMenu title="Lowongan Kerja" icon="ri-briefcase-line" id="loker">
            <MenuItem to="/admin/job-applications" icon="ri-list-check" label="Daftar Pelamar" />
            <MenuItem to="/admin/edit-loker" icon="ri-file-edit-line" label="Edit Konten Loker" />
            <MenuItem to="/admin/edit-posisi-pekerjaan" icon="ri-user-star-line" label="Posisi Pekerjaan" />
            <MenuItem to="/admin/syarat-loker" icon="ri-file-list-3-line" label="Syarat & Ketentuan" />
          </DropdownMenu>

          <DropdownMenu title="Internship" icon="ri-user-star-line" id="internship_group">
            <MenuItem to="/admin/internship" icon="ri-layout-2-line" label="Halaman Internship" />
            <MenuItem to="/admin/internship-applications" icon="ri-folder-user-line" label="Daftar Peserta" />
            <MenuItem to="/admin/edit-internship" icon="ri-edit-line" label="Edit Konten" />
          </DropdownMenu>

          {/* Additional Admin Menus */}
          <MenuItem to="/admin/activity-log" icon="ri-history-line" label="Log Aktivitas" />

          {/* Settings Group (Super Admin Only - for now we just check role 'admin' which is the new main admin role) */}
          {(role === "admin" || role === "super_admin") && (
            <>
              <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings & CMS
              </div>

              <DropdownMenu title="Tampilan Website" icon="ri-layout-masonry-line" id="appearance">
                <MenuItem to="/admin/dashboard" icon="ri-image-edit-line" label="Navbar & Logo" />
                <MenuItem to="/admin/edit-appearance" icon="ri-computer-line" label="Hero Section" />
                <MenuItem to="/admin/edit-link" icon="ri-share-circle-line" label="Link & Sosmed" />
              </DropdownMenu>

              <DropdownMenu title="Info Perusahaan" icon="ri-building-4-line" id="company">
                <MenuItem to="/admin/hub-beranda" icon="ri-home-4-line" label="Beranda" />
                <MenuItem to="/admin/hub-berita" icon="ri-newspaper-line" label="Halaman Berita" />
                <MenuItem to="/admin/edit-info" icon="ri-information-line" label="Tentang Kami" />
                <MenuItem to="/admin/edit-bisnis-kami" icon="ri-shake-hands-line" label="Bisnis Kami" />
                <MenuItem to="/admin/contacts" icon="ri-mail-line" label="Kontak Masuk" />
              </DropdownMenu>

              <MenuItem to="/admin/profil" icon="ri-user-settings-line" label="Profil Admin" />
            </>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex-none p-4 border-t border-gray-800 bg-[#111827]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-white">{role === 'super_admin' ? 'Super Admin' : 'Administrator'}</p>
            <p className="text-xs text-gray-500">System Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
