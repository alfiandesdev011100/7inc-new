import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";
import PublicAuthModal from "../components/PublicAuthModal";

const SyaratLoker = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const job = location.state?.job;
    const currentPage = location.state?.currentPage || 1;

    const [requirements, setRequirements] = useState({
        umum: [],
        khusus: [],
        tanggung_jawab: [],
        benefit: []
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalView, setModalView] = useState("register");

    // Auth check moved into handleApplyClick

    useEffect(() => {
        if (job?.id) {
            fetchRequirements(job.id);
        }
    }, [job]);

    const fetchRequirements = async (jobId) => {
        setLoading(true);
        try {
            const res = await axios.get(`import.meta.env.VITE_API_URL/requirements/by-job/${jobId}`);
            if (res.data.status) {
                const grouped = {
                    umum: [],
                    khusus: [],
                    tanggung_jawab: [],
                    benefit: []
                };

                res.data.data.forEach(req => {
                    if (grouped[req.type] !== undefined) {
                        grouped[req.type] = req.items.map(i => i.content);
                    }
                });
                setRequirements(grouped);
            }
        } catch (error) {
            console.error("Error fetching requirements:", error);
        } finally {
            setLoading(false);
        }
    };

    const from = location.state?.from || "/lowongan-kerja";
    const handleBack = () => {
        if (from === "/lowongan-full") {
            navigate("/lowongan-full", { state: { currentPage } });
        } else {
            navigate("/lowongan-kerja");
        }
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const handleApplyClick = (e) => {
        e.preventDefault();

        // Cek token secara fresh dan ketat
        const token = localStorage.getItem("publicToken");
        const isActuallyAuthenticated = token && token !== "undefined" && token !== "null" && token.length > 20;

        if (isActuallyAuthenticated) {
            confirmApplication();
        } else {
            // Jika token tidak valid, bersihkan dan suruh daftar
            if (token) localStorage.removeItem("publicToken");
            setModalView("register");
            setShowModal(true);
        }
    };

    const confirmApplication = () => {
        window.open("https://docs.google.com/forms/d/1SkaS-5FX9mx3qFLJHB1acJepUXkUisky-v1THo1R0Hs/viewform", "_blank");
        setShowModal(false);
    };

    if (!job) {
        return (
            <Layout>
                <Container>
                    <div className="pt-[150px] pb-24 text-center">
                        <h2 className="text-xl font-bold text-gray-700">Data Lowongan Tidak Ditemukan</h2>
                        <button onClick={() => navigate("/lowongan-full")} className="btn btn-primary mt-4 text-white">Kembali</button>
                    </div>
                </Container>
                <Footer />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="w-full mx-auto pt-[120px] text-black px-4 relative">
                <Container>
                    {/* 🔹 Back to List */}
                    <div
                        onClick={handleBack}
                        className="flex items-center gap-2 mb-3 cursor-pointer group transition-all duration-300"
                    >
                        <i className="ri-arrow-left-long-line text-[27px] transition-all duration-300 group-hover:text-[#DC3933]"></i>
                        <span className="text-[17px] transition-all duration-300 group-hover:text-[#DC3933]">Back to List</span>
                    </div>

                    {/* 🔹 Judul + Perusahaan */}
                    <div>
                        <h1 className="text-[24px] font-bold">{job.title}</h1>
                        <p className="text-[17px] mt-[14px]">{job.company}</p>
                    </div>

                    {/* 🔹 Border Line */}
                    <div className="border-b-2 border-gray-300 my-4"></div>

                    {/* 🔹 3 Konten Icon + Text */}
                    <div className="flex flex-wrap justify-between items-center w-full text-[12px]">
                        <div className="flex items-center gap-2">
                            <i className="ri-briefcase-4-line text-[24px]"></i>
                            <span>{job.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="ri-map-pin-line text-[24px]"></i>
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="ri-time-line text-[24px]"></i>
                            <span>Close Date: {job.close_date || job.closeDate}</span>
                        </div>
                    </div>

                    {/* 🔹 Deskripsi */}
                    <div className="mt-10 w-full">
                        <p className="text-[16px] leading-relaxed">
                            Bertanggung jawab dalam mengelola administrasi kepegawaian, proses rekrutmen, pengembangan sumber daya manusia, serta memastikan implementasi kebijakan dan budaya perusahaan berjalan efektif.
                        </p>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center">
                            <span className="loading loading-dots loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            {/* 🔹 KUALIFIKASI UMUM */}
                            {requirements.umum.length > 0 && (
                                <>
                                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">KUALIFIKASI UMUM :</h2>
                                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                                        {requirements.umum.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </>
                            )}

                            {/* 🔹 KUALIFIKASI KHUSUS */}
                            {requirements.khusus.length > 0 && (
                                <>
                                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">KUALIFIKASI KHUSUS :</h2>
                                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                                        {requirements.khusus.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </>
                            )}

                            {/* 🔹 TANGGUNG JAWAB */}
                            {requirements.tanggung_jawab.length > 0 && (
                                <>
                                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">TANGGUNG JAWAB :</h2>
                                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                                        {requirements.tanggung_jawab.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </>
                            )}

                            {/* 🔹 BENEFIT */}
                            {requirements.benefit.length > 0 && (
                                <>
                                    <h2 className="mt-[30px] text-[20px] font-bold tracking-[0.2em]">BENEFIT :</h2>
                                    <ul className="mt-[30px] list-disc list-inside text-[16px] leading-relaxed space-y-2 ml-[50px]">
                                        {requirements.benefit.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </>
                            )}
                        </>
                    )}

                    {/* Konten AKhir */}
                    <p className="text-center text-[16px] pt-[30px] italic">
                        Hanya Lamaran yang sesuai kualifikasi yang kami proses
                    </p>

                    {/* Tombol Button */}
                    <button
                        onClick={handleApplyClick}
                        className="bg-[#DC3933] text-white rounded-full cursor-pointer mt-[35px] mb-[59px] border border-gray-200 hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center font-bold"
                        style={{ width: "245px", height: "63px" }}
                    >
                        Daftar Sekarang
                    </button>

                    {/* 🔹 Application Confirmation Modal */}
                    <PublicAuthModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        onAuthenticated={confirmApplication}
                        initialView={modalView}
                    />
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default SyaratLoker;
