import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const BisnisKamiFull = () => {
    const location = useLocation();

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [ver, setVer] = useState(Date.now());

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/bisnis-kami-full`);
            setData(res.data || {});
            setVer(Date.now());
        } catch (err) {
            console.error("Gagal memuat data /bisnis-kami-full", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const onStorage = (e) => {
            if (e.key === "BISNIS_KAMI_CHANGED") fetchData();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Scroll ke anchor (hash) dengan retry sampai elemen tersedia
    useEffect(() => {
        const hash = location.hash?.slice(1);
        if (!hash) return;

        let cancelled = false;
        let tries = 0;
        const maxTries = 60; // ~1 detik (60fps)

        const tryScroll = () => {
            if (cancelled) return;
            const el = document.getElementById(hash);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (tries < maxTries) {
                tries += 1;
                requestAnimationFrame(tryScroll);
            }
        };

        tryScroll();
        return () => {
            cancelled = true;
        };
    }, [location.hash, loading, ver]);

    const txt = (field, fallback = "") => data?.[field] ?? fallback;
    const img = (field, fallback) =>
        data?.[field] ? `${data[field]}?t=${ver}` : fallback;

    if (loading) {
        return (
            <Layout>
                <div className="py-20 text-center">Memuat…</div>
                <Footer />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-white text-gray-800 font-poppins">
                {/* Header */}
                <div className="relative w-full h-[508px]">
                    <img
                        src={img("header_image", "/assets/img/Banner2.png")}
                        alt="Header Bisnis Kami"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                        <h2 className="uppercase tracking-[0.4em] text-[20px] mb-3 text-black">
                            {txt("header_subtitle", "Lini Bisnis Kami")}
                        </h2>
                        <h1 className="text-[40px] font-bold text-black">
                            {txt("header_title", "Satu Visi, Banyak Solusi")}
                        </h1>
                    </div>
                </div>

                {/* Deskripsi Umum */}
                <Container>
                    <div className="mt-[59px] px-4 text-center">
                        <p className="text-gray-700 text-[16px] leading-relaxed">
                            {txt(
                                "general_description",
                                "Sebagai perusahaan holding multisektor, Seven INC. menaungi beragam unit usaha strategis yang bergerak di bidang teknologi, fashion & tekstil, jasa layanan, serta edukasi dan pelatihan."
                            )}
                        </p>
                    </div>
                </Container>

                {/* Section 1 - Seven Tech */}
                <Container>
                    <div
                        id="seven-tech"
                        className="scroll-mt-[110px] flex flex-col md:flex-row items-center gap-20 mt-[59px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">
                                {txt("seven_tech_title", "Seven Tech")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                {txt("seven_tech_text", "").slice(0, 369)}
                                <br />
                                {txt("seven_tech_text", "").slice(369)}
                            </p>
                        </div>
                        <img
                            src={img("seven_tech_image", "/assets/img/Perusahaan.png")}
                            alt="Seven Tech"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>

                {/* Section 2 - Seven Style */}
                <Container>
                    <div
                        id="seven-style"
                        className="scroll-mt-[110px] flex flex-col md:flex-row-reverse items-center gap-20 mt-[59px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">
                                {txt("seven_style_title", "Seven Style")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                {txt("seven_style_text", "").slice(0, 369)}
                                <br />
                                {txt("seven_style_text", "").slice(369)}
                            </p>
                        </div>
                        <img
                            src={img("seven_style_image", "/assets/img/cardPakaian.png")}
                            alt="Seven Style"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>

                {/* Section 3 - Seven Serve */}
                <Container>
                    <div
                        id="seven-serve"
                        className="scroll-mt-[110px] flex flex-col md:flex-row items-center gap-18 mt-[59px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">
                                {txt("seven_serve_title", "Seven Serve")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                {txt("seven_serve_text", "").slice(0, 369)}
                                <br />
                                {txt("seven_serve_text", "").slice(369)}
                            </p>
                        </div>
                        <img
                            src={img("seven_serve_image", "/assets/img/Keuntungan.png")}
                            alt="Seven Serve"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>

                {/* Section 4 - Seven Edu */}
                <Container>
                    <div
                        id="seven-edu"
                        className="scroll-mt-[110px] flex flex-col md:flex-row-reverse items-center gap-17 mt-[59px] mb-[60px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">
                                {txt("seven_edu_title", "Seven Edu")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                {txt("seven_edu_text", "").slice(0, 369)}
                                <br />
                                {txt("seven_edu_text", "").slice(369)}
                            </p>
                        </div>
                        <img
                            src={img("seven_edu_image", "/assets/img/School.png")}
                            alt="Seven Edu"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default BisnisKamiFull;