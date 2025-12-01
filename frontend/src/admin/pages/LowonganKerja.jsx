// LowonganKerja.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

// === KONFIG API (Hero Lowongan Kerja)
const API_BASE = "http://127.0.0.1:8000/api";
const ENDPOINT_WORKS_LATEST = `${API_BASE}/works/latest`;
const ENDPOINT_JOBS = `${API_BASE}/job-works`;

// === Fallback Hero (dipakai kalau API kosong/error)
const FALLBACK_HERO = {
    kicker: "Lowongan Kerja",
    title: "Berkarir bersama \n Seven INC.",
    subtitle: "Temukan peluang karir Anda dengan posisi yang sesuai.",
    image_url: "/assets/img/cardLoker.png",
};

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

const formatIDDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

const LowonganKerja = () => {
    // ===== Data dari API =====
    const [hero, setHero] = useState(null);
    const [loaded, setLoaded] = useState(false);

    // ===== 3 lowongan terbaru (dinamis, ganti dummy) =====
    const [latestJobs, setLatestJobs] = useState([]);

    // Helper untuk render judul dengan line-break "\n"
    const renderWithBreaks = (text) =>
        String(text || "")
            .split(/\n/)
            .map((part, i) => (
                <span key={i}>
                    {i > 0 && <br />}
                    {part}
                </span>
            ));

    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                const res = await fetch(ENDPOINT_WORKS_LATEST, { cache: "no-store" });
                if (!res.ok) throw new Error("not 200");
                const json = await res.json();
                const d = json?.data;
                if (!aborted && d) {
                    setHero({
                        kicker: d.heading || FALLBACK_HERO.kicker,
                        title: d.title || FALLBACK_HERO.title,
                        subtitle: d.subtitle || FALLBACK_HERO.subtitle,
                        image_url: d.hero_url || FALLBACK_HERO.image_url,
                        // Tambahan untuk teks dinamis di bagian "Posisi Pekerjaan"
                        job_position: d.job_position || "Posisi Pekerjaan",
                        career_growth_description: d.career_growth_description || "Mulai pertumbuhan karirmu sekarang.",
                    });
                } else if (!aborted) {
                    setHero({
                        ...FALLBACK_HERO,
                        job_position: "Posisi Pekerjaan",
                        career_growth_description: "Mulai pertumbuhan karirmu sekarang.",
                    });
                }
            } catch {
                if (!aborted)
                    setHero({
                        ...FALLBACK_HERO,
                        job_position: "Posisi Pekerjaan",
                        career_growth_description: "Mulai pertumbuhan karirmu sekarang.",
                    });
            } finally {
                if (!aborted) setLoaded(true);
            }
        })();
        return () => { aborted = true; };
    }, []);

    // === Ambil 3 lowongan terbaru; otomatis update saat ada data baru ===
    useEffect(() => {
        let stop = false;
        const fetchLatestThree = async () => {
            try {
                // Ambil page 1 untuk mendapatkan last_page
                const first = await fetch(`${ENDPOINT_JOBS}?page=1`, { cache: "no-store" });
                const firstJson = await first.json();
                const lastPage = firstJson?.last_page || 1;

                // Ambil halaman terakhir (umumnya berisi ID paling baru, ascending di backend)
                const lastRes = lastPage === 1
                    ? firstJson
                    : await (await fetch(`${ENDPOINT_JOBS}?page=${lastPage}`, { cache: "no-store" })).json();

                let pool = Array.isArray(lastRes?.data) ? [...lastRes.data] : [];

                // Jika item di halaman terakhir < 3, ambil halaman sebelumnya untuk melengkapi
                if (pool.length < 3 && lastPage > 1) {
                    const prevRes = await fetch(`${ENDPOINT_JOBS}?page=${lastPage - 1}`, { cache: "no-store" });
                    const prevJson = await prevRes.json();
                    if (Array.isArray(prevJson?.data)) pool = pool.concat(prevJson.data);
                }

                // Urutkan desc by id dan ambil 3 teratas
                const latest = pool
                    .filter(Boolean)
                    .sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0))
                    .slice(0, 3);

                if (!stop) setLatestJobs(latest);
            } catch (e) {
                if (!stop) setLatestJobs([]);
            }
        };

        fetchLatestThree();

        // Poll ringan agar near-real-time ketika admin menambah data
        const id = setInterval(fetchLatestThree, 8000);
        return () => { stop = true; clearInterval(id); };
    }, []);

    // index awal kartu yang ditampilkan (kiri)
    const [startIndex, setStartIndex] = useState(0);
    const isFirst = startIndex === 0;
    const isLast = startIndex + VISIBLE >= CardArray.length;

    const navigate = useNavigate();

    //Auto-slide dan pause on hover/drag (wrap ke awal saat mencapai akhir)
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
        navigate("/admin/syarat-loker", { state: { job, from: "/admin/lowongan-kerja", currentPage: 1 } });
        scrollToTopNextTick();
    };

    // handler "Lihat Lebih Lanjut"
    const handleSeeMore = () => {
        navigate("/admin/lowongan-full", { state: { from: "/admin/lowongan-full" } });
        scrollToTopNextTick();
    };

    // posisi track (geser per kartu dengan translateX)
    const baseTranslate = -(startIndex * (CARD_W + CARD_GAP));
    const trackTranslate = isDragging ? baseTranslate + dragX : baseTranslate;

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[130px] pb-24">
                <Container>
                    {/* Tahan render hero hingga fetch selesai untuk cegah kedipan */}
                    {!loaded ? (
                        <div className="h-[560px] animate-pulse bg-gray-50 rounded-xl mb-6" />
                    ) : (
                        <>
                            {/* Hero Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                {/* Konten Kiri */}
                                <div className="w-full md:w-[58%]">
                                    <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3 font-regular">
                                        {hero.kicker}
                                    </h3>

                                    <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">
                                        {renderWithBreaks(hero.title)}
                                    </h1>

                                    <p className="text-[16px] text-gray-600 leading-relaxed">
                                        {hero.subtitle}
                                    </p>
                                </div>

                                {/* Konten Kanan (Gambar) */}
                                <div className="w-full flex justify-end">
                                    <img
                                        src={hero.image_url || "/assets/img/cardLoker.png"}
                                        alt="Lowongan Kerja"
                                        className="max-w-[679px] h-[453px] w-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}

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
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3">
                                {hero?.job_position || "Posisi Pekerjaan"}
                            </h3>
                            <h2 className="text-[32px] font-bold text-gray-900 mb-10">
                                {hero?.career_growth_description || "Mulai pertumbuhan karirmu sekarang."}
                            </h2>
                        </div>

                        {/* Data Lowongan (DINAMIS: 3 TERBARU) */}
                        {latestJobs.length > 0 ? (
                            latestJobs.map((job, index) => (
                                <div key={job.id ?? index} className="w-full mb-[48px]">
                                    {/* Bagian Atas */}
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

                                    {/* Bagian Bawah */}
                                    <div className="border-x border-b border-gray-300 rounded-b-xl px-14 p-1 flex flex-wrap justify-between items-center text-gray-700 text-[16px]">
                                        {/* Pekerjaan */}
                                        <div className="flex items-center gap-3 text-[12px] text-[#7B7B7B]">
                                            <img src="/assets/img/bagComponen.png" alt="bag-icon" />
                                            <span>{job.title}</span>
                                        </div>

                                        {/* Lokasi */}
                                        <div className="flex items-center gap-2 text-[12px] text-[#7B7B7B]">
                                            <i className="ri-map-pin-line text-[24px]"></i>
                                            <span>{job.location}</span>
                                        </div>

                                        {/* Tanggal */}
                                        <div className="flex items-center gap-2 text-[12px] text-[#7B7B7B]">
                                            <i className="ri-time-line text-[24px]"></i>
                                            <span>Close Date : {formatIDDate(job.close_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Tidak ada lowongan pekerjaan tersedia.</p>
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