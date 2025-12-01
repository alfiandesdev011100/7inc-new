import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

// ====== KONFIG ======
const API_BASE = "http://127.0.0.1:8000/api";

// ====== DUMMY (fallback saat belum ada berita publish) ======
const DUMMY = {
    title:
        "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.",
    date: "28 Jul 2025",
    cover: "/assets/img/news.png",
    bodyHtml: `
    <p class="text-[15.5px] mb-[12px]">
      <span class="font-semibold text-gray-900 text-[20px]">Jakarta (LoremPost)</span> — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer finibus ligula non felis tincidunt, et hendrerit nunc convallis. Quisque ut placerat elit...
    </p>
    <p class="text-[15.5px]">
      Interdum et malesuada fames ac ante ipsum primis in faucibus. Etiam turpis metus, dictum ut nisi non, pellentesque porta purus...
    </p>
    <p class="text-[15.5px] mt-[12px]">
      Ut metus diam, varius a leo eget, ultricies accumsan ligula. Maecenas tempor fermentum lobortis...
    </p>
    <p class="text-[15.5px] mt-[12px]">
      Sed placerat, sapien et fermentum finibus, nibh tellus feugiat odio, ac semper eros dui non odio...
    </p>
  `,
};

// ====== HELPER ======
function formatDate(idIsoOrNull) {
    if (!idIsoOrNull) return null;
    try {
        const d = new Date(idIsoOrNull);
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        return new Intl.DateTimeFormat("id-ID", opts).format(d).replace(".", "");
    } catch {
        return null;
    }
}

const IsiBerita = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // scroll ke atas saat buka
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    const pageState = location.state?.page || 1;
    const newsIdOrSlug = location.state?.newsIdOrSlug || null;

    // data dari API
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(Boolean(newsIdOrSlug));

    useEffect(() => {
        let aborted = false;
        if (!newsIdOrSlug) return; // tidak ada id/slug → biarkan dummy

        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/news/${newsIdOrSlug}`);
                if (!res.ok) throw new Error("not ok");
                const json = await res.json();
                if (!aborted && json?.status) {
                    setNews(json.data);
                }
            } catch {
                // fallback dummy
            } finally {
                !aborted && setLoading(false);
            }
        })();

        return () => {
            aborted = true;
        };
    }, [newsIdOrSlug]);

    // siapkan data untuk UI (API jika ada; kalau tidak dummy)
    const ui = useMemo(() => {
        if (news) {
            return {
                title: news.title,
                date: formatDate(news.published_at) || "",
                cover: news.cover_url || DUMMY.cover,
                // body diasumsikan HTML sederhana; kalau plain text pun tetap tampil
                bodyHtml: news.body || "",
            };
        }
        return DUMMY;
    }, [news]);

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[100px]">
                <Container>
                    <h1 className="text-gray-900 font-bold leading-snug text-[31px] max-w-[1280px]">
                        {ui.title}
                    </h1>

                    <p
                        className="text-red-500 mt-[30px]"
                        style={{ width: "112px", height: "30px", fontSize: "16px" }}
                    >
                        {ui.date}
                    </p>

                    <div className="flex justify-center mt-[57px]">
                        <img
                            src={ui.cover}
                            alt="Card Berita"
                            style={{ width: "998px", height: "539px" }}
                            className="object-cover"
                        />
                    </div>

                    <div
                        className="mt-[50px] leading-relaxed text-justify mx-auto"
                        style={{ maxWidth: "1262px" }}
                    >
                        {/* Render body dari API (HTML) atau dummy */}
                        {ui.bodyHtml ? (
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: ui.bodyHtml }}
                            />
                        ) : (
                            !loading && (
                                <p className="text-[15.5px]">
                                    Konten berita belum tersedia.
                                </p>
                            )
                        )}
                    </div>

                    <div className="mt-[44px] mb-[44px]">
                        <button
                            onClick={() => {
                                navigate("/admin/berita", { state: { page: pageState } });
                                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                            }}
                            className="flex items-center gap-2 text-red-500 cursor-pointer text-[16px] font-medium group"
                            style={{ width: "246px", height: "63px" }}
                        >
                            <i className="ri-arrow-left-long-line text-[20px] transition-colors duration-300 group-hover:text-black"></i>
                            <span className="transition-colors duration-300 group-hover:text-black group-hover:underline">
                                Kembali ke Berita
                            </span>
                        </button>
                    </div>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default IsiBerita;