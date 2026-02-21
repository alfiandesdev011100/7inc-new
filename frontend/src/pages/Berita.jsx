import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

// Data dibagi per halaman
const allCards = {
    1: [
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorDiscussion.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication2.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/ngobrol.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/chees.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication3.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorDiscution2.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorSenyum.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/ngobrol2.png" },
    ],
    2: [
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorDiscussion.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication2.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/ngobrol.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/chees.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication3.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorDiscution2.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorSenyum.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/ngobrol2.png" },
    ],
    3: [
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorDiscussion.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication2.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/ngobrol.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/chees.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorComunication3.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorDiscution2.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/vectorSenyum.png" },
        { date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.", image: "/assets/img/ngobrol2.png" },
    ],
};

const Berita = () => {
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const [settings, setSettings] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE || 'import.meta.env.VITE_API_URL'}/news-page-settings`)
            .then(res => setSettings(res.data))
            .catch(() => { });
    }, []);
    const totalPages = Object.keys(allCards).length;


    useEffect(() => {
        if (location.state?.page) {
            setCurrentPage(location.state.page);
        }
    }, [location.state]);

    const cards = allCards[currentPage];

    return (
        <Layout>
            <div className="bg-white text-gray-800">
                {/* Hero Section */}
                <div className="relative w-full max-w-[1440px] h-[510px] mx-auto">
                    <img src={settings?.banner_image_url || "/assets/img/Banner3.png"} alt="Header Berita" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                        <h3 className="uppercase tracking-[0.5em] text-gray-950 text-[18px] mb-4">{settings?.banner_subtitle || "List Berita"}</h3>
                        <h1 className="text-gray-950 font-bold text-[36px] md:text-[40px] leading-snug">{settings?.banner_title || "Beberapa berita terbaru kami"}</h1>
                    </div>
                </div>

                {/* Card Utama */}
                <Container>
                    <div className="relative z-10">
                        <div className="mt-[-130px] flex justify-center">
                            <div className="w-[1266px] h-[320px] bg-white rounded-2xl shadow-lg flex overflow-hidden">
                                <img src="/assets/img/news.png" alt="Card Berita" className="w-[480px] h-full object-cover" />
                                <div className="p-8 flex flex-col justify-between h-full">
                                    <p className="text-red-500 text-sm" style={{ width: "89px", height: "30px", marginBottom: "17px" }}>
                                        28 Jul 2025
                                    </p>
                                    <h2
                                        className="text-gray-900 font-bold leading-snug"
                                        style={{
                                            width: "739px",
                                            height: "60px",
                                            fontSize: "20px",
                                            marginBottom: "102px",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.
                                    </h2>
                                    <button
                                        onClick={() => navigate("/isi-berita", { state: { page: currentPage } })}
                                        className="flex items-center gap-2 text-red-500 text-sm font-medium cursor-pointer mt-[18px] group"
                                        style={{ width: "120px", height: "63px" }}
                                    >
                                        <span className="transition-colors duration-300 group-hover:text-black group-hover:underline">
                                            Lebih Lanjut
                                        </span>
                                        <i className="ri-arrow-right-long-line text-[17px] relative top-[2px] transition-colors duration-300 font-bold group-hover:text-black"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grid Card */}
                        <div className="mt-20 grid grid-cols-3 gap-x-[45px] gap-y-[80px] justify-items-center">
                            {cards.map((card, index) => (
                                <div key={index} className="w-[386px] h-[475px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                                    <div className="w-full h-[240px] overflow-hidden rounded-[15px]">
                                        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <p className="text-red-500 text-sm" style={{ width: "89px", height: "30px", marginBottom: "9px" }}>
                                            {card.date}
                                        </p>
                                        <h3
                                            className="text-gray-900 font-bold leading-snug"
                                            style={{
                                                width: "334px",
                                                height: "60px",
                                                fontSize: "20px",
                                                marginBottom: "18px",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {card.title}
                                        </h3>
                                        <button
                                            onClick={() => navigate("/isi-berita", { state: { page: currentPage } })}
                                            className="flex items-center gap-2 text-red-500 text-sm font-medium cursor-pointer mt-[18px] group"
                                            style={{ width: "120px", height: "63px" }}
                                        >
                                            <span className="transition-colors duration-300 group-hover:text-black group-hover:underline">
                                                Lebih Lanjut
                                            </span>
                                            <i className="ri-arrow-right-long-line text-[17px] relative top-[2px] transition-colors duration-300 font-bold group-hover:text-black"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-[78px] mb-[78px]">
                            <nav aria-label="Page navigation">
                                <ul className="flex items-center gap-7 text-base">
                                    {/* Prev */}
                                    {currentPage > 1 && (
                                        <li>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                className="text-black hover:text-red-500 cursor-pointer -mr-3"
                                            >
                                                <i className="ri-arrow-left-double-line text-[25px]"></i>
                                            </button>
                                        </li>
                                    )}

                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <li key={page}>
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`cursor-pointer transition-colors duration-200 font-bold text-[18px] ${currentPage === page
                                                    ? "text-red-500"
                                                    : "text-black hover:text-red-500"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Next */}
                                    {currentPage < totalPages && (
                                        <li>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                className="text-black-500 hover:text-red-500 cursor-pointer -ml-3"
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

export default Berita;
