import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "./Container";

// helper: bentuk array dari struktur legacy backend (image_url1..3)
const fromLegacy = (d) => [d?.image_url1, d?.image_url2, d?.image_url3].filter(Boolean);

const TentangKami = () => {
    const [loading, setLoading] = useState(false);

    // ambil cache yang sama dengan TentangKamiFull.jsx agar konsisten & cepat muncul
    const cached = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("about.cache") || "null");
        } catch {
            return null;
        }
    }, []);

    const [about, setAbout] = useState(cached || null);

    // gambar hero kanan untuk landing (pakai gambar pertama dari array legacy)
    const initialHero =
        (fromLegacy(cached)[0] ? fromLegacy(cached)[0] : "/assets/img/Tempat.png");

    const [heroImg, setHeroImg] = useState(initialHero);

    // refresh data terbaru (format legacy yang sama)
    useEffect(() => {
        let alive = true;
        const getAbout = async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/about", {
                    headers: { Accept: "application/json" },
                });
                const data = res.data?.data;
                if (!alive || !data) return;

                setAbout(data);

                const urls = fromLegacy(data);
                setHeroImg(urls[0] || "/assets/img/Tempat.png");

                // simpan cache apa adanya (biar sinkron dengan halaman penuh)
                localStorage.setItem("about.cache", JSON.stringify(data));
            } catch {
                // diamkan: fallback ke cache / default
            }
        };
        getAbout();
        return () => {
            alive = false;
        };
    }, []);

    const navigate = useNavigate();

    const handleClick = () => {
        setLoading(true);
        setTimeout(() => {
            navigate("/admin/tentang-kami");
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }, 1000);
    };

    // pilih paragraf ringkas untuk landing (ambil yang pertama tersedia)
    const landingParagraph =
        (about?.intro_paragraph && String(about.intro_paragraph)) ||
        (about?.left_paragraphs?.[0] && String(about.left_paragraphs[0])) ||
        (about?.right_paragraphs?.[0] && String(about.right_paragraphs[0])) ||
        `Seven Inc. berasal dari kata Seven, yang dalam bahasa Jawa berarti “Pitu”, 
     yang juga memiliki makna “Pitulungan” atau Pertolongan. Nama ini dipilih 
     sebagai wujud komitmen perusahaan untuk senantiasa memberikan dukungan 
     dan manfaat nyata bagi masyarakat melalui berbagai layanan yang ditawarkan.`;

    return (
        <section className="bg-white mt-[85px]">
            <Container className="flex flex-col md:flex-row items-center">
                {/* Kiri: Teks */}
                <div>
                    <h3 className="text-[20px] tracking-[0.43em] uppercase font-normal text-black mb-[21px]">
                        {about?.subtitle ?? "Tentang Kami"}
                    </h3>

                    <h2
                        className="text-[32px] font-bold text-black mb-[21px] leading-snug max-w-[700px] tracking-[-0.01em]"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-once="true"
                    >
                        {about?.headline ?? "Dari Ide Menjadi Karya Demi Kemajuan Bersama"}
                    </h2>

                    <p
                        className="text-black text-[16px] tracking-[-0.01em] leading-[1.5] mb-[52px] max-w-[631px] text-justify"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-once="true"
                    >
                        {landingParagraph}
                    </p>

                    {/* Tombol dengan animasi merah dari kiri ke kanan */}
                    <button
                        onClick={handleClick}
                        disabled={loading}
                        className={`relative overflow-hidden group rounded-4xl font-medium text-[16px] border border-gray-200 text-black w-[220px] h-[56px] transition-all duration-300 cursor-pointer ${loading ? "" : "hover:text-white"
                            }`}
                        {...(!loading && {
                            "data-aos": "fade-up",
                            "data-aos-duration": "1000",
                            "data-aos-once": "true",
                        })}
                    >
                        {/* Efek background merah dari kiri ke kanan */}
                        <span className="absolute inset-0 bg-red-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0" />

                        {/* Isi tombol */}
                        <span
                            className={`relative z-10 flex items-center justify-center h-full w-full gap-2 text-center ${loading ? "text-white" : ""
                                }`}
                            aria-busy={loading}
                            aria-live="polite"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner text-white"></span>
                                    loading
                                </>
                            ) : (
                                "Baca Selengkapnya"
                            )}
                        </span>
                    </button>
                </div>

                {/* Kanan: Gambar */}
                <div className="md:w-1/2 flex justify-end animate__animated animate__fadeInUp animate__delay-1s">
                    <img
                        src={heroImg}
                        alt="Tentang Kami"
                        className="max-w-[584px] h-[447px] w-full object-cover rounded-2xl"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-once="true"
                        onError={(e) => {
                            e.currentTarget.src = "/assets/img/Tempat.png";
                        }}
                        loading="eager"
                        decoding="async"
                    />
                </div>
            </Container>
        </section>
    );
};

export default TentangKami;
