import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
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

const HERO_IMAGES_FALLBACK = [
    { src: "/assets/img/Tempat.png", alt: "Seven INC billboard - 1" },
    { src: "/assets/img/Internship.png", alt: "Seven INC billboard - 2" },
    { src: "/assets/img/cardLoker.png", alt: "Seven INC billboard - 3" },
];

const AUTO_MS = 5000;
const CARD_W = 302;
const CARD_GAP = 52;
const VISIBLE = 2;

// helper: bentuk array dari struktur legacy backend (image_url1..3)
const fromLegacy = (d) => [d?.image_url1, d?.image_url2, d?.image_url3].filter(Boolean);

const TentangKamiFull = () => {
    const cached = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("about.cache") || "null"); }
        catch { return null; }
    }, []);

    const [about, setAbout] = useState(cached || null);

    // hero dari cache (legacy) → kalau kosong fallback
    const initialImages = fromLegacy(cached).length
        ? fromLegacy(cached).map((u, i) => ({ src: u, alt: `About hero ${i + 1}` }))
        : HERO_IMAGES_FALLBACK;

    const [heroImages, setHeroImages] = useState(initialImages);
    const [heroIndex, setHeroIndex] = useState(0);

    // core value slider
    const [startIndex, setStartIndex] = useState(0);
    const isFirst = startIndex === 0;
    const isLast = startIndex + VISIBLE >= CardArray.length;

    // refresh data terbaru (pakai legacy structure)
    useEffect(() => {
        let alive = true;
        const getAbout = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/about", {
                    headers: { Accept: "application/json" },
                });
                const data = res.data?.data;
                if (!alive || !data) return;

                setAbout(data);

                const urls = fromLegacy(data);
                const imgs = urls.length
                    ? urls.map((u, i) => ({ src: u, alt: `About hero ${i + 1}` }))
                    : HERO_IMAGES_FALLBACK;

                setHeroImages(imgs);

                // simpan cache apa adanya (legacy)
                localStorage.setItem("about.cache", JSON.stringify(data));
            } catch {
                // ignore
            }
        };
        getAbout();
        return () => { alive = false; };
    }, []);

    // auto-rotate hero
    useEffect(() => {
        const id = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), AUTO_MS);
        return () => clearInterval(id);
    }, [heroImages]);

    // auto-slide core values
    const [paused, setPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const startXRef = useRef(null);
    const SWIPE_THRESHOLD = 60;

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => {
            setStartIndex(prev => (prev + VISIBLE >= CardArray.length ? 0 : prev + 1));
        }, AUTO_MS);
        return () => clearInterval(id);
    }, [paused]);

    const handlePrev = () => { if (!isFirst) setStartIndex(p => p - 1); };
    const handleNext = () => { if (!isLast) setStartIndex(p => p + 1); };
    const onPrev = handlePrev;
    const onNext = handleNext;

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
            if (dragX < 0 && !isLast) setStartIndex(p => p + 1);
            if (dragX > 0 && !isFirst) setStartIndex(p => p - 1);
        }
        setIsDragging(false);
        setDragX(0);
        setPaused(false);
        startXRef.current = null;
    };

    const baseTranslate = -(startIndex * (CARD_W + CARD_GAP));
    const trackTranslate = isDragging ? baseTranslate + dragX : baseTranslate;

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[110px]">
                <Container>
                    {/* Hero */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="w-full md:w-[68%]">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3">
                                {about?.subtitle ?? "Tentang Kami"}
                            </h3>
                            <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">
                                {about?.headline ?? (
                                    <>Dari Ide Menjadi Karya<br /> Demi Kemajuan<br />Bersama</>
                                )}
                            </h1>
                        </div>

                        {/* Images (fade stack) */}
                        <div className="w-full flex justify-end">
                            <div className="relative max-w-[733px] h-[561px] w-full">
                                {heroImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.src}
                                        alt={img.alt}
                                        className={`absolute inset-0 w-full h-full object-cover rounded-[20px] transition-opacity duration-2000 ease-in-out ${index === heroIndex ? "opacity-100" : "opacity-0"}`}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        onError={(e) => { e.currentTarget.src = "/assets/img/Tempat.png"; }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Deskripsi Paragraf (dinamis dari API) */}
                    <div className="mt-[85px] flex flex-col md:flex-row justify-between gap-20 text-gray-700 text-[15.5px] leading-[25px] w-full">
                        {/* Kiri */}
                        <div className="flex-1 w-full flex flex-col gap-6">
                            {(about?.left_paragraphs?.length ? about.left_paragraphs : []).map((t, i) => (
                                <p key={i}>{t}</p>
                            ))}
                        </div>

                        {/* Kanan */}
                        <div className="flex-1 w-full flex flex-col gap-6">
                            {(about?.right_paragraphs?.length ? about.right_paragraphs : []).map((t, i) => (
                                <p key={i}>{t}</p>
                            ))}
                        </div>
                    </div>

                    {/* Core Value Section */}
                    <div className="mt-[85px] flex flex-col md:flex-row justify-between gap-10 mb-[85px]">
                        {/* Bagian Kiri */}
                        <div className="md:w-1/2 flex flex-col justify-center mt-10">
                            {/* Masukkan kode yang sudah di perbaiki dibawah sini */}
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">
                                {about?.core_title ?? "Core Value Perusahaan"}
                            </h2>

                            <h3 className="text-[32px] font-bold text-gray-900 mb-4 leading-snug">
                                {about?.core_headline ?? (
                                    <>Prinsip Utama yang Menjadi<br />Dasar Tumbuh Bersama</>
                                )}
                            </h3>

                            <p className="text-gray-600 text-[16px] mb-5 leading-relaxed">
                                {about?.core_paragraph ?? (
                                    <>
                                        Sembilan nilai inti ini menjadi pedoman tim Seven INC. dalam
                                        membangun budaya kerja profesional, kolaboratif, dan berkelanjutan
                                        menuju visi perusahaan yang terus berkembang.
                                    </>
                                )}
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

                        {/* Bagian Kanan — viewport + track */}
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
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default TentangKamiFull;