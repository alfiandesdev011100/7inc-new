import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";

const JobApplicationFormModal = ({ isOpen, onClose, onSuccess, dataToEdit, preSelectedJobId }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        job_work_id: "",
        school: "",
        major: "",
        gender: "",
        domicile: "",
        internship_type: "",
        current_status: "",
        shift_availability: false,
        own_equipment: false,
        equipment_details: "",
        start_date: "",
        duration: "",
        info_source: "",
        other_activities: "",
        education_score: 0,
        experience_score: 0,
        skill_score: 0,
        interview_score: 0,
        status: "pending",
    });

    useEffect(() => {
        if (isOpen) {
            const fetchJobs = async () => {
                try {
                    const res = await api.get("/job-works?active_only=true");
                    if (res.data?.data) {
                        setJobs(res.data.data.data || res.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching jobs:", err);
                }
            };
            fetchJobs();

            if (dataToEdit) {
                // ... (existing edit logic)
                setFormData({
                    name: dataToEdit.name || "",
                    email: dataToEdit.email || "",
                    phone: dataToEdit.phone || "",
                    job_work_id: dataToEdit.job_work_id || "",
                    school: dataToEdit.school || "",
                    major: dataToEdit.major || "",
                    gender: dataToEdit.gender || "",
                    domicile: dataToEdit.domicile || "",
                    internship_type: dataToEdit.internship_type || "",
                    current_status: dataToEdit.current_status || "",
                    shift_availability: !!dataToEdit.shift_availability,
                    own_equipment: !!dataToEdit.own_equipment,
                    equipment_details: dataToEdit.equipment_details || "",
                    start_date: dataToEdit.start_date || "",
                    duration: dataToEdit.duration || "",
                    info_source: dataToEdit.info_source || "",
                    other_activities: dataToEdit.other_activities || "",
                    education_score: dataToEdit.education_score || 0,
                    experience_score: dataToEdit.experience_score || 0,
                    skill_score: dataToEdit.skill_score || 0,
                    interview_score: dataToEdit.interview_score || 0,
                    status: dataToEdit.status || "pending",
                });
            } else {
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    job_work_id: preSelectedJobId || "", // Use preSelectedJobId if available
                    school: "",
                    major: "",
                    gender: "",
                    domicile: "",
                    internship_type: "",
                    current_status: "",
                    shift_availability: false,
                    own_equipment: false,
                    equipment_details: "",
                    start_date: "",
                    duration: "",
                    info_source: "",
                    other_activities: "",
                    education_score: 0,
                    experience_score: 0,
                    skill_score: 0,
                    interview_score: 0,
                    status: "pending",
                });
            }
            setError("");
        }
    }, [isOpen, dataToEdit, preSelectedJobId]); // Add preSelectedJobId to dependency

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (dataToEdit) {
                await api.put(`/admin/job-applications/${dataToEdit.id}`, formData);
            } else {
                await api.post("/admin/job-applications", formData);
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {dataToEdit ? "Edit Data Pelamar" : "Input Pelamar Baru (Google Form)"}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="alert alert-error text-sm py-2 rounded-lg">
                            <i className="ri-error-warning-line"></i> {error}
                        </div>
                    )}

                    {/* SECTION 1: Personal Data */}
                    <div>
                        <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4">Data Diri & Akademik</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label text-sm font-medium">Nama Lengkap</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">No. HP / WA</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Jenis Kelamin</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="select select-bordered w-full">
                                    <option value="">Pilih</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Domisili</label>
                                <input type="text" name="domicile" value={formData.domicile} onChange={handleChange} className="input input-bordered w-full" placeholder="Kota/Kabupaten, Provinsi" />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Asal Sekolah/Kampus</label>
                                <input type="text" name="school" value={formData.school} onChange={handleChange} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Jurusan/Prodi</label>
                                <input type="text" name="major" value={formData.major} onChange={handleChange} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Status Saat Ini</label>
                                <select name="current_status" value={formData.current_status} onChange={handleChange} className="select select-bordered w-full">
                                    <option value="">Pilih Status</option>
                                    <option value="Sekolah/Kuliah">Sedang Sekolah/Kuliah</option>
                                    <option value="Lulus Belum Kerja">Lulus & Belum Bekerja</option>
                                    <option value="Lulus Sudah Kerja">Lulus & Sedang Bekerja</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Internship Details */}
                    <div>
                        <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4">Detail Magang/Posisi</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label text-sm font-medium">Posisi yang Diminati</label>
                                <select name="job_work_id" value={formData.job_work_id} onChange={handleChange} className="select select-bordered w-full" required>
                                    <option value="">Pilih Posisi</option>
                                    {jobs.map(job => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Jenis Magang</label>
                                <select name="internship_type" value={formData.internship_type} onChange={handleChange} className="select select-bordered w-full">
                                    <option value="">Pilih Jenis</option>
                                    <option value="Mandiri">Magang Mandiri</option>
                                    <option value="Reguler">Magang Reguler / Kampus</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Durasi (Bulan)</label>
                                <select name="duration" value={formData.duration} onChange={handleChange} className="select select-bordered w-full">
                                    <option value="">Pilih Durasi</option>
                                    <option value="3">3 Bulan</option>
                                    <option value="4">4 Bulan</option>
                                    <option value="5">5 Bulan</option>
                                    <option value="6">6 Bulan</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Rencana Mulai</label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label text-sm font-medium">Info Dari</label>
                                <select name="info_source" value={formData.info_source} onChange={handleChange} className="select select-bordered w-full">
                                    <option value="">Pilih Sumber</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Twitter">Twitter/X</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="form-control p-3 border rounded-lg">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input type="checkbox" name="shift_availability" checked={formData.shift_availability} onChange={handleChange} className="checkbox checkbox-primary" />
                                    <span className="label-text font-medium">Bersedia Shift? (Pagi: 06.30-14.30 / Middle: 08.00-16.00 / Siang: 13.00-21.00)</span>
                                </label>
                            </div>
                            <div className="form-control p-3 border rounded-lg">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input type="checkbox" name="own_equipment" checked={formData.own_equipment} onChange={handleChange} className="checkbox checkbox-primary" />
                                    <span className="label-text font-medium">Punya Alat Sendiri (Laptop/Komputer)?</span>
                                </label>
                                {formData.own_equipment && (
                                    <input type="text" name="equipment_details" value={formData.equipment_details} onChange={handleChange} className="input input-sm input-bordered mt-2 w-full" placeholder="Sebutkan alatnya..." />
                                )}
                            </div>
                        </div>
                        <div className="form-control mt-4">
                            <label className="label text-sm font-medium">Kegiatan Lain Saat Ini</label>
                            <textarea name="other_activities" value={formData.other_activities} onChange={handleChange} className="textarea textarea-bordered h-20" placeholder="Sebutkan jika ada..."></textarea>
                        </div>
                    </div>

                    {/* SECTION 3: SPK Scoring */}
                    <div>
                        <div className="divider text-xs text-gray-400 font-semibold uppercase">Analisis SPK (Diisi HR)</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className="form-control">
                                <label className="label text-xs font-medium text-gray-500">Pendidikan (25%)</label>
                                <input type="number" min="0" max="100" name="education_score" value={formData.education_score} onChange={handleChange} className="input input-bordered input-sm w-full text-center font-bold text-blue-600" required />
                            </div>
                            <div className="form-control">
                                <label className="label text-xs font-medium text-gray-500">Pengalaman (30%)</label>
                                <input type="number" min="0" max="100" name="experience_score" value={formData.experience_score} onChange={handleChange} className="input input-bordered input-sm w-full text-center font-bold text-blue-600" required />
                            </div>
                            <div className="form-control">
                                <label className="label text-xs font-medium text-gray-500">Skill (25%)</label>
                                <input type="number" min="0" max="100" name="skill_score" value={formData.skill_score} onChange={handleChange} className="input input-bordered input-sm w-full text-center font-bold text-blue-600" required />
                            </div>
                            <div className="form-control">
                                <label className="label text-xs font-medium text-gray-500">Wawancara (20%)</label>
                                <input type="number" min="0" max="100" name="interview_score" value={formData.interview_score} onChange={handleChange} className="input input-bordered input-sm w-full text-center font-bold text-blue-600" required />
                            </div>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label text-sm font-medium">Status Aplikasi</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full">
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="modal-action pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="btn btn-ghost hover:bg-gray-100" disabled={loading}>Batal</button>
                        <button type="submit" className="btn btn-primary text-white shadow-lg shadow-blue-500/30" disabled={loading}>
                            {loading ? <><span className="loading loading-spinner loading-sm"></span> Simpan...</> : "Simpan Data"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobApplicationFormModal;
