// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Container from "./Container";

const Navbar = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // cache logo agar tidak berkedip saat pindah halaman
    const [logoUrl, setLogoUrl] = useState(() => {
        return localStorage.getItem("navbarLogoUrl") || "/assets/img/Logo.png";
    });

    // ref untuk mendeteksi klik di luar area trigger+dropdown
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsSticky(scrollTop > 110);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Tutup dropdown saat klik di luar area atau tekan Esc
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Ambil logo dari API (tanpa mengubah tampilan jika cache sudah ada)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/admin/logo");
                const url = res?.data?.data?.url || null;
                if (!cancelled && url) {
                    setLogoUrl((prev) => {
                        if (prev !== url) {
                            localStorage.setItem("navbarLogoUrl", url);
                        }
                        return url;
                    });
                }
            } catch {
                // abaikan error, gunakan cache/fallback
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Fungsi saat click supaya konten dimulai dari atas
    const scrollTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    return (
        <header
            className={`w-full h-[71px] z-50 backdrop-blur-md transition-all duration-300
        ${isSticky ? "fixed top-0 bg-white/70 shadow-md" : "absolute top-0 bg-white/70"}
        `}
        >
            <Container className="h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <img
                        className="h-12 w-auto object-contain cursor-pointer"
                        src={logoUrl}
                        alt="Logo SEVEN INC."
                        loading="eager"
                        onError={(e) => {
                            // jika URL API rusak, fallback & bersihkan cache
                            localStorage.removeItem("navbarLogoUrl");
                            setLogoUrl("/assets/img/Logo.png");
                            e.currentTarget.src = "/assets/img/Logo.png";
                        }}
                    />
                </div>

                {/* Navigation Menu */}
                <nav>
                    <ul className="flex gap-12 text-gray-800 font-semibold text-[18px]">
                        <li>
                            <Link to="/" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Beranda
                            </Link>
                        </li>
                        <li>
                            <Link to="/tentang-kami" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Tentang Kami
                            </Link>
                        </li>
                        <li>
                            <Link to="/bisnis-kami" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Bisnis Kami
                            </Link>
                        </li>
                        <li>
                            <Link to="/berita" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
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
                                        to="/internship"
                                        onClick={() => {
                                            scrollTop();
                                            setShowDropdown(false);
                                        }}
                                        className="block w-full px-4 py-2 text-sm font-bold border-b border-gray-200 hover:bg-[#DC3933] hover:text-white text-left rounded-t-lg"
                                    >
                                        Internship
                                    </Link>
                                    <Link
                                        to="/lowongan-kerja"
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
                            <Link to="/kontak" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                Kontak
                            </Link>
                        </li>
                    </ul>
                </nav>
            </Container>
        </header>
    );
};

export default Navbar;
