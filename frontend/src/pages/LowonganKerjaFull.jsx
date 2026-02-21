import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const LowonganKerjaFull = () => {
    const location = useLocation();
    const initialPage = location.state?.currentPage || 1;
    const [currentPage, setCurrentPage] = useState(initialPage);

    // State for API Data
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                // Fetch ONLY active jobs
                const res = await axios.get(`${API_BASE}/job-works?active_only=true&page=${currentPage}`);
                if (res.data && res.data.data) {
                    setJobs(res.data.data); // data is in res.data.data because of pagination
                    setTotalPages(res.data.last_page || 1);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
        // Scroll to top when page changes
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, [currentPage]);

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[130px] pb-24">
                <Container>
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="w-full md:w-[58%]">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3 font-regular">
                                Lowongan Kerja
                            </h3>
                            <h1 className="text-[36px] md:text-[40px] font-bold text-gray-900 leading-snug mb-4">
                                Berkarir bersama <br /> Seven INC.
                            </h1>
                            <p className="text-[16px] text-gray-600 leading-relaxed">
                                Temukan peluang karir Anda dengan posisi yang sesuai.
                            </p>
                        </div>

                        <div className="w-full flex justify-end">
                            <img
                                src="/assets/img/cardLoker.png"
                                alt="Lowongan Kerja"
                                className="max-w-[679px] h-[453px] w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Posisi Pekerjaan */}
                    <div className="mt-24">
                        <div className="text-center">
                            <h3 className="text-[20px] tracking-[0.46em] uppercase text-gray-700 mb-3">
                                Posisi Pekerjaan
                            </h3>
                            <h2 className="text-[32px] font-bold text-gray-900 mb-10">
                                Mulai pertumbuhan karirmu sekarang.
                            </h2>
                        </div>

                        {/* 🔹 Loading / Empty State */}
                        {loading ? (
                            <div className="text-center py-12">
                                <span className="loading loading-spinner loading-lg text-red-600"></span>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg">Belum ada lowongan kerja yang tersedia saat ini.</p>
                            </div>
                        ) : (
                            // 🔹 Mapping data jobs
                            jobs.map((job, index) => (
                                <div key={job.id || index} className="w-full mb-[48px]">
                                    {/* Bagian Atas */}
                                    <div className="border border-gray-300 rounded-t-xl px-14 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="text-[24px] font-bold text-gray-900">{job.title}</h3>
                                            <p className="text-[16px] text-[#7B7B7B]">{job.company}</p>
                                        </div>

                                        <Link
                                            to="/syarat-loker"
                                            state={{ job, currentPage, from: "/lowongan-full" }}
                                            className="bg-[#DC3933] text-white rounded-full cursor-pointer flex items-center justify-center border border-gray-200 hover:bg-white hover:text-black transition-all duration-300"
                                            style={{ width: "245px", height: "63px" }}
                                        >
                                            Selengkapnya
                                        </Link>
                                    </div>

                                    {/* Bagian Bawah */}
                                    <div className="border-x border-b border-gray-300 rounded-b-xl px-14 p-1 flex flex-wrap justify-between items-center text-gray-700 text-[16px]">
                                        <div className="flex items-center gap-3 text-[12px] text-[#7B7B7B]">
                                            <img src="/assets/img/bagComponen.png" alt="bag-icon" />
                                            <span>{job.title}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[12px] text-[#7B7B7B]">
                                            <i className="ri-map-pin-line text-[24px]"></i>
                                            <span>{job.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[12px] text-[#7B7B7B]">
                                            <i className="ri-time-line text-[24px]"></i>
                                            <span>Close Date : {job.close_date || job.closeDate}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Tombol Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="flex justify-center mb-[-15px] mt-20">
                                <nav aria-label="Page navigation example">
                                    <ul className="flex items-center gap-7 text-base">

                                        {/* Tombol Arrow Left */}
                                        <li>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`cursor-pointer -mr-2 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-red-500'}`}
                                            >
                                                <i className="ri-arrow-left-double-line text-[25px]"></i>
                                            </button>
                                        </li>

                                        {/* Tombol Halaman Dynamic */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <li key={page}>
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`cursor-pointer font-bold text-[18px] transition-colors duration-200 ${currentPage === page
                                                        ? "text-red-500"
                                                        : "text-black hover:text-red-500"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        ))}

                                        {/* Tombol Arrow Right */}
                                        <li>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className={`cursor-pointer -ml-3 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-red-500'}`}
                                            >
                                                <i className="ri-arrow-right-double-line text-[25px]"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default LowonganKerjaFull;
