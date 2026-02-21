import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "./Container";

const TentangKami = () => {
    const [loading, setLoading] = useState(false);
    const [about, setAbout] = useState(null); // Untuk menyimpan data dinamis tentang kami
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const response = await axios.get("import.meta.env.VITE_API_URL/about", {
                    headers: { Accept: "application/json" },
                });
                setAbout(response.data?.data);
            } catch (error) {
                console.error("Error fetching about data:", error);
            }
        };

        fetchAboutData();
    }, []);

    const handleClick = () => {
        setLoading(true);
        setTimeout(() => {
            navigate("/tentang-kami");
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }, 1000);
    };

    // Render konten berdasarkan data dinamis
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
                        {about?.intro_paragraph ??
                            "Seven Inc. berasal dari kata Seven, yang dalam bahasa Jawa berarti “Pitu”, yang juga memiliki makna “Pitulungan” atau Pertolongan. Nama ini dipilih sebagai wujud komitmen perusahaan untuk senantiasa memberikan dukungan dan manfaat nyata bagi masyarakat melalui berbagai layanan yang ditawarkan."}
                    </p>

                    {/* Tombol dengan animasi merah dari kiri ke kanan */}
                    <button
                        onClick={handleClick}
                        disabled={loading}
                        className={`relative overflow-hidden group rounded-4xl font-medium text-[16px] border border-gray-200 text-black w-[220px] h-[56px] transition-all duration-300 cursor-pointer ${loading ? "" : "hover:text-white"}`}
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
                            className={`relative z-10 flex items-center justify-center h-full w-full gap-2 text-center ${loading ? "text-white" : ""}`}
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
                        src={about?.image_url1 || "/assets/img/Tempat.png"}
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
