import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import InternshipApplicationFormModal from "./components/InternshipApplicationFormModal";
import DeleteModal from "../news/components/DeleteModal";



// Hardcoded positions matching public page
const internshipPositions = [
    { name: "Administrasi", image: "/assets/img/vector1.png" },
    { name: "Animasi", image: "/assets/img/vector2.png" },
    { name: "Content Planner", image: "/assets/img/vector3.png" },
    { name: "Content Writer", image: "/assets/img/vector4.png" },
    { name: "Desain Grafis", image: "/assets/img/vector5.png" },
    { name: "Digital Market", image: "/assets/img/vector6.png" },
    { name: "Host / Presenter", image: "/assets/img/vector7.png" },
    { name: "Human Resource", image: "/assets/img/vector8.png" },
    { name: "Las", image: "/assets/img/vector9.png" },
    { name: "Marketing & Sales", image: "/assets/img/vector10.png" },
    { name: "Public Relation", image: "/assets/img/vector11.png" },
    { name: "Photographer Videographer", image: "/assets/img/vector12.png" },
    { name: "Programmer", image: "/assets/img/vector13.png" },
    { name: "Project Manager", image: "/assets/img/vector14.png" },
    { name: "Social Media Specialist", image: "/assets/img/vector15.png" },
    { name: "TikTok Creator", image: "/assets/img/vector16.png" },
    { name: "UI / UX Designer", image: "/assets/img/vector17.png" },
    { name: "Voice Over Talent", image: "/assets/img/vector18.png" },
];

const InternshipApplicationsIndex = () => {
    // State for Views
    const [viewMode, setViewMode] = useState("ROLES_LIST"); // 'ROLES_LIST' or 'APPLICANT_LIST'
    const [selectedRole, setSelectedRole] = useState(null);

    // Data State
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // SAW Analysis
    const [ranking, setRanking] = useState([]);
    const [showRanking, setShowRanking] = useState(false);

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [formTargetItem, setFormTargetItem] = useState(null);
    const [deleteTargetItem, setDeleteTargetItem] = useState(null);

    // --- FETCH DATA ---

    const fetchApplicantsByRole = async (roleName) => {
        setLoading(true);
        try {
            // Filter by internship_type
            const res = await api.get(
                `/admin/internship-applications?internship_type=${encodeURIComponent(roleName)}&page=${currentPage}`
            );
            if (res.data.status) {
                setApplicants(res.data.data.data || []);
                setTotalPages(res.data.data.last_page);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSAWAnalysis = async () => {
        if (!selectedRole) return;
        setLoading(true);
        try {
            const res = await api.post(
                `/admin/internship-applications/analyze`,
                {
                    internship_type: selectedRole.name,
                    weights: {
                        ipk: 0.3,
                        skill: 0.3,
                        experience: 0.2,
                        motivation: 0.2
                    }
                }
            );
            if (res.data.status) {
                setRanking(res.data.data);
                setShowRanking(true);
            }
        } catch (error) {
            console.error("Error SAW analysis:", error);
            alert("Gagal melakukan analisis SPK.");
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECTS ---

    useEffect(() => {
        if (viewMode === "APPLICANT_LIST" && selectedRole) {
            fetchApplicantsByRole(selectedRole.name);
        }
    }, [viewMode, selectedRole, currentPage]);

    // --- HANDLERS ---

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        setViewMode("APPLICANT_LIST");
        setCurrentPage(1);
        setShowRanking(false);
        setRanking([]);
    };

    const handleBackToRoles = () => {
        setViewMode("ROLES_LIST");
        setSelectedRole(null);
    };

    // Modal Handlers
    const handleAddApplicant = () => {
        setFormTargetItem(null);
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
        if (!file || !selectedRole) return;

        const formData = new FormData();
        formData.append("csv_file", file);
        formData.append("internship_type", selectedRole.name);
        // Add default weights for internship
        formData.append("weights[ipk]", 0.3);
        formData.append("weights[skill]", 0.3);
        formData.append("weights[experience]", 0.2);
        formData.append("weights[motivation]", 0.2);

        setLoading(true);
        try {
            const res = await api.post("/admin/internship-applications/import-csv", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.status) {
                alert(`Berhasil mengimport ${res.data.imported_count} data.`);
                fetchApplicantsByRole(selectedRole.name);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal mengimport CSV.");
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };

    // --- RENDER ---

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {viewMode === "ROLES_LIST" ? "Divisi Internship" : `Pelamar: ${selectedRole?.name}`}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {viewMode === "ROLES_LIST"
                            ? "Pilih divisi untuk mengelola pelamar dan analisis SPK."
                            : "Input manual data internship & Analisis SPK SAW."}
                    </p>
                </div>
                <div className="flex gap-2">
                    {viewMode === "APPLICANT_LIST" && (
                        <>
                            <button onClick={handleBackToRoles} className="btn btn-ghost btn-sm">
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
                                onClick={() => document.getElementById("csvInput").click()}
                                className="btn btn-success text-white shadow-lg shadow-green-500/30"
                                disabled={loading}
                            >
                                <i className="ri-file-excel-line mr-2 text-lg"></i>
                                Import CSV
                            </button>
                            <input
                                id="csvInput"
                                type="file"
                                accept=".csv,.txt"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={handleAddApplicant}
                                className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
                            >
                                <i className="ri-add-line mr-2 text-lg"></i> Input Peserta
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-2 text-gray-400">Memuat data...</p>
                    </div>
                ) : viewMode === "ROLES_LIST" ? (
                    // --- VIEW 1: ROLES GRID ---
                    <div className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {internshipPositions.map((pos, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectRole(pos)}
                                    className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer h-full"
                                >
                                    <div className="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        {/* Fallback icon if image fails or path needs adjust */}
                                        <img
                                            src={pos.image}
                                            alt={pos.name}
                                            className="w-10 h-10 object-contain"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40?text=Icon"; }}
                                        />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-center text-sm group-hover:text-blue-600 transition-colors">
                                        {pos.name}
                                    </h3>
                                    <span className="mt-2 text-xs text-gray-400">Kelola Pelamar →</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : showRanking ? (
                    // --- VIEW 2B: RANKING TABLE ---
                    <div className="overflow-x-auto">
                        <div className="p-4 bg-purple-50 border-b border-purple-100">
                            <h3 className="font-bold text-purple-800"><i className="ri-trophy-line mr-2"></i>Hasil Perangkingan SPK SAW: {selectedRole?.name}</h3>
                            <p className="text-xs text-purple-600">Bobot: IPK 30%, Skill 30%, Pengalaman 20%, Motivasi 20%</p>
                        </div>
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-16">Rank</th>
                                    <th>Nama Peserta</th>
                                    <th className="text-center text-gray-800 font-extrabold">Nilai Akhir</th>
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
                                        <td className="text-center font-bold text-purple-600 text-lg">{item.saw_score ? Number(item.saw_score).toFixed(4) : "-"}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.status === 'accepted' ? 'badge-success text-white' : item.status === 'rejected' ? 'badge-error text-white' : 'badge-ghost'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // --- VIEW 2A: APPLICANT TABLE ---
                    <div className="overflow-x-auto">
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-16">#</th>
                                    <th>Peserta</th>
                                    <th>Info Akademik</th>
                                    <th className="text-center text-gray-800 font-extrabold">Kriteria (Nilai)</th>
                                    <th className="text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applicants.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <i className="ri-user-add-line text-4xl mb-2"></i>
                                                <p>Belum ada data internship untuk posisi ini.</p>
                                                <button onClick={handleAddApplicant} className="btn btn-link btn-sm text-blue-600">
                                                    Input Peserta Manual
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
                                            <div className="font-bold text-gray-800 text-base mb-1">
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.email} | {item.phone}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-[13px] font-semibold text-gray-700 leading-tight">
                                                {item.university && item.university !== '-' ? item.university : 'Univ. Tidak Diketahui'}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-medium">
                                                {item.major && item.major !== '-' ? item.major : 'Jurusan -'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex justify-center gap-2">
                                                <div className="text-center p-1.5 bg-blue-50 border border-blue-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-blue-700 text-sm">{item.ipk_score || 0}</div>
                                                    <div className="text-[9px] text-blue-400 font-bold uppercase">IPK</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-indigo-700 text-sm">{item.skill_score || 0}</div>
                                                    <div className="text-[9px] text-indigo-400 font-bold uppercase">Skill</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-teal-50 border border-teal-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-teal-700 text-sm">{item.experience_score || 0}</div>
                                                    <div className="text-[9px] text-teal-400 font-bold uppercase">Exp</div>
                                                </div>
                                                <div className="text-center p-1.5 bg-purple-50 border border-purple-100 rounded-lg min-w-[55px] shadow-sm">
                                                    <div className="font-extrabold text-purple-700 text-sm">{item.motivation_score || 0}</div>
                                                    <div className="text-[9px] text-purple-400 font-bold uppercase">Motv</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditApplicant(item)}
                                                    className="btn btn-sm btn-square btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
                                                    data-tip="Edit Data"
                                                >
                                                    <i className="ri-pencil-line text-lg"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteApplicant(item)}
                                                    className="btn btn-sm btn-square btn-ghost text-red-600 hover:bg-red-50 tooltip"
                                                    data-tip="Hapus"
                                                >
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

                {/* Pagination */}
                {!showRanking && totalPages > 1 && (
                    <div className="p-4 flex justify-center border-t border-gray-100 bg-gray-50/50">
                        {/* Pagination controls code kept same but simplified for brevity in this view */}
                        <div className="join shadow-sm bg-white">
                            <button className="join-item btn btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>«</button>
                            <button className="join-item btn btn-sm bg-white pointer-events-none">Halaman {currentPage} dari {totalPages}</button>
                            <button className="join-item btn btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <InternshipApplicationFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    // Refresh current list if a role is selected
                    if (selectedRole) fetchApplicantsByRole(selectedRole.name);
                }}
                dataToEdit={formTargetItem}
                preSelectedInternshipType={selectedRole?.name} // Auto-fill role
            />
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onSuccess={() => {
                    if (selectedRole) fetchApplicantsByRole(selectedRole.name);
                }}
                dataToDelete={deleteTargetItem}
                endpoint="/admin/internship-applications"
            />
        </AdminLayout>
    );
};

export default InternshipApplicationsIndex;
