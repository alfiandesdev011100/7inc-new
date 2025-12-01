// src/admin/Page/SyaratLoker.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const API_BASE = "http://127.0.0.1:8000/api";
const DEFAULT_INTRO =
    "Bertanggung jawab dalam mengelola administrasi kepegawaian, proses rekrutmen, pengembangan sumber daya manusia, serta memastikan implementasi kebijakan dan budaya perusahaan berjalan efektif.";

// Fungsi untuk format tanggal Close Date
const formatCloseDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

const SyaratLoker = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // job datang dari halaman sebelumnya (via navigate state)
    const job = location.state?.job;
    const currentPage = location.state?.currentPage || 1;

    // ==== state data dari API requirements ====
    const [intro, setIntro] = useState("");
    const [items, setItems] = useState({
        umum: [],
        khusus: [],
        tanggung_jawab: [],
        benefit: [],
    });
    const [loading, setLoading] = useState(false);

    // ==== state link GForms ====
    const [applyUrl, setApplyUrl] = useState(null);
    const SOCIAL_CACHE_KEY = "social_links_cache_v1";

    const cacheKey = useMemo(() => (job?.id ? `requirements_job_${job.id}` : null), [job?.id]);

    // Muat data requirements berdasarkan job.id
    useEffect(() => {
        if (!job?.id) return;

        // 1) render cepat dari cache untuk anti-kedip
        if (cacheKey) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const j = JSON.parse(cached);
                    setIntro(j.intro_text || "");
                    setItems({
                        umum: j.items?.umum || [],
                        khusus: j.items?.khusus || [],
                        tanggung_jawab: j.items?.tanggung_jawab || [],
                        benefit: j.items?.benefit || [],
                    });
                } catch { }
            }
        }

        // 2) fetch terbaru dari server (published only)
        const fetchReq = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/requirements/by-job/${job.id}`, {
                    headers: { Accept: "application/json" },
                });
                const data = res?.data?.data;
                if (data) {
                    setIntro(data.intro_text || "");
                    setItems({
                        umum: data.items?.umum || [],
                        khusus: data.items?.khusus || [],
                        tanggung_jawab: data.items?.tanggung_jawab || [],
                        benefit: data.items?.benefit || [],
                    });
                    // simpan cache
                    if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
                } else {
                    // kosongkan jika tidak ada
                    setIntro("");
                    setItems({ umum: [], khusus: [], tanggung_jawab: [], benefit: [] });
                }
            } catch (_e) {
                // jika 404 / error, tetap tampilkan default & kosongkan list
                setIntro("");
                setItems({ umum: [], khusus: [], tanggung_jawab: [], benefit: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchReq();
    }, [job?.id, cacheKey]);

    // Muat link GForms (hanya yang aktif)
    useEffect(() => {
        // cache dulu untuk anti-kedip
        const cached = localStorage.getItem(SOCIAL_CACHE_KEY);
        if (cached) {
            try {
                const arr = JSON.parse(cached);
                const gforms = Array.isArray(arr)
                    ? arr.find((x) => x.platform === "gforms" && x.is_active && x.url)
                    : null;
                if (gforms?.url) setApplyUrl(gforms.url);
            } catch { }
        }

        // fetch terbaru
        const fetchSocial = async () => {
            try {
                const res = await axios.get(`${API_BASE}/social-links`, {
                    headers: { Accept: "application/json" },
                });
                const arr = res?.data;
                if (Array.isArray(arr)) {
                    localStorage.setItem(SOCIAL_CACHE_KEY, JSON.stringify(arr));
                    const gforms = arr.find((x) => x.platform === "gforms" && x.is_active && x.url);
                    setApplyUrl(gforms ? gforms.url : null);
                }
            } catch {
                // biarkan pakai cache/fallback
            }
        };
        fetchSocial();
    }, []);

    const from = location.state?.from || "/lowongan-kerja";
    const handleBack = () => {
        if (from === "/admin/lowongan-full") {
            navigate("/admin/lowongan-full", { state: { currentPage } });
        } else {
            navigate("/admin/lowongan-kerja");
        }
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const handleApply = () => {
        if (applyUrl) {
            window.open(applyUrl, "_blank", "noopener");
        } else {
            alert("Link pendaftaran (GForms) belum tersedia.");
        }
    };

    return (
        <Layout>
            <div className="w-full mx-auto pt-[120px] text-black px-4">
                <Container>
                    {/* 🔹 Back to List */}
                    <div
                        onClick={handleBack}
                        className="flex items-center gap-2 mb-3 cursor-pointer group transition-all duration-300"
                    >
                        <i className="ri-arrow-left-long-line text-[27px] transition-all duration-300 group-hover:text-[#DC3933]"></i>
                        <span className="text-[17px] transition-all duration-300 group-hover:text-[#DC3933]">Back to List</span>
                    </div>

                    {/* 🔹 Judul + Perusahaan */}
                    <div>
                        <h1 className="text-[24px] font-bold">{job?.title}</h1>
                        <p className="text-[17px] mt-[14px]">{job?.company}</p>
                    </div>

                    {/* 🔹 Border Line */}
                    <div className="border-b-2 border-gray-300 my-4"></div>

                    {/* 🔹 3 Konten Icon + Text */}
                    <div className="flex flex-wrap justify-between items-center w-full text-[12px]">
                        <div className="flex items-center gap-2">
                            <i className="ri-briefcase-4-line text-[24px]"></i>
                            <span>{job?.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="ri-map-pin-line text-[24px]"></i>
                            <span>{job?.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="ri-time-line text-[24px]"></i>
                            <span>Close Date: {formatCloseDate(job?.close_date)}</span>
                        </div>
                    </div>

                    {/* Loading tipis */}
                    {loading && (
                        <div className="mt-6">
                            <span className="loading loading-dots loading-lg" />
                        </div>
                    )}

                    {/* 🔹 Deskripsi (Intro) */}
                    <div className="mt-10 w-full">
                        <p className="text-[16px] leading-relaxed">
                            {intro?.trim() ? intro : DEFAULT_INTRO}
                        </p>
                    </div>

                    {/* 🔹 KUALIFIKASI UMUM */}
                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">KUALIFIKASI UMUM :</h2>
                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                        {items.umum.length > 0 ? (
                            items.umum.map((it) => <li key={it.id}>{it.text}</li>)
                        ) : (
                            <li className="text-gray-500">Belum ada data.</li>
                        )}
                    </ul>

                    {/* 🔹 KUALIFIKASI KHUSUS */}
                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">KUALIFIKASI KHUSUS :</h2>
                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                        {items.khusus.length > 0 ? (
                            items.khusus.map((it) => <li key={it.id}>{it.text}</li>)
                        ) : (
                            <li className="text-gray-500">Belum ada data.</li>
                        )}
                    </ul>

                    {/* 🔹 TANGGUNG JAWAB */}
                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">TANGGUNG JAWAB :</h2>
                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                        {items.tanggung_jawab.length > 0 ? (
                            items.tanggung_jawab.map((it) => <li key={it.id}>{it.text}</li>)
                        ) : (
                            <li className="text-gray-500">Belum ada data.</li>
                        )}
                    </ul>

                    {/* 🔹 BENEFIT */}
                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">BENEFIT :</h2>
                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                        {items.benefit.length > 0 ? (
                            items.benefit.map((it) => <li key={it.id}>{it.text}</li>)
                        ) : (
                            <li className="text-gray-500">Belum ada data.</li>
                        )}
                    </ul>

                    {/* Konten Akhir */}
                    <p className="text-center text[16px] pt-[30px] italic">
                        Hanya Lamaran yang sesuai kualifikasi yang kami proses
                    </p>

                    {/* Tombol Button */}
                    <button
                        onClick={handleApply}
                        className="bg-[#DC3933] text-white rounded-full cursor-pointer mt-[35px] mb-[59px] border border-gray-200 hover:bg-white hover:text-black transition-all duration-300"
                        style={{ width: "245px", height: "63px" }}
                    >
                        Daftar Sekarang
                    </button>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default SyaratLoker;