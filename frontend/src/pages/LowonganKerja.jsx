import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const CardArray = [
    { title: "Integritas", styleType: 1, description: "Sikap dasar setiap insan Seven INC. untuk selaras antara pikiran, ucapan, dan tindakan, menjaga kejujuran, tanggung jawab, serta kerahasiaan sesuai visi dan amanah perusahaan.", image: "/assets/img/vectorSalaman.png" },
    { title: "Positive Vibe", styleType: 2, description: "Menciptakan lingkungan kerja yang suportif melalui sikap positif, penyampaian informasi yang membangun, serta menghindari gosip dan prasangka yang merugikan tim.", image: "/assets/img/vectorPerson.png" },
    { title: "Fokus", styleType: 1, description: "Sikap dasar setiap insan Seven INC. untuk selaras antara pikiran, ucapan, dan tindakan, menjaga kejujuran, tanggung jawab, serta kerahasiaan sesuai visi dan amanah perusahaan.", image: "/assets/img/vectorSalaman.png" },
    { title: "Solusi", styleType: 2, description: "Menciptakan lingkungan kerja yang suportif melalui sikap positif, penyampaian informasi yang membangun, serta menghindari gosip dan prasangka yang merugikan tim.", image: "/assets/img/vectorPerson.png" },
    { title: "Trust", styleType: 1, description: "Sikap dasar setiap insan Seven INC. untuk selaras antara pikiran, ucapan, dan tindakan, menjaga kejujuran, tanggung jawab, serta kerahasiaan sesuai visi dan amanah perusahaan.", image: "/assets/img/vectorSalaman.png" },
    { title: "Komitmen", styleType: 2, description: "Menciptakan lingkungan kerja yang suportif melalui sikap positif, penyampaian informasi yang membangun, serta menghindari gosip dan prasangka yang merugikan tim.", image: "/assets/img/vectorPerson.png" },
    { title: "Kaizen", styleType: 1, description: "Sikap dasar setiap insan Seven INC. untuk selaras antara pikiran, ucapan, dan tindakan, menjaga kejujuran, tanggung jawab, serta kerahasiaan sesuai visi dan amanah perusahaan.", image: "/assets/img/vectorSalaman.png" },
    { title: "Tata Krama", styleType: 2, description: "Menciptakan lingkungan kerja yang suportif melalui sikap positif, penyampaian informasi yang membangun, serta menghindari gosip dan prasangka yang merugikan tim.", image: "/assets/img/vectorPerson.png" },
    { title: "Menjaga Habit Baik", styleType: 1, description: "Sikap dasar setiap insan Seven INC. untuk selaras antara pikiran, ucapan, dan tindakan, menjaga kejujuran, tanggung jawab, serta kerahasiaan sesuai visi dan amanah perusahaan.", image: "/assets/img/vectorSalaman.png" },
];

//Konstanta slider
const AUTO_MS = 5000;
const CARD_W = 302;
const CARD_GAP = 52;
const VISIBLE = 2;

const LowonganKerja = () => {
    // index awal kartu yang ditampilkan (kiri)
    const [startIndex, setStartIndex] = useState(0);
    const isFirst = startIndex === 0;
    const isLast = startIndex + VISIBLE >= CardArray.length;

    const navigate = useNavigate();

    //Auto-slide dan pause on hover/drag (wrap ke awal saat mencapai akhir)
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/job-works?active_only=true&limit=3`);
            setJobs(res.data.data || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const [paused, setPaused] = useState(false);
    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => {
            setStartIndex((prev) => (prev + VISIBLE >= CardArray.length ? 0 : prev + 1));
        }, AUTO_MS);
        return () => clearInterval(id);
    }, [paused]);

    //Gesture drag/swipe (desktop dan mobile)
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const startXRef = useRef(null);
    const SWIPE_THRESHOLD = 60;

    const onPointerDown = (e) => {
        setPaused(true);
        setIsDragging(true);
        startXRef.current = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    };
    const onPointerMove = (e) => {
        if (!isDragging || startXRef.current == null) return;
        const currentX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        if (currentX == null) return;
        setDragX(currentX - startXRef.current);
    };
    const endDrag = () => {
        if (!isDragging) return;
        if (Math.abs(dragX) > SWIPE_THRESHOLD) {
            if (dragX < 0 && !isLast) setStartIndex((p) => p + 1);
            if (dragX > 0 && !isFirst) setStartIndex((p) => p - 1);
        }
        setIsDragging(false);
        setDragX(0);
        setPaused(false);
        startXRef.current = null;
    };

    // tombol prev/next (tanpa wrap; mengikuti desain awal)
    const handlePrev = () => { if (!isFirst) setStartIndex((p) => p - 1); };
    const handleNext = () => { if (!isLast) setStartIndex((p) => p + 1); };

    // 👉 util scroll to top setelah navigasi SPA
    const scrollToTopNextTick = () => {
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }, 0);
    };

    // 👉 handler "Selengkapnya"
    // kirim juga from: "/lowongan-kerja" agar tombol Kembali di SyaratLoker bisa balik ke sini
    const handleSeeDetail = (job) => {
        navigate("/syarat-loker", { state: { job, from: "/lowongan-kerja", currentPage: 1 } });
        scrollToTopNextTick();
    };

    // handler "Lihat Lebih Lanjut"
    const handleSeeMore = () => {
        navigate("/lowongan-full", { state: { from: "/lowongan-full" } });
        scrollToTopNextTick();
    };

    // posisi track (geser per kartu dengan translateX)
    const baseTranslate = -(startIndex * (CARD_W + CARD_GAP));
    const trackTranslate = isDragging ? baseTranslate + dragX : baseTranslate;

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[130px] pb-24">
                <Container>
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        {/* Konten Kiri */}
                        <div className="w-full md:w-[58%]">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3 font-regular">Lowongan Kerja</h3>
                            <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">Berkarir bersama <br /> Seven INC.</h1>
                            <p className="text-[16px] text-gray-600 leading-relaxed">Temukan peluang karir Anda dengan posisi yang sesuai.</p>
                        </div>

                        {/* Konten Kanan (Gambar) */}
                        <div className="w-full flex justify-end">
                            <img src="/assets/img/cardLoker.png" alt="Lowongan Kerja" className="max-w-[679px] h-[453px] w-full object-cover" />
                        </div>
                    </div>

                    {/* Core Value Section (fungsi & tampilan dari TentangKamiFull) */}
                    <div className="mt-24 flex flex-col md:flex-row justify-between gap-10">
                        {/* Bagian Kiri */}
                        <div className="md:w-1/2 flex flex-col justify-center mt-10">
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">Core Value Perusahaan</h2>

                            <h3 className="text-[32px] font-bold text-gray-900 mb-4 leading-snug">
                                Prinsip Utama yang Menjadi<br />Dasar Tumbuh Bersama
                            </h3>

                            <p className="text-gray-600 text-[16px] mb-5 leading-relaxed">
                                Sembilan nilai inti ini menjadi pedoman tim Seven <br /> INC. dalam
                                membangun budaya kerja profesional, <br /> kolaboratif, dan berkelanjutan
                                menuju visi <br /> perusahaan yang terus berkembang.
                            </p>

                            <div className="flex items-center gap-12">
                                <button
                                    onClick={handlePrev}
                                    disabled={isFirst}
                                    onMouseEnter={() => setPaused(true)}
                                    onMouseLeave={() => setPaused(false)}
                                    className={`w-14 h-14 rounded-full border border-red-500 transition cursor-pointer flex items-center justify-center ${isFirst ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <i className="ri-arrow-left-s-line text-red-500 text-[60px] relative right-[1px]"></i>
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isLast}
                                    onMouseEnter={() => setPaused(true)}
                                    onMouseLeave={() => setPaused(false)}
                                    className={`w-14 h-14 rounded-full border border-red-500 transition cursor-pointer flex items-center justify-center ${isLast ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <i className="ri-arrow-right-s-line text-red-500 text-[60px] relative left-[2px]"></i>
                                </button>
                            </div>
                        </div>

                        {/* Bagian Kanan — viewport + track, tampilan 2 kartu, draggable & swipe */}
                        <div
                            className="md:w-[50%] w-full ml-auto select-none pr-[660px]"
                            onMouseEnter={() => setPaused(true)}
                            onMouseLeave={() => !isDragging && setPaused(false)}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            style={{ touchAction: "pan-y" }}
                        >
                            {/* viewport: sembunyikan overflow agar terlihat 2 kartu */}
                            <div
                                className="overflow-hidden"
                                style={{ width: `${VISIBLE * CARD_W + (VISIBLE - 1) * CARD_GAP}px`, marginLeft: "auto" }}
                            >
                                {/* track: semua kartu, digeser halus */}
                                <div
                                    className="flex items-start"
                                    style={{
                                        gap: `${CARD_GAP}px`,
                                        transform: `translateX(${trackTranslate}px)`,
                                        transition: isDragging ? "none" : "transform 500ms ease",
                                        willChange: "transform",
                                    }}
                                >
                                    {CardArray.map((card, index) => (
                                        <div
                                            key={index}
                                            className="group border border-gray-300 rounded-xl shadow hover:shadow-md transition text-center flex-none"
                                            style={{ width: `${CARD_W}px`, height: "555px" }}
                                        >
                                            <div className="flex flex-col items-center h-full pt-14">
                                                <div className="w-[143px] h-[143px] rounded-full border border-gray-100 bg-gray-100 group-hover:bg-red-600 transition duration-300 flex items-center justify-center mb-[30px] overflow-hidden">
                                                    <img
                                                        src={card.image}
                                                        alt={`Icon ${card.title}`}
                                                        className={`object-contain ${card.styleType === 2 ? "w-[90px] h-[90px] ml-[13px]" : "w-[100px] h-[100px] mt-2"} group-hover:invert`}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <h4 className="font-semibold text-gray-950 mb-[31px]" style={{ fontSize: "20px" }}>
                                                    {card.title}
                                                </h4>
                                                <p
                                                    className="text-gray-600 leading-relaxed px-6"
                                                    style={{ width: "300px", fontSize: "16px", lineHeight: "30px" }}
                                                >
                                                    {card.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* end kanan */}
                    </div>

                    {/* Posisi Pekerjaan */}
                    <div className="mt-24">
                        <div className="text-center">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3">Posisi Pekerjaan</h3>
                            <h2 className="text-[32px] font-bold text-gray-900 mb-10">Mulai pertumbuhan karirmu sekarang.</h2>
                        </div>

                        {/* Data Lowongan */}
                        {loading ? (
                            <div className="text-center py-10">
                                <span className="loading loading-spinner loading-md text-red-500"></span>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-bold">
                                Belum ada lowongan yang tersedia.
                            </div>
                        ) : (
                            jobs.map((job, index) => (
                                <div key={job.id || index} className="w-full mb-[48px]">
                                    <div className="border border-gray-300 rounded-t-xl px-14 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="text-[24px] font-bold text-gray-900">{job.title}</h3>
                                            <p className="text-[16px] text-[#7B7B7B]">{job.company}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSeeDetail(job)}
                                            className="bg-[#DC3933] text-white rounded-full border border-[#e5e7eb] hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                                            style={{ width: "245px", height: "63px" }}
                                        >
                                            Selengkapnya
                                        </button>
                                    </div>
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
                                            <span>Close Date : {job.close_date || job.closeDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Tombol Lihat Lebih Lanjut */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleSeeMore}
                                className="border border-gray-300 rounded-full text-gray-800 font-medium cursor-pointer hover:bg-[#DC3933] hover:text-white transition-all duration-300"
                                style={{ width: "515px", height: "63px", fontSize: "20px" }}
                            >
                                Lihat Lebih Lanjut
                            </button>
                        </div>
                    </div>
                </Container>
            </div>

            <Footer />
        </Layout>
    );
};

export default LowonganKerja;
