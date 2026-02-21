import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Container from "./Container";

const DEFAULT_AVATAR = "https://img.daisyui.com/images/profile/demo/spiderperson@192.webp";

const Navbar = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Ambil adminData dari localStorage sejak render pertama (anti-flicker)
    const [adminData, setAdminData] = useState(() => {
        try { return JSON.parse(localStorage.getItem("adminData") || "null"); }
        catch { return null; }
    });

    // Logo navbar dicache agar tidak berkedip
    const [logoUrl, setLogoUrl] = useState(() => {
        return localStorage.getItem("navbarLogoUrl") || null;
    });

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Sticky on scroll
    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 110);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Sinkron jika adminData berubah dari tab/halaman lain
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "adminData") {
                try { setAdminData(e.newValue ? JSON.parse(e.newValue) : null); }
                catch { /* ignore */ }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Tutup dropdown saat klik di luar area atau tekan Esc
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Ambil logo navbar dari API, lalu cache di localStorage
    useEffect(() => {
        let alive = true;
        const getLogo = async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/admin/logo", {
                    headers: { Accept: "application/json" },
                });
                const url = res?.data?.data?.url || null;
                if (!alive) return;
                if (url) {
                    setLogoUrl(url);
                    localStorage.setItem("navbarLogoUrl", url);
                }
            } catch (e) {
                // abaikan error, pakai fallback logo default
            }
        };
        getLogo();
        return () => { alive = false; };
    }, []);

    // Scroll ke atas tiap klik menu
    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.post(
                "import.meta.env.VITE_API_URL/admin/logout",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminData");
            navigate("/");
        }
    };

    const avatarSrc = adminData?.avatar || DEFAULT_AVATAR;

    return (
        <header
            className={`w-full h-[71px] z-50 backdrop-blur-md transition-all duration-300 ${isSticky ? "fixed top-0 bg-white/70 shadow-md" : "absolute top-0 bg-white/70"
                }`}
        >
            <Container className="h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/admin">
                        <img
                            className="h-12 w-auto object-contain cursor-pointer"
                            src={logoUrl ?? "/assets/img/Logo.png"}
                            alt="Logo SEVEN INC."
                            onError={(e) => {
                                if (logoUrl) {
                                    localStorage.removeItem("navbarLogoUrl");
                                    setLogoUrl(null);
                                }
                                e.currentTarget.src = "/assets/img/Logo.png";
                            }}
                        />
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav>
                    <ul className="flex items-center gap-10 text-gray-800 font-semibold text-[18px]">
                        <li>
                            <Link to="/admin" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Beranda
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/tentang-kami" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Tentang Kami
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/bisnis-kami" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Bisnis Kami
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/berita" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Berita
                            </Link>
                        </li>

                        {/* Dropdown Karir */}
                        <li
                            ref={dropdownRef}
                            className="hover:text-[#DC3933] cursor-pointer flex items-center relative"
                            onClick={() => setShowDropdown((v) => !v)}
                        >
                            Karir
                            <i
                                className={`ri-arrow-right-s-line text-[20px] text-gray-600 transition-transform duration-300 ${showDropdown ? "rotate-90" : "rotate-0"
                                    }`}
                            ></i>

                            {showDropdown && (
                                <div className="absolute top-9 left-1/2 -translate-x-1/2 w-40 text-gray-900 bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <Link
                                        to="/admin/internship"
                                        onClick={() => {
                                            scrollTop();
                                            setShowDropdown(false);
                                        }}
                                        className="block w-full px-4 py-2 text-sm font-bold border-b border-gray-200 hover:bg-[#DC3933] hover:text-white text-left rounded-t-lg"
                                    >
                                        Internship
                                    </Link>
                                    <Link
                                        to="/admin/lowongan-kerja"
                                        onClick={() => {
                                            scrollTop();
                                            setShowDropdown(false);
                                        }}
                                        className="block w-full px-4 py-2 text-sm font-bold hover:bg-[#DC3933] hover:text-white text-left rounded-b-lg"
                                    >
                                        Lowongan Kerja
                                    </Link>
                                </div>
                            )}
                        </li>

                        <li>
                            <Link to="/admin/kontak" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Kontak
                            </Link>
                        </li>

                        {/* Avatar kanan */}
                        <li className="flex items-center">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <div className="ring-primary ring-offset-base-100 w-10 rounded-full ring-2 ring-offset-2">
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                        />
                                    </div>
                                </div>

                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-white"
                                >
                                    <li className="px-2 py-1 border-b border-gray-600">
                                        <div className="flex flex-col max-w-[180px]">
                                            <span className="text-sm font-semibold truncate">
                                                {adminData?.name || "Nama Admin"}
                                            </span>
                                            <span className="text-xs text-gray-300 truncate">
                                                {adminData?.email || "admin@example.com"}
                                            </span>
                                        </div>
                                    </li>

                                    <li>
                                        <Link to="/admin/dashboard">Dashboard</Link>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} className="w-full text-left">
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </nav>
            </Container>
        </header>
    );
};

export default Navbar;
