import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const API = "http://127.0.0.1:8000/api";

// Slider konstanta (Layout 2)
const AUTO_MS = 5000;
const CARD_W = 302;
const CARD_GAP = 52;
const VISIBLE = 2;

export default function Internship() {
    /** =========================
     *  STATE — LAYOUT 1 (Hero)
     *  ========================= */
    const [hero, setHero] = useState({
        subtitle: "Internship",
        title: "Temukan\nKesempatan, Bangun\nMasa Depan.",
        image_url: "/assets/img/Internship.png",
    });

    /** =========================
     *  STATE — LAYOUT 2 (Core Value)
     *  ========================= */
    const [coreHeader, setCoreHeader] = useState({
        core_title: "CORE VALUE PERUSAHAAN",
        core_headline: "Prinsip Utama yang Menjadi\nDasar Tumbuh Bersama",
        core_paragraph:
            "Sembilan nilai inti ini menjadi pedoman tim Seven INC. dalam membangun budaya kerja profesional, kolaboratif, dan berkelanjutan menuju visi perusahaan yang terus berkembang.",
    });
    // cards: [{id,title,description,style_type,order,image_url}]
    const [coreCards, setCoreCards] = useState([]);

    /** =========================
     *  STATE — LAYOUT 3 (Syarat & Ketentuan)
     *  ========================= */
    const [termsHeader, setTermsHeader] = useState({
        subtitle: "Syarat & Ketentuan",
        headline: "Persiapkan Dirimu, Tumbuh\nBersama Kami.",
    });
    const [terms, setTerms] = useState([]);

    /** =========================
     *  STATE — LAYOUT 4 (Formasi 18 Card)
     *  ========================= */
    const [formationHeader, setFormationHeader] = useState({
        subtitle: "FORMASI INTERNSHIP",
        headline: "Bangun Kompetensi dan Karakter Bersama Seven INC.",
        paragraph:
            "Program magang dan internship di Seven INC. dirancang untuk menjadi wadah bagi siswa, mahasiswa, maupun individu umum yang ingin mengembangkan keterampilan praktis dan kesiapan kerja melalui bimbingan langsung, pelatihan intensif, serta pengalaman di lingkungan industri multisektor.",
    });
    // cards: [{id,title,order,image_url}]
    const [formationCards, setFormationCards] = useState([]);

    /** =========================
     *  STATE — LAYOUT 5 (Fasilitas)
     *  ========================= */
    const [facilityHeader, setFacilityHeader] = useState({
        subtitle: "FASILITAS YANG DIDAPAT",
        headline: "Karena Belajar Butuh \nLingkungan yang Mendukung.",
    });
    const [facilities, setFacilities] = useState([]);

    /** =========================
     *  FETCH DATA (Public API)
     *  ========================= */
    useEffect(() => {
        const load = async () => {
            try {
                // HERO
                const h = await fetch(`${API}/internship/hero`).then((r) => r.json());
                if (h?.data) {
                    setHero({
                        subtitle: h.data.subtitle ?? hero.subtitle,
                        title: h.data.title ?? hero.title,
                        image_url: h.data.image_url ?? hero.image_url,
                    });
                }

                // CORE VALUES
                const c = await fetch(`${API}/internship/core-values`).then((r) => r.json());
                if (c?.data) {
                    const header = c.data.header ?? {};
                    setCoreHeader({
                        core_title: header.core_title ?? coreHeader.core_title,
                        core_headline: header.core_headline ?? coreHeader.core_headline,
                        core_paragraph: header.core_paragraph ?? coreHeader.core_paragraph,
                    });
                    // fallback image (style_type: 1 → Salaman, 2 → Person)
                    const cards = (c.data.cards ?? []).map((card) => ({
                        ...card,
                        image_url:
                            card.image_url ||
                            (card.style_type === 2
                                ? "/assets/img/vectorPerson.png"
                                : "/assets/img/vectorSalaman.png"),
                    }));
                    setCoreCards(cards);
                }

                // TERMS
                const t = await fetch(`${API}/internship/terms`).then((r) => r.json());
                if (t?.data) {
                    const header = t.data.header ?? {};
                    setTermsHeader({
                        subtitle: header.subtitle ?? termsHeader.subtitle,
                        headline: header.headline ?? termsHeader.headline,
                    });
                    setTerms(t.data.items ?? []);
                }

                // FORMATIONS
                const f = await fetch(`${API}/internship/formations`).then((r) => r.json());
                if (f?.data) {
                    const header = f.data.header ?? {};
                    setFormationHeader({
                        subtitle: header.subtitle ?? formationHeader.subtitle,
                        headline: header.headline ?? formationHeader.headline,
                        paragraph: header.paragraph ?? formationHeader.paragraph,
                    });
                    const cards = (f.data.cards ?? []).map((card) => ({
                        ...card,
                        image_url:
                            card.image_url ||
                            // fallback lokal sesuai order (vector1..vector18)
                            `/assets/img/vector${card.order}.png`,
                    }));
                    setFormationCards(cards);
                }

                // FACILITIES
                const fa = await fetch(`${API}/internship/facilities`).then((r) => r.json());
                if (fa?.data) {
                    const header = fa.data.header ?? {};
                    setFacilityHeader({
                        subtitle: header.subtitle ?? facilityHeader.subtitle,
                        headline: header.headline ?? facilityHeader.headline,
                    });
                    setFacilities(fa.data.items ?? []);
                }
            } catch (err) {
                console.error("Gagal memuat data internship:", err);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** =========================
     *  SLIDER — Core Value (Layout 2)
     *  ========================= */
    const [startIndex, setStartIndex] = useState(0);
    const isFirst = startIndex === 0;
    const isLast = startIndex + VISIBLE >= coreCards.length;
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || coreCards.length === 0) return;
        const id = setInterval(() => {
            setStartIndex((prev) =>
                prev + VISIBLE >= coreCards.length ? 0 : prev + 1
            );
        }, AUTO_MS);
        return () => clearInterval(id);
    }, [paused, coreCards.length]);

    const onPrev = () => !isFirst && setStartIndex((p) => p - 1);
    const onNext = () => !isLast && setStartIndex((p) => p + 1);

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

    const baseTranslate = -(startIndex * (CARD_W + CARD_GAP));
    const trackTranslate = isDragging ? baseTranslate + dragX : baseTranslate;

    // Helper render line breaks
    const renderMultiline = (str = "") =>
        (str || "").split("\n").map((line, idx, arr) => (
            <span key={idx}>
                {line}
                {idx < arr.length - 1 && <br />}
            </span>
        ));

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[130px] pb-24">
                <Container>
                    {/* ============== LAYOUT 1: HERO ============== */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="w-full md:w-[58%]">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3 font-regular">
                                {hero.subtitle}
                            </h3>
                            <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">
                                {renderMultiline(hero.title)}
                            </h1>
                        </div>
                        <div className="w-full flex justify-end">
                            <img
                                src={hero.image_url || "/assets/img/Internship.png"}
                                alt="Internship Hero"
                                className="max-w-[679px] h-[453px] w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* ============== LAYOUT 2: CORE VALUES (Slider 9 Card) ============== */}
                    <div className="mt-[74px] flex flex-col md:flex-row justify-between gap-10">
                        {/* kiri */}
                        <div className="md:w-1/2 flex flex-col justify-center mt-10">
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">
                                {coreHeader.core_title}
                            </h2>
                            <h3 className="text-[32px] font-bold text-gray-900 mb-4 leading-snug">
                                {renderMultiline(coreHeader.core_headline)}
                            </h3>
                            <p className="text-gray-600 text-[16px] mb-5 leading-relaxed">
                                {coreHeader.core_paragraph}
                            </p>

                            <div className="flex items-center gap-12">
                                <button
                                    onClick={onPrev}
                                    disabled={isFirst}
                                    onMouseEnter={() => setPaused(true)}
                                    onMouseLeave={() => setPaused(false)}
                                    className={`w-14 h-14 rounded-full border border-red-500 transition cursor-pointer flex items-center justify-center ${isFirst ? "opacity-30 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <i className="ri-arrow-left-s-line text-red-500 text-[60px] relative right-[1px]"></i>
                                </button>
                                <button
                                    onClick={onNext}
                                    disabled={isLast}
                                    onMouseEnter={() => setPaused(true)}
                                    onMouseLeave={() => setPaused(false)}
                                    className={`w-14 h-14 rounded-full border border-red-500 transition cursor-pointer flex items-center justify-center ${isLast ? "opacity-30 cursor-not-allowed" : ""
                                        }`}
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
                                style={{
                                    width: `${VISIBLE * CARD_W + (VISIBLE - 1) * CARD_GAP}px`,
                                    marginLeft: "auto",
                                }}
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
                                    {coreCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="group border border-gray-300 rounded-xl shadow hover:shadow-md transition text-center flex-none"
                                            style={{ width: `${CARD_W}px`, height: "555px" }}
                                        >
                                            <div className="flex flex-col items-center h-full pt-14">
                                                <div className="w-[143px] h-[143px] rounded-full border border-gray-100 bg-gray-100 group-hover:bg-red-600 transition duration-300 flex items-center justify-center mb-[30px] overflow-hidden">
                                                    <img
                                                        src={card.image_url}
                                                        alt={`Icon ${card.title}`}
                                                        className={`object-contain ${(card.style_type ?? 1) === 2
                                                                ? "w-[90px] h-[90px] ml-[13px]"
                                                                : "w-[100px] h-[100px] mt-2"
                                                            } group-hover:invert`}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <h4
                                                    className="font-semibold text-gray-950 mb-[31px]"
                                                    style={{ fontSize: "20px" }}
                                                >
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

                    {/* ============== LAYOUT 3: Syarat & Ketentuan ============== */}
                    <div className="mt-[74px] flex flex-col md:flex-row justify-between">
                        <div className="md:w-1/2 flex flex-col justify-center mt-8">
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">
                                {termsHeader.subtitle}
                            </h2>
                            <h3 className="text-[32px] font-bold text-gray-900 leading-snug">
                                {renderMultiline(termsHeader.headline)}
                            </h3>
                        </div>

                        <div className="md:w-[55%]">
                            <ol className="list-decimal pl-5 space-y-1 text-gray-700 text-[16px] leading-relaxed w-full">
                                {terms.map((t, idx) => (
                                    <li key={idx}>{t}</li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* ============== LAYOUT 4: Formasi Internship (18 posisi) ============== */}
                    <div className="mt-[74px] text-center max-w-[900px] mx-auto">
                        <h2 className="tracking-[0.6em] uppercase text-gray-600 text-[20px] mb-3">
                            {formationHeader.subtitle}
                        </h2>
                        <h3 className="text-[32px] font-bold text-gray-900 mb-4">
                            {formationHeader.headline}
                        </h3>
                    </div>
                    <p className="text-gray-600 text-[16px] leading-relaxed text-center">
                        {renderMultiline(formationHeader.paragraph)}
                    </p>

                    <div className="mt-12 grid grid-cols-6 gap-14">
                        {formationCards.map((item) => (
                            <div
                                key={item.id}
                                className="h-[137px] flex flex-col items-center justify-center bg-white rounded-lg shadow border border-gray-200 w-full group transition-all duration-300 hover:bg-red-500"
                            >
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-10 h-10 mb-2 transition-all duration-300 group-hover:brightness-0 group-hover:invert object-contain"
                                    />
                                ) : (
                                    <div className="w-10 h-10 mb-2 rounded-full bg-gray-200 group-hover:bg-white" />
                                )}
                                <p className="text-sm font-semibold text-gray-800 text-center px-2 transition-all duration-300 group-hover:text-white">
                                    {item.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ============== LAYOUT 5: Fasilitas ============== */}
                    <div className="mt-[74px] flex flex-col md:flex-row justify-between">
                        <div className="md:w-1/2 flex flex-col justify-center mt-8">
                            <h2 className="uppercase tracking-[0.45em] text-gray-600 text-[20px] mb-3">
                                {facilityHeader.subtitle}
                            </h2>
                            <h3 className="text-[32px] font-bold text-gray-900 leading-snug">
                                {renderMultiline(facilityHeader.headline)}
                            </h3>
                        </div>

                        <div className="md:w-[55%]">
                            <ol className="list-decimal pl-5 space-y-1 text-gray-700 text-[16px] leading-relaxed w-full">
                                {facilities.map((t, idx) => (
                                    <li key={idx}>{t}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </Container>
            </div>

            {/* ============== Banner CTA (tetap) ============== */}
            <Container>
                <div className="relative h-[360px] mt-[64px] mb-[64px]">
                    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                        <div className="absolute top-0 left-0 h-full w-[810px] bg-[#D43026] z-0" />
                        <img
                            src="/assets/img/Chevron.png"
                            alt="Chevron Arrows"
                            className="absolute right-0 top-0 translate-x-[40px] w-[670px] h-full object-cover z-10"
                            draggable={false}
                            data-aos="fade-left"
                            data-aos-duration="1000"
                            data-aos-once="true"
                        />
                        <div className="absolute top-1/2 left-[100px] -translate-y-1/2 z-20 text-white">
                            <p
                                className="uppercase tracking-[0.4em] text-[20px] font-medium mb-4"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-once="true"
                            >
                                Bergabunglah Sekarang
                            </p>
                            <h2
                                className="text-white font-bold text-[20px] md:text-[32px] mb-6"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-once="true"
                            >
                                Kesempatan Berkembang
                                <br />
                                Bersama Seven INC.
                            </h2>
                            <button
                                className="relative overflow-hidden group rounded-4xl font-medium tracking-[0.05em] text-[20px] w-[220px] h-[60px] bg-white text-black transition-all duration-300 cursor-pointer border border-transparent"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-once="true"
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
                        data-aos="fade-left"
                        data-aos-duration="1000"
                        data-aos-once="true"
                    />
                </div>
            </Container>

            <Footer />
        </Layout>
    );
}