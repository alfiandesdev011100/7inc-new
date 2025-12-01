import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

// ========= KONFIG =========
const API_BASE = "http://127.0.0.1:8000/api"; // Laravel API
const DUMMY_PAGES = 3; // jumlah halaman default saat dummy

// ========= DUMMY (fallback ketika belum ada berita publish) =========
const DUMMY_FEATURED = {
    date: "28 Jul 2025",
    title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.",
    image: "/assets/img/news.png",
};

const DUMMY_GRID = [
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/vectorDiscussion.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/vectorComunication.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/vectorComunication2.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/ngobrol.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/chees.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/vectorComunication3.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/vectorDiscution2.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/vectorSenyum.png" },
    { date: "28 Jul 2025", title: DUMMY_FEATURED.title, image: "/assets/img/ngobrol2.png" },
];

// ========= HELPER =========
function formatDate(idIsoOrNull) {
    if (!idIsoOrNull) return null;
    try {
        const d = new Date(idIsoOrNull);
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        return new Intl.DateTimeFormat("id-ID", opts).format(d).replace(".", ""); // “28 Jul 2025”
    } catch {
        return null;
    }
}

const Berita = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // state halaman & total halaman
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(DUMMY_PAGES);

    // data dari API
    const [featuredApi, setFeaturedApi] = useState(null);
    const [listApi, setListApi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [useDummy, setUseDummy] = useState(true); // default pakai dummy

    // ambil page dari navigation state (balik dari /isi-berita)
    useEffect(() => {
        if (location.state?.page) {
            setCurrentPage(location.state.page);
        }
    }, [location.state]);

    // Ambil berita publish sesuai halaman
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/news?page=${currentPage}&per_page=9`, { method: "GET" });
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();

                if (!aborted && json?.status) {
                    const f = json.data?.featured || null;
                    const arr = Array.isArray(json.data?.list) ? json.data.list : [];
                    const meta = json.data?.meta || {};

                    // jika ada minimal satu berita publish (featured), gunakan data API
                    if (f) {
                        setFeaturedApi(f);
                        setListApi(arr);
                        setTotalPages(Math.max(1, meta.last_page || 1));
                        setUseDummy(false);
                    } else {
                        // tidak ada berita publish → aktifkan dummy
                        setFeaturedApi(null);
                        setListApi([]);
                        setTotalPages(DUMMY_PAGES);
                        setUseDummy(true);
                    }
                }
            } catch {
                // error network → fallback ke dummy
                if (!aborted) {
                    setFeaturedApi(null);
                    setListApi([]);
                    setTotalPages(DUMMY_PAGES);
                    setUseDummy(true);
                }
            } finally {
                !aborted && setLoading(false);
            }
        })();
        return () => {
            aborted = true;
        };
    }, [currentPage]);

    // Tentukan featured yang akan dipakai (API atau dummy)
    const featured = useMemo(() => {
        if (!useDummy && featuredApi?.title) {
            return {
                idOrSlug: featuredApi.slug || String(featuredApi.id),
                date: formatDate(featuredApi.published_at) || "",
                title: featuredApi.title,
                image: featuredApi.cover_url || "/assets/img/news.png",
            };
        }
        return DUMMY_FEATURED;
    }, [useDummy, featuredApi]);

    // Map list API → UI, dan kalau kurang dari 9 item kita isi dengan dummy agar grid tetap penuh
    const cards = useMemo(() => {
        if (!useDummy) {
            const mapped =
                Array.isArray(listApi)
                    ? listApi.map((n) => ({
                        idOrSlug: n.slug || String(n.id),
                        date: formatDate(n.published_at) || "",
                        title: n.title,
                        image: n.cover_url || "/assets/img/vectorDiscussion.png",
                    }))
                    : [];

            if (mapped.length >= 9) return mapped.slice(0, 9);

            // isi sisa slot dengan dummy agar layout stabil
            const need = 9 - mapped.length;
            return [...mapped, ...DUMMY_GRID.slice(0, need)];
        }
        // full dummy (3 halaman)
        return DUMMY_GRID;
    }, [useDummy, listApi]);

    const goDetail = (newsIdOrSlug = null) => {
        navigate("/admin/isi-berita", { state: { page: currentPage, newsIdOrSlug } });
    };

    return (
        <Layout>
            <div className="bg-white text-gray-800">
                {/* Hero Section */}
                <div className="relative w-full max-w-[1440px] h-[510px] mx-auto">
                    <img src="/assets/img/Banner3.png" alt="Header Berita" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                        <h3 className="uppercase tracking-[0.5em] text-gray-950 text-[18px] mb-4">List Berita</h3>
                        <h1 className="text-gray-950 font-bold text-[36px] md:text-[40px] leading-snug">
                            Beberapa berita terbaru kami
                        </h1>
                    </div>
                </div>

                {/* Card Utama (Featured) */}
                <Container>
                    <div className="relative z-10">
                        <div className="mt-[-130px] flex justify-center">
                            <div className="w-[1266px] h-[320px] bg-white rounded-2xl shadow-lg flex overflow-hidden">
                                <img src={featured.image} alt="Card Berita" className="w-[480px] h-full object-cover" />
                                <div className="p-8 flex flex-col justify-between h-full">
                                    <p className="text-red-500 text-sm" style={{ width: "89px", height: "30px", marginBottom: "17px" }}>
                                        {featured.date || "—"}
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
                                        {featured.title}
                                    </h2>
                                    <button
                                        onClick={() => goDetail(featured.idOrSlug ?? null)}
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

                        {/* Grid Card (List) */}
                        <div className="mt-20 grid grid-cols-3 gap-x-[45px] gap-y-[80px] justify-items-center">
                            {cards.map((card, index) => (
                                <div key={index} className="w-[386px] h-[475px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                                    <div className="w-full h-[240px] overflow-hidden rounded-[15px]">
                                        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <p className="text-red-500 text-sm" style={{ width: "89px", height: "30px", marginBottom: "9px" }}>
                                            {card.date || "—"}
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
                                            onClick={() => goDetail(card.idOrSlug ?? null)}
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
                                                disabled={loading}
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
                                                className={`cursor-pointer transition-colors duration-200 font-bold text-[18px] ${currentPage === page ? "text-red-500" : "text-black hover:text-red-500"
                                                    }`}
                                                disabled={loading}
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
                                                disabled={loading}
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