import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "./Container";

const beritaList = [
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

const FirstBerita = () => {
    const [batchIndex, setBatchIndex] = useState(0);

    const totalBatches = Math.ceil(beritaList.length / itemsPerPage);

    const handleNext = () => {
        setBatchIndex((prev) => (prev + 1) % totalBatches);
    };

    const handlePrev = () => {
        setBatchIndex((prev) => (prev - 1 + totalBatches) % totalBatches);
    };

    // Ambil card yang ditampilkan
    const start = batchIndex * itemsPerPage;
    const displayedCards = beritaList.slice(start, start + itemsPerPage);

    // Jika kurang dari 3 card di akhir, ambil dari awal lagi
    const finalCards =
        displayedCards.length < itemsPerPage
            ? [...displayedCards, ...beritaList.slice(0, itemsPerPage - displayedCards.length)]
            : displayedCards;

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
                                onClick={batchIndex === 0 ? undefined : handlePrev}
                                className={`w-14 h-14 rounded-full border border-red-500 flex items-center justify-center transition ${batchIndex === 0
                                        ? "opacity-40 cursor-default pointer-events-none"
                                        : "cursor-pointer"
                                    }`}
                            >
                                <i
                                    className={`ri-arrow-left-s-line text-red-500 text-[60px] relative right-[2px]`}
                                ></i>
                            </button>
                            <button
                                onClick={batchIndex === totalBatches - 1 ? undefined : handleNext}
                                className={`w-14 h-14 rounded-full border border-red-500 flex items-center justify-center transition ${batchIndex === totalBatches - 1
                                        ? "opacity-40 cursor-default pointer-events-none"
                                        : "cursor-pointer"
                                    }`}
                            >
                                <i
                                    className={`ri-arrow-right-s-line text-red-500 text-[60px] relative left-[2px] `}
                                ></i>
                            </button>

                        </div>
                    </div>
                </div>

                {/* Card Wrapper */}
                <div className="flex gap-[44px] w-[1274px] h-[475px] transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${batchIndex * (386 + 44) * 3}px)` }}
                >

                    {beritaList.map((item) => (
                        <div
                            key={item.id}
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
                                    <h3 className="text-[18px] font-bold text-black leading-snug">{item.title}</h3>
                                </div>

                                <div className="mt-[25px]">
                                    <Link
                                        to="/isi-berita"
                                        className="flex items-center gap-2 text-red-500 font-medium text-[16px] group w-fit"
                                    >
                                        <span className="group-hover:underline group-hover:text-black">Lebih Lanjut</span>
                                        <i className="ri-arrow-right-long-line text-[18px] group-hover:text-black relative top-[2px]"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section >
    );
};

export default FirstBerita;
