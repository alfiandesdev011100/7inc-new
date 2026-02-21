import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";
import axios from "axios";
import PublicAuthModal from "../components/PublicAuthModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const positions = [
    { name: "Administrasi", image: "/assets/img/vector1.png" },
    { name: "Animasi", image: "/assets/img/vector2.png" },
    { name: "Content Planner", image: "/assets/img/vector3.png" },
    { name: "Content Writer", image: "/assets/img/vector4.png" },
    { name: "Desain Grafis", image: "/assets/img/vector5.png" },
    { name: "Digital Market", image: "/assets/img/vector6.png" },
    { name: "Host / Presenter", image: "/assets/img/vector7.png" },
    { name: "Human Resource", image: "/assets/img/vector8.png" },
    { name: "Las", image: "/assets/img/vector9.png" },
    { name: "Marketing & Sales", image: "/assets/img/vector10.png" },
    { name: "Public Relation", image: "/assets/img/vector11.png" },
    { name: "Photographer Videographer", image: "/assets/img/vector12.png" },
    { name: "Programmer", image: "/assets/img/vector13.png" },
    { name: "Project Manager", image: "/assets/img/vector14.png" },
    { name: "Social Media Specialist", image: "/assets/img/vector15.png" },
    { name: "TikTok Creator", image: "/assets/img/vector16.png" },
    { name: "UI / UX Designer", image: "/assets/img/vector17.png" },
    { name: "Voice Over Talent", image: "/assets/img/vector18.png" },
];

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

// Konstanta slider
const AUTO_MS = 5000;
const CARD_W = 302;
const CARD_GAP = 52;
const VISIBLE = 2;

const Internship = () => {
    const [startIndex, setStartIndex] = useState(0);
    const isFirst = startIndex === 0;
    const isLast = startIndex + VISIBLE >= CardArray.length;
    const [showModal, setShowModal] = useState(false);
    const [modalView, setModalView] = useState("register");

    const [dynamicPositions, setDynamicPositions] = useState([]);
    const [loadingPositions, setLoadingPositions] = useState(true);

    const fetchInternships = async () => {
        setLoadingPositions(true);
        try {
            const res = await axios.get(`${API_BASE}/internships?active_only=true`);
            setDynamicPositions(res.data.data || []);
        } catch (error) {
            console.error("Error fetching internships:", error);
        } finally {
            setLoadingPositions(false);
        }
    };

    // Pengecekan auth dipindah ke dalam fungsi handleApplyClick agar selalu fresh dari localStorage

    useEffect(() => {
        fetchInternships();
    }, []);

    // auto-slide + pause
    const [paused, setPaused] = useState(false);
    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => {
            setStartIndex((prev) => (prev + VISIBLE >= CardArray.length ? 0 : prev + 1));
        }, AUTO_MS);
        return () => clearInterval(id);
    }, [paused]);

    // prev/next
    const onPrev = () => { if (!isFirst) setStartIndex((p) => p - 1); };
    const onNext = () => { if (!isLast) setStartIndex((p) => p + 1); };

    // drag/swipe
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

    // posisi track
    const baseTranslate = -(startIndex * (CARD_W + CARD_GAP));
    const trackTranslate = isDragging ? baseTranslate + dragX : baseTranslate;

    const handleApplyClick = (e) => {
        e.preventDefault();

        // Cek token secara fresh dan ketat
        const token = localStorage.getItem("publicToken");
        const isActuallyAuthenticated = token && token !== "undefined" && token !== "null" && token.length > 20;

        if (isActuallyAuthenticated) {
            confirmApplication();
        } else {
            // Jika tidak valid atau sudah logout, bersihkan & tampilkan modal register
            if (token) localStorage.removeItem("publicToken");
            setModalView("register");
            setShowModal(true);
        }
    };

    const confirmApplication = () => {
        window.open("https://docs.google.com/forms/d/1SkaS-5FX9mx3qFLJHB1acJepUXkUisky-v1THo1R0Hs/viewform", "_blank");
        setShowModal(false);
    };

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[130px] pb-24 relative">
                <Container>
                    {/* Hero */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="w-full md:w-[58%]">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3 font-regular">Internship</h3>
                            <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">
                                Temukan <br /> Kesempatan, Bangun <br /> Masa Depan.
                            </h1>
                        </div>
                        <div className="w-full flex justify-end">
                            <img
                                src="/assets/img/Internship.png"
                                alt="Internship Hero"
                                className="max-w-[679px] h-[453px] w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Core Value */}
                    <div className="mt-[74px] flex flex-col md:flex-row justify-between gap-10">
                        {/* kiri */}
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
                                    onClick={onPrev}
                                    disabled={isFirst}
                                    onMouseEnter={() => setPaused(true)}
                                    onMouseLeave={() => setPaused(false)}
                                    className={`w-14 h-14 rounded-full border border-red-500 transition cursor-pointer flex items-center justify-center ${isFirst ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <i className="ri-arrow-left-s-line text-red-500 text-[60px] relative right-[1px]"></i>
                                </button>
                                <button
                                    onClick={onNext}
                                    disabled={isLast}
                                    onMouseEnter={() => setPaused(true)}
                                    onMouseLeave={() => setPaused(false)}
                                    className={`w-14 h-14 rounded-full border border-red-500 transition cursor-pointer flex items-center justify-center ${isLast ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <i className="ri-arrow-right-s-line text-red-500 text-[60px] relative left-[2px]"></i>
                                </button>
                            </div>
                        </div>

                        {/* kanan: viewport + track */}
                        <div
                            className="md:w-[50%] w-full ml-auto select-none pr-[660px]"
                            onMouseEnter={() => setPaused(true)}
                            onMouseLeave={() => !isDragging && setPaused(false)}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            onTouchStart={onPointerDown}
                            onTouchMove={onPointerMove}
                            onTouchEnd={endDrag}
                            style={{ touchAction: "pan-y" }}
                        >
                            <div
                                className="overflow-hidden"
                                style={{ width: `${VISIBLE * CARD_W + (VISIBLE - 1) * CARD_GAP}px`, marginLeft: "auto" }}
                            >
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
                                                <p className="text-gray-600 leading-relaxed px-6"
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
                    </div>

                    {/* Syarat & Ketentuan */}
                    <div className="mt-[74px] flex flex-col md:flex-row justify-between">
                        <div className="md:w-1/2 flex flex-col justify-center mt-8">
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">Syarat & Ketentuan</h2>
                            <h3 className="text-[32px] font-bold text-gray-900 leading-snug">
                                Persiapkan Dirimu, Tumbuh<br />Bersama Kami.
                            </h3>
                        </div>

                        <div className="md:w-[55%]">
                            <ol className="list-decimal pl-5 space-y-1 text-gray-700 text-[16px] leading-relaxed w-full">
                                <li>Mengisi Formulir Pendaftaran Magang.</li>
                                <li>Menyertakan surat pengantar atau surat tugas resmi dari pihak sekolah atau perguruan tinggi.</li>
                                <li>Telah memperoleh izin atau persetujuan dari orang tua atau wali sebelum mengikuti program magang.</li>
                                <li>Bersedia berkomitmen untuk menggali keterampilan dan pengalaman selama masa magang berlangsung.</li>
                                <li>Bersedia menjalani proses pembelajaran yang menuntut kemandirian, kedewasaan, dan kesiapan untuk hidup lebih mandiri setelah magang selesai.</li>
                                <li>Bersedia berinteraksi secara profesional dengan seluruh karyawan serta menjaga nama baik institusi asal (sekolah/kampus), perusahaan, dan pribadi.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Formasi */}
                    <div className="mt-[74px] text-center max-w-[900px] mx-auto">
                        <h2 className="tracking-[0.6em] uppercase text-gray-600 text-[20px] mb-3">Formasi Internship</h2>
                        <h3 className="text-[32px] font-bold text-gray-900 mb-4">
                            Bangun Kompetensi dan Karakter Bersama Seven INC.
                        </h3>
                    </div>
                    <p className="text-gray-600 text-[16px] leading-relaxed text-center">
                        Program magang dan internship di Seven INC. dirancang untuk menjadi wadah bagi siswa, mahasiswa, maupun individu umum
                        yang ingin mengembangkan keterampilan praktis dan kesiapan kerja melalui bimbingan langsung, pelatihan intensif, serta
                        pengalaman di lingkungan<br />industri multisektor.
                    </p>

                    <div className="mt-12 grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-14">
                        {loadingPositions ? (
                            <div className="col-span-full text-center py-10">
                                <span className="loading loading-spinner loading-md text-red-500"></span>
                            </div>
                        ) : dynamicPositions.length === 0 ? (
                            positions.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={handleApplyClick}
                                    className="h-[137px] flex flex-col items-center justify-center bg-white rounded-lg shadow border border-gray-200 w-full group transition-all duration-300 hover:bg-red-500 cursor-pointer"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 mb-2 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                                    />
                                    <p className="text-sm font-semibold text-gray-800 text-center px-2 transition-all duration-300 group-hover:text-white">
                                        {item.name}
                                    </p>
                                </button>
                            ))
                        ) : (
                            dynamicPositions.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={handleApplyClick}
                                    className="h-[137px] flex flex-col items-center justify-center bg-white rounded-lg shadow border border-gray-200 w-full group transition-all duration-300 hover:bg-red-500 cursor-pointer"
                                >
                                    <img
                                        src={item.image || "/assets/img/vector13.png"}
                                        alt={item.title}
                                        className="w-10 h-10 mb-2 transition-all duration-300 group-hover:brightness-0 group-hover:invert object-contain"
                                    />
                                    <p className="text-sm font-semibold text-gray-800 text-center px-2 transition-all duration-300 group-hover:text-white">
                                        {item.title}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Fasilitas */}
                    <div className="mt-[74px] flex flex-col md:flex-row justify-between">
                        <div className="md:w-1/2 flex flex-col justify-center mt-8">
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">Fasilitas yang Didapat</h2>
                            <h3 className="text-[32px] font-bold text-gray-900 leading-snug">
                                Karena Belajar Butuh <br />Lingkungan yang Mendukung.
                            </h3>
                        </div>

                        <div className="md:w-[55%]">
                            <ol className="list-decimal pl-5 space-y-1 text-gray-700 text-[16px] leading-relaxed w-full">
                                <li>Setiap peserta magang akan mendapatkan bimbingan langsung dari tim internal yang berpengalaman.</li>
                                <li>Disediakan sesi pengembangan keterampilan tambahan yang dapat diikuti secara sukarela di luar jam kerja reguler.</li>
                                <li>Peserta akan memperoleh sertifikat magang serta seragam resmi dari MagangJogja.com sebagai bukti keikutsertaan.</li>
                                <li>Disediakan koneksi internet tanpa biaya tambahan bagi peserta magang yang menjalankan aktivitas di kantor.</li>
                                <li>Bagi peserta yang berasal dari luar kota, tim kami akan memberikan informasi seputar kost atau hunian dengan harga terjangkau.</li>
                                <li>Tersedia minuman hangat secara cuma-cuma sebagai bentuk dukungan kenyamanan selama kegiatan magang berlangsung.</li>
                                <li>Bagi peserta yang menunjukkan performa baik, akan diberikan surat rekomendasi untuk mendukung karier atau studi lanjutan.</li>
                                <li>Peserta berpeluang untuk terlibat aktif dalam berbagai proyek nyata yang dijalankan oleh tim profesional Seven INC.</li>
                                <li>Magang di Seven INC. memberikan akses untuk membangun koneksi profesional dan pengalaman langsung di lingkungan kerja multisektor.</li>
                            </ol>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Banner */}
            <Container>
                <div className="relative h-[360px] mt-[64px] mb-[64px]" >
                    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                        <div className="absolute top-0 left-0 h-full w-[810px] bg-[#D43026] z-0" />
                        <img
                            src="/assets/img/Chevron.png"
                            alt="Chevron Arrows"
                            className="absolute right-0 top-0 translate-x-[40px] w-[670px] h-full object-cover z-10"
                            draggable={false}
                        />
                        <div className="absolute top-1/2 left-[100px] -translate-y-1/2 z-20 text-white">
                            <p className="uppercase tracking-[0.4em] text-[20px] font-medium mb-4">
                                Bergabunglah Sekarang
                            </p>
                            <h2 className="text-white font-bold text-[20px] md:text-[32px] mb-6">
                                Kesempatan Berkembang<br />Bersama Seven INC.
                            </h2>
                            <button
                                onClick={handleApplyClick}
                                className="relative overflow-hidden group rounded-4xl font-medium tracking-[0.05em] text-[20px] w-[220px] h-[60px] bg-white text-black transition-all duration-300 cursor-pointer border border-transparent block"
                            >
                                <span className="absolute inset-0 bg-[#D43026] rounded-4xl translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-400 ease-in-out z-0" />
                                <span className="relative z-10 flex items-center justify-center h-full w-full group-hover:text-white transition-colors duration-300">
                                    Daftar Sekarang
                                </span>
                            </button>
                        </div>
                    </div>

                    <img
                        src="/assets/img/Hero2.png"
                        alt="Business Person"
                        className="absolute right-[49px] bottom-10 w-[440px] z-20"
                        draggable={false}
                    />
                </div>
            </Container>

            {/* 🔹 Application Confirmation Modal */}
            <PublicAuthModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAuthenticated={confirmApplication}
                initialView={modalView}
            />

            <Footer />
        </Layout>
    );
};

export default Internship;
