import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const API_BASE = "http://127.0.0.1:8000/api";
const HERO_ENDPOINT = `${API_BASE}/works/latest`;
const JOBS_ENDPOINT = `${API_BASE}/job-works`;

// Fallback untuk Hero (sama seperti di editor admin)
const FALLBACK_HERO = {
    heading: "Lowongan Kerja",
    title: "Berkarir bersama \n Seven INC.",
    subtitle: "Temukan peluang karir Anda dengan posisi yang sesuai.",
    hero_url: "/assets/img/cardLoker.png",
};

// Kunci cache localStorage untuk menghindari kedipan gambar
const HERO_CACHE_KEY = "works_latest_cache_v1";

const LowonganKerjaFull = () => {
    const location = useLocation();
    const initialPage = location.state?.currentPage || 1;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [jobs, setJobs] = useState([]);
    const [totalPages, setTotalPages] = useState(1); // Total Pages for pagination

    const [hero, setHero] = useState(FALLBACK_HERO);
    const [jobPosition, setJobPosition] = useState("Posisi Pekerjaan");
    const [careerGrowthDescription, setCareerGrowthDescription] = useState("Mulai pertumbuhan karirmu sekarang.");

    // === HYDRATE dari localStorage lebih dulu agar tidak sempat menampilkan gambar statis ===
    useEffect(() => {
        try {
            const raw = localStorage.getItem(HERO_CACHE_KEY);
            if (raw) {
                const cached = JSON.parse(raw);
                if (cached && typeof cached === "object") {
                    setHero({
                        heading: cached.heading ?? FALLBACK_HERO.heading,
                        title: cached.title ?? FALLBACK_HERO.title,
                        subtitle: cached.subtitle ?? FALLBACK_HERO.subtitle,
                        hero_url: cached.hero_url ?? FALLBACK_HERO.hero_url,
                    });
                    setJobPosition(cached.job_position || "Posisi Pekerjaan");
                    setCareerGrowthDescription(cached.career_growth_description || "Mulai pertumbuhan karirmu sekarang.");
                }
            }
        } catch {
            // jika parsing gagal, abaikan dan tetap pakai fallback
        }
    }, []);

    // === Fetch data hero terbaru, pre-load img sebelum swap, lalu simpan ke localStorage ===
    useEffect(() => {
        let stop = false;

        const swapHeroSmooth = (next) => {
            // Preload gambar baru agar swap mulus tanpa kedipan
            if (next.hero_url) {
                const img = new Image();
                img.src = next.hero_url;
                img.onload = () => {
                    if (stop) return;
                    setHero({
                        heading: next.heading ?? FALLBACK_HERO.heading,
                        title: next.title ?? FALLBACK_HERO.title,
                        subtitle: next.subtitle ?? FALLBACK_HERO.subtitle,
                        hero_url: next.hero_url ?? FALLBACK_HERO.hero_url,
                    });
                    setJobPosition(next.job_position || "Posisi Pekerjaan");
                    setCareerGrowthDescription(next.career_growth_description || "Mulai pertumbuhan karirmu sekarang.");
                    try {
                        localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(next));
                    } catch {
                        // storage penuh / diblok → abaikan
                    }
                };
                img.onerror = () => {
                    if (stop) return;
                    // Jika gambar gagal diload, tetap update text & cache (gambar fallback tetap dipakai)
                    setHero({
                        heading: next.heading ?? FALLBACK_HERO.heading,
                        title: next.title ?? FALLBACK_HERO.title,
                        subtitle: next.subtitle ?? FALLBACK_HERO.subtitle,
                        hero_url: next.hero_url ?? FALLBACK_HERO.hero_url,
                    });
                    setJobPosition(next.job_position || "Posisi Pekerjaan");
                    setCareerGrowthDescription(next.career_growth_description || "Mulai pertumbuhan karirmu sekarang.");
                    try {
                        localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(next));
                    } catch { }
                };
            } else {
                // Tidak ada URL gambar baru → update text saja
                setHero({
                    heading: next.heading ?? FALLBACK_HERO.heading,
                    title: next.title ?? FALLBACK_HERO.title,
                    subtitle: next.subtitle ?? FALLBACK_HERO.subtitle,
                    hero_url: FALLBACK_HERO.hero_url,
                });
                setJobPosition(next.job_position || "Posisi Pekerjaan");
                setCareerGrowthDescription(next.career_growth_description || "Mulai pertumbuhan karirmu sekarang.");
                try {
                    localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(next));
                } catch { }
            }
        };

        (async () => {
            try {
                const res = await axios.get(HERO_ENDPOINT);
                const d = res?.data?.data;
                if (!stop && d) {
                    const next = {
                        heading: d.heading,
                        title: d.title,
                        subtitle: d.subtitle,
                        hero_url: d.hero_url,
                        job_position: d.job_position,
                        career_growth_description: d.career_growth_description,
                    };
                    swapHeroSmooth(next);
                }
            } catch {
                // diamkan: tetap pakai cache atau fallback yang sudah dirender
            }
        })();

        return () => {
            stop = true;
        };
    }, []);

    // Fetch job positions with pagination
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get(`${JOBS_ENDPOINT}?page=${currentPage}`);
                setJobs(response.data.data);
                setTotalPages(response.data.last_page); // Assuming the backend returns last_page
            } catch (error) {
                console.error("Error fetching jobs", error);
            }
        };

        fetchJobs();
    }, [currentPage]);

    const renderWithBreaks = (text) =>
        String(text || "")
            .split("\n")
            .map((part, idx, arr) => (
                <span key={idx}>
                    {part}
                    {idx < arr.length - 1 && <br />}
                </span>
            ));

    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatCloseDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[130px] pb-24">
                <Container>
                    {/* Hero Section (Dari API / Cache) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="w-full md:w-[58%]">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3 font-regular">
                                {hero.heading}
                            </h3>
                            <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">
                                {renderWithBreaks(hero.title)}
                            </h1>
                            <p className="text-[16px] text-gray-600 leading-relaxed">{hero.subtitle}</p>
                        </div>

                        <div className="w-full flex justify-end">
                            <img
                                src={hero.hero_url || "/assets/img/cardLoker.png"}
                                alt="Lowongan Kerja"
                                className="max-w-[679px] h-[453px] w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Posisi Pekerjaan */}
                    <div className="mt-24">
                        <div className="text-center">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3">
                                {jobPosition}
                            </h3>
                            <h2 className="text-[32px] font-bold text-gray-900 mb-10">
                                {careerGrowthDescription}
                            </h2>
                        </div>

                        {/* 🔹 Mapping data jobs */}
                        {jobs.length > 0 ? (
                            jobs.map((job, index) => (
                                <div key={index} className="w-full mb-[48px]">
                                    {/* Bagian Atas */}
                                    <div className="border border-gray-300 rounded-t-xl px-14 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="text-[24px] font-bold text-gray-900">{job.title}</h3>
                                            <p className="text-[16px] text-[#7B7B7B]">{job.company}</p>
                                        </div>

                                        <Link
                                            to="/admin/syarat-loker"
                                            state={{ job, currentPage, from: "/admin/lowongan-full" }}
                                            onClick={() =>
                                                window.scrollTo({ top: 0, left: 0, behavior: "auto" })
                                            }
                                            className="bg-[#DC3933] text-white rounded-full cursor-pointer flex items-center justify-center border border-gray-200 hover:bg-white hover:text-black transition-all duration-300"
                                            style={{ width: "245px", height: "63px" }}
                                        >
                                            Selengkapnya
                                        </Link>
                                    </div>

                                    {/* Bagian Bawah */}
                                    <div className="border-x border-b border-gray-300 rounded-b-xl px-14 p-1 flex flex-wrap justify-between items-center text-gray-700 text-[16px]">
                                        <div className="flex items-center gap-3 text-[12px] text-[#7B7B7B]">
                                            <img src="/assets/img/bagComponen.png" alt="bag-icon" />
                                            <span>{job.title}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[12px] text-[#7B7B7B]">
                                            <i className="ri-map-pin-line text-[24px]"></i>
                                            <span>{job.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[12px] text-[#7B7B7B]">
                                            <i className="ri-time-line text-[24px]"></i>
                                            <span>Close Date : {formatCloseDate(job.close_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Tidak ada lowongan pekerjaan tersedia.</p>
                        )}

                        {/* Tombol Pagination */}
                        <div className="flex justify-center mb-[-15px] mt-20">
                            <nav aria-label="Page navigation example">
                                <ul className="flex items-center gap-7 text-base">
                                    {/* Tombol Arrow Left */}
                                    {currentPage > 1 && (
                                        <li>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                className="text-black hover:text-red-500 cursor-pointer -mr-2"
                                            >
                                                <i className="ri-arrow-left-double-line text-[25px]"></i>
                                            </button>
                                        </li>
                                    )}

                                    {/* Tombol Halaman */}
                                    {[...Array(totalPages)].map((_, page) => (
                                        <li key={page}>
                                            <button
                                                onClick={() => setCurrentPage(page + 1)}
                                                className={`cursor-pointer font-bold text-[18px] transition-colors duration-200 ${currentPage === page + 1
                                                        ? "text-red-500"
                                                        : "text-black hover:text-red-500"
                                                    }`}
                                            >
                                                {page + 1}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Tombol Arrow Right */}
                                    {currentPage < totalPages && (
                                        <li>
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                                }
                                                className="text-black hover:text-red-500 cursor-pointer -ml-3"
                                            >
                                                <i className="ri-arrow-right-double-line text-[25px]"></i>
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default LowonganKerjaFull;