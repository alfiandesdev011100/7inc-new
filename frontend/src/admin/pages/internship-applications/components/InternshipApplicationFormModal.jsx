import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";

const InternshipApplicationFormModal = ({ isOpen, onClose, onSuccess, dataToEdit, preSelectedInternshipType }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        internship_type: "",
        // Akademik
        university: "",
        major: "",
        // SPK
        ipk_score: 0,
        skill_score: 0,
        experience_score: 0,
        motivation_score: 0,
        status: "pending",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Hardcoded roles list (same as Index)
    const internshipTypes = [
        "Administrasi", "Animasi", "Content Planner", "Content Writer", "Desain Grafis",
        "Digital Market", "Host / Presenter", "Human Resource", "Las", "Marketing & Sales",
        "Public Relation", "Photographer Videographer", "Programmer", "Project Manager",
        "Social Media Specialist", "TikTok Creator", "UI / UX Designer", "Voice Over Talent"
    ];

    useEffect(() => {
        if (isOpen) {
            if (dataToEdit) {
                setFormData({
                    name: dataToEdit.name || "",
                    email: dataToEdit.email || "",
                    phone: dataToEdit.phone || "",
                    internship_type: dataToEdit.internship_type || "",
                    university: dataToEdit.university || "",
                    major: dataToEdit.major || "",
                    ipk_score: dataToEdit.ipk_score || 0,
                    skill_score: dataToEdit.skill_score || 0,
                    experience_score: dataToEdit.experience_score || 0,
                    motivation_score: dataToEdit.motivation_score || 0,
                    status: dataToEdit.status || "pending",
                    notes: dataToEdit.notes || ""
                });
            } else {
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    internship_type: preSelectedInternshipType || "", // Auto-fill if provided
                    university: "",
                    major: "",
                    ipk_score: 0,
                    skill_score: 0,
                    experience_score: 0,
                    motivation_score: 0,
                    status: "pending",
                    notes: ""
                });
            }
            setError("");
        }
    }, [isOpen, dataToEdit, preSelectedInternshipType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (dataToEdit) {
                await api.put(`/admin/internship-applications/${dataToEdit.id}`, formData);
            } else {
                await api.post("/admin/internship-applications", formData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {dataToEdit ? "Edit Peserta Internship" : "Input Peserta Baru"}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="alert alert-error text-sm py-2 rounded-lg">
                            <i className="ri-error-warning-line"></i> {error}
                        </div>
                    )}

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label text-sm font-medium">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:input-primary"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">Universitas</label>
                            <input
                                type="text"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:input-primary"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">Jurusan</label>
                            <input
                                type="text"
                                name="major"
                                value={formData.major}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:input-primary"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">Divisi Magang</label>
                            <input
                                type="text"
                                name="internship_type"
                                value={formData.internship_type}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:input-primary"
                                placeholder="e.g. Web Developer"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:input-primary"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">No. Telepon</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input input-bordered w-full focus:input-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="divider text-xs text-gray-400 font-semibold">KRITERIA PENILAIAN (Skala 0 - 100)</div>

                    {/* Criteria Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="form-control">
                            <label className="label text-xs font-medium text-gray-500">IPK (30%)</label>
                            <input
                                type="number"
                                min="0"
                                max="4"
                                step="0.01"
                                name="ipk_score"
                                value={formData.ipk_score}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full text-center font-bold text-gray-700"
                                required
                                placeholder="0.00 - 4.00"
                            />
                            <span className="text-[10px] text-gray-400 mt-1">*Skala 4.00</span>
                        </div>
                        <div className="form-control">
                            <label className="label text-xs font-medium text-gray-500">Skill (30%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="skill_score"
                                value={formData.skill_score}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full text-center font-bold text-gray-700"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-xs font-medium text-gray-500">Pengalaman (20%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="experience_score"
                                value={formData.experience_score}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full text-center font-bold text-gray-700"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label text-xs font-medium text-gray-500">Motivasi (20%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="motivation_score"
                                value={formData.motivation_score}
                                onChange={handleChange}
                                className="input input-bordered input-sm w-full text-center font-bold text-gray-700"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label text-sm font-medium">Status Aplikasi</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="modal-action pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost hover:bg-gray-100"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span> Simpan...
                                </>
                            ) : (
                                "Simpan Data"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InternshipApplicationFormModal;
