// src/admin/components/FirstBerita.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "./Container";

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

// --- Fallback dummy bila belum ada berita publish / error jaringan ---
const DUMMY_LIST = [
    { id: 1, image: "/assets/img/vectorDiscussion.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 2, image: "/assets/img/vectorComunication.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 3, image: "/assets/img/vectorComunication2.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 4, image: "/assets/img/ngobrol.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 5, image: "/assets/img/chees.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 6, image: "/assets/img/vectorComunication3.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 7, image: "/assets/img/vectorDiscution2.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 8, image: "/assets/img/vectorSenyum.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
    { id: 9, image: "/assets/img/ngobrol2.png", date: "28 Jul 2025", title: "Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM ........." },
];

const itemsPerPage = 3;

// helper format tanggal ISO → "28 Jul 2025"
function fmt(idIso) {
    if (!idIso) return "—";
    try {
        const d = new Date(idIso);
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        return new Intl.DateTimeFormat("id-ID", opts).format(d).replace(".", "");
    } catch {
        return "—";
    }
}

const FirstBerita = () => {
    // data yang ditampilkan di kartu
    const [items, setItems] = useState(DUMMY_LIST);
    const [batchIndex, setBatchIndex] = useState(0);

    // ambil 9 berita terbaru (tanpa featured)
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/news?page=1&per_page=9`);
                if (!res.ok) throw new Error("not ok");
                const json = await res.json();

                if (!aborted && json?.status) {
                    const list = Array.isArray(json.data?.list) ? json.data.list : [];
                    if (list.length) {
                        // map ke struktur kartu
                        const mapped = list.map((n) => ({
                            idOrSlug: n.slug || String(n.id),
                            image: n.cover_url || "/assets/img/vectorDiscussion.png",
                            date: fmt(n.published_at),
                            title: n.title || "",
                        }));
                        setItems(mapped);
                        setBatchIndex(0); // reset slider
                        return;
                    }
                }
                // fallback dummy bila kosong
                !aborted && setItems(DUMMY_LIST);
            } catch {
                !aborted && setItems(DUMMY_LIST);
            }
        })();
        return () => {
            aborted = true;
        };
    }, []);

    // jumlah batch untuk slider (3 kartu per batch)
    const totalBatches = useMemo(
        () => Math.max(1, Math.ceil(items.length / itemsPerPage)),
        [items.length]
    );

    const handleNext = () => setBatchIndex((prev) => Math.min(prev + 1, totalBatches - 1));
    const handlePrev = () => setBatchIndex((prev) => Math.max(prev - 1, 0));

    return (
        <section className="bg-white w-[1309px] mx-auto my-12 overflow-hidden">
            <Container>
                {/* Header */}
                <div className="mb-6">
                    <p className="text-[20px] tracking-[0.3em] uppercase font-normal text-black">
                        Berita
                    </p>

                    <div className="flex items-center justify-between mt-[21px]">
                        <h2 className="text-[32px] font-bold text-black">Update Terbaru</h2>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrev}
                                disabled={batchIndex === 0}
                                className={`w-14 h-14 rounded-full border border-red-500 flex items-center justify-center transition ${batchIndex === 0 ? "opacity-40 cursor-default" : "cursor-pointer"
                                    }`}
                            >
                                <i className="ri-arrow-left-s-line text-red-500 text-[60px] relative right-[2px]" />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={batchIndex === totalBatches - 1}
                                className={`w-14 h-14 rounded-full border border-red-500 flex items-center justify-center transition ${batchIndex === totalBatches - 1 ? "opacity-40 cursor-default" : "cursor-pointer"
                                    }`}
                            >
                                <i className="ri-arrow-right-s-line text-red-500 text-[60px] relative left-[2px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card Wrapper (slider) */}
                <div
                    className="flex gap-[44px] w-[1274px] h-[475px] transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${batchIndex * (386 + 44) * 3}px)` }}
                >
                    {items.map((item, idx) => (
                        <div
                            key={item.idOrSlug || idx}
                            className="w-[386px] h-[420px] bg-white rounded-xl border border-gray-200 shadow-sm shrink-0"
                        >
                            <div className="w-full h-[220px]">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded-t-xl rounded-b-xl"
                                />
                            </div>

                            <div className="p-4 flex flex-col h-[calc(420px-220px)]">
                                <div className="mt-[20px] mb-[15px]">
                                    <p className="text-red-500 text-[14px] font-semibold">{item.date}</p>
                                </div>

                                <div>
                                    <h3 className="text-[18px] font-bold text-black leading-snug">
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="mt-[25px]">
                                    <Link
                                        to="/admin/isi-berita"
                                        state={{ page: 1, newsIdOrSlug: item.idOrSlug ?? null }}
                                        className="flex items-center gap-2 text-red-500 font-medium text-[16px] group w-fit"
                                    >
                                        <span className="group-hover:underline group-hover:text-black">
                                            Lebih Lanjut
                                        </span>
                                        <i className="ri-arrow-right-long-line text-[18px] group-hover:text-black relative top-[2px]" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default FirstBerita;
