import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import JobApplicationFormModal from "./components/JobApplicationFormModal";
import DeleteModal from "../news/components/DeleteModal"; // Reusing delete modal

const JobApplicationsIndex = () => {
    // ... (rest of states)
    const [viewMode, setViewMode] = useState("JOBS_LIST");
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ranking, setRanking] = useState([]);
    const [showRanking, setShowRanking] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [formTargetItem, setFormTargetItem] = useState(null);
    const [deleteTargetItem, setDeleteTargetItem] = useState(null);

    // --- FETCH DATA ---

    // 1. Fetch Active Jobs
    const fetchActiveJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get("/job-works?active_only=true");
            if (res.data?.data) {
                setActiveJobs(res.data.data.data || res.data.data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Applicants for Specific Job
    const fetchApplicantsByJob = async (jobId) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/job-applications?job_work_id=${jobId}&page=${currentPage}`);

            if (res.data.status) {
                setApplicants(res.data.data.data || res.data.data || []);
                setTotalPages(res.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. SPK Analysis
    const fetchSAWAnalysis = async () => {
        if (!selectedJob) return;
        setLoading(true);
        try {
            // Menggunakan endpoint admin/job-applications/analyze sesuai api.php
            // Dan menyertakan bobot default (25% per kriteria) agar sesuai validasi backend
            const res = await api.post("/admin/job-applications/analyze", {
                job_work_id: selectedJob.id,
                weights: {
                    education: 0.25,
                    experience: 0.25,
                    skill: 0.25,
                    interview: 0.25
                }
            });

            if (res.data.status) {
                // Backend mengembalikan data pelamar yang sudah di-ranking
                setRanking(res.data.data);
                setShowRanking(true);
            }
        } catch (error) {
            console.error("Error SAW analysis:", error);
            alert(error.response?.data?.message || "Gagal melakukan analisis SPK.");
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECTS ---

    useEffect(() => {
        if (viewMode === "JOBS_LIST") {
            fetchActiveJobs();
        } else if (viewMode === "APPLICANT_LIST" && selectedJob) {
            fetchApplicantsByJob(selectedJob.id);
        }
    }, [viewMode, selectedJob, currentPage]);

    // --- HANDLERS ---

    const handleSelectJob = (job) => {
        setSelectedJob(job);
        setViewMode("APPLICANT_LIST");
        setCurrentPage(1);
        setShowRanking(false);
        setRanking([]);
    };

    const handleBackToJobs = () => {
        setViewMode("JOBS_LIST");
        setSelectedJob(null);
    };

    const handleAddApplicant = () => {
        setFormTargetItem(null); // New data
        setIsFormOpen(true);
    };

    const handleEditApplicant = (item) => {
        setFormTargetItem(item);
        setIsFormOpen(true);
    };

    const handleDeleteApplicant = (item) => {
        setDeleteTargetItem(item);
        setIsDeleteOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("csv_file", file);
        if (selectedJob) {
            formData.append("job_work_id", selectedJob.id);
        }

        // Menambahkan bobot default agar sesuai validasi backend (Weights required)
        formData.append("weights[education]", 0.25);
        formData.append("weights[experience]", 0.25);
        formData.append("weights[skill]", 0.25);
        formData.append("weights[interview]", 0.25);

        setLoading(true);
        try {
            const res = await api.post("/admin/job-applications/import-csv", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.status) {
                alert(res.data.message || "Data berhasil diimpor.");
                if (selectedJob) fetchApplicantsByJob(selectedJob.id);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert(error.response?.data?.message || "Gagal mengimpor data. Pastikan format file benar.");
        } finally {
            setLoading(false);
            e.target.value = ""; // Reset input
        }
    };

    // --- RENDER ---

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {viewMode === "JOBS_LIST" ? "Daftar Lowongan Aktif" : `Pelamar: ${selectedJob?.title}`}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {viewMode === "JOBS_LIST"
                            ? "Pilih lowongan untuk mengelola pelamar dan analisis SPK."
                            : "Input manual data pelamar & Analisis SPK SAW."}
                    </p>
                </div>

                <div className="flex gap-2">
                    {viewMode === "APPLICANT_LIST" && (
                        <>
                            <button onClick={handleBackToJobs} className="btn btn-ghost btn-sm">
                                <i className="ri-arrow-left-line"></i> Kembali
                            </button>
                            <button
                                onClick={() => { setShowRanking(!showRanking); if (!showRanking) fetchSAWAnalysis(); }}
                                className={`btn ${showRanking ? 'btn-neutral' : 'btn-accent text-white'} shadow-lg`}
                            >
                                <i className="ri-bar-chart-groupped-line mr-2 text-lg"></i>
                                {showRanking ? "Data Mentah" : "Analisis SAW"}
                            </button>
                            <button
                                onClick={handleAddApplicant}
                                className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
                            >
                                <i className="ri-add-line mr-2 text-lg"></i> Input Pelamar
                            </button>
                            <label className="btn btn-success text-white shadow-lg cursor-pointer">
                                <i className="ri-file-excel-2-line mr-2 text-lg"></i> Import CSV
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-2 text-gray-400">Memuat data...</p>
                    </div>
                ) : viewMode === "JOBS_LIST" ? (
                    // --- VIEW 1: ACTIVE JOBS LIST ---
                    <div className="overflow-x-auto">
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-16">No</th>
                                    <th>Posisi / Judul</th>
                                    <th>Perusahaan & Lokasi</th>
                                    <th>Deadline</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-8 text-gray-400">
                                            Tidak ada lowongan aktif saat ini.
                                        </td>
                                    </tr>
                                ) : activeJobs.map((job, index) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-center font-bold text-gray-500">{index + 1}</td>
                                        <td>
                                            <div className="font-bold text-gray-800 text-lg">{job.title}</div>
                                            <div className="text-xs text-gray-500">ID: {job.id}</div>
                                        </td>
                                        <td>
                                            <div className="text-sm font-semibold">{job.company_name}</div>
                                            <div className="text-xs text-gray-500">{job.location}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-ghost text-xs font-mono">{job.deadline}</span>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge badge-success text-white">Aktif</span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleSelectJob(job)}
                                                className="btn btn-sm btn-outline btn-primary"
                                            >
                                                <i className="ri-folder-user-line mr-2"></i> Kelola Pelamar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : showRanking ? (
                    // --- VIEW 2B: RANKING TABLE ---
                    <div className="overflow-x-auto">
                        <div className="p-4 bg-blue-50 border-b border-blue-100">
                            <h3 className="font-bold text-blue-800"><i className="ri-trophy-line mr-2"></i>Hasil Perangkingan SPK SAW: {selectedJob?.title}</h3>
                            <p className="text-xs text-blue-600">Ranking otomatis berdasarkan kriteria (Pendidikan, Pengalaman, Skill, Interview).</p>
                        </div>
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-16">Rank</th>
                                    <th>Nama Pelamar</th>
                                    <th className="text-center">Nilai Akhir</th>
                                    <th className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ranking.map((item, index) => (
                                    <tr key={index} className={index === 0 ? "bg-yellow-50" : ""}>
                                        <td className="text-center font-bold text-lg">
                                            {index + 1}
                                            {index === 0 && <i className="ri-crown-fill text-yellow-500 ml-1"></i>}
                                        </td>
                                        <td className="font-bold text-gray-700">{item.name}</td>
                                        <td className="text-center font-bold text-blue-600 text-lg">{item.saw_score ? Number(item.saw_score).toFixed(4) : "-"}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.status === 'accepted' ? 'badge-success text-white' : 'badge-ghost'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // --- VIEW 2A: APPLICANT DATA TABLE ---
                    <div className="overflow-x-auto">
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-16">#</th>
                                    <th>Data Diri</th>
                                    <th>Detail Magang</th>
                                    <th className="text-center text-gray-800 font-extrabold">Skor Kriteria (0-100)</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applicants.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <i className="ri-inbox-archive-line text-4xl mb-2"></i>
                                                <p>Belum ada pelamar untuk posisi ini.</p>
                                                <button onClick={handleAddApplicant} className="btn btn-link btn-sm text-blue-600">
                                                    + Input Manual Sekarang
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : applicants.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-center text-gray-400 font-medium">
                                            {(currentPage - 1) * 10 + index + 1}
                                        </td>
                                        <td>
                                            <div className="font-bold text-gray-800 text-base">{item.name}</div>
                                            <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-1">
                                                <span className="flex items-center gap-1"><i className="ri-mail-line"></i> {item.email}</span>
                                                <span className="flex items-center gap-1"><i className="ri-phone-line"></i> {item.phone}</span>
                                                <span className="flex items-center gap-1"><i className="ri-map-pin-line"></i> {item.school} - {item.major}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="badge badge-outline badge-sm mb-1">{item.internship_type}</div>
                                            <div className="text-xs text-gray-500">
                                                Durasi: {item.duration} Bulan
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex justify-center gap-2">
                                                <div className="text-center p-1.5 bg-blue-50 border border-blue-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-blue-700 text-sm">{item.education_score || 0}</div>
                                                    <div className="text-[9px] text-blue-400 font-bold uppercase">Edu</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-indigo-700 text-sm">{item.experience_score || 0}</div>
                                                    <div className="text-[9px] text-indigo-400 font-bold uppercase">Exp</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-teal-50 border border-teal-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-teal-700 text-sm">{item.skill_score || 0}</div>
                                                    <div className="text-[9px] text-teal-400 font-bold uppercase">Skill</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-purple-50 border border-purple-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-purple-700 text-sm">{item.interview_score || 0}</div>
                                                    <div className="text-[9px] text-purple-400 font-bold uppercase">Intv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditApplicant(item)} className="btn btn-sm btn-ghost btn-square text-blue-600 tooltip" data-tip="Edit">
                                                    <i className="ri-pencil-line text-lg"></i>
                                                </button>
                                                <button onClick={() => handleDeleteApplicant(item)} className="btn btn-sm btn-ghost btn-square text-red-600 tooltip" data-tip="Hapus">
                                                    <i className="ri-delete-bin-line text-lg"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <JobApplicationFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    fetchApplicantsByJob(selectedJob.id); // Refresh current job list
                }}
                dataToEdit={formTargetItem}
                preSelectedJobId={selectedJob?.id} // Helper to auto-select job in modal
            />

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onSuccess={() => {
                    fetchApplicantsByJob(selectedJob.id);
                }}
                dataToDelete={deleteTargetItem}
                endpoint="/admin/job-applications"
            />
        </AdminLayout>
    );
};

export default JobApplicationsIndex;
