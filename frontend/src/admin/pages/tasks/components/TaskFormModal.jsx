import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";

const TaskFormModal = ({ isOpen, onClose, onSuccess, dataToEdit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        target_page: "beranda",
        display_type: "section",
        assigned_to: "",
        due_date: "",
        status: "assigned"
    });
    const [writers, setWriters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Options
    const targetPages = ["beranda", "tentang-kami", "lowongan-kerja", "bisnis-kami", "kontak", "lainnya"];
    const displayTypes = ["hero", "section", "card", "banner", "other"];

    useEffect(() => {
        if (isOpen) {
            // Fetch writers
            const fetchWriters = async () => {
                try {
                    const res = await api.get("/admin/writers");
                    if (res.data.status) {
                        setWriters(res.data.data);
                    }
                } catch (err) {
                    console.error("Failed to load writers");
                }
            };
            fetchWriters();

            if (dataToEdit) {
                setFormData({
                    title: dataToEdit.title,
                    description: dataToEdit.description || "",
                    target_page: dataToEdit.target_page,
                    display_type: dataToEdit.display_type,
                    assigned_to: dataToEdit.assigned_to,
                    due_date: dataToEdit.due_date || "",
                    status: dataToEdit.status,
                });
            } else {
                setFormData({
                    title: "",
                    description: "",
                    target_page: "beranda",
                    display_type: "section",
                    assigned_to: "",
                    due_date: "",
                    status: "assigned"
                });
            }
            setError("");
        }
    }, [isOpen, dataToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = dataToEdit
                ? `/admin/tasks/${dataToEdit.id}`
                : "/admin/tasks";

            const method = dataToEdit ? "put" : "post";

            await api({
                method: method,
                url: url,
                data: formData,
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Gagal menyimpan tugas.");
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
                        {dataToEdit ? "Edit Tugas" : "Buat Tugas Baru"}
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

                    <div className="form-control">
                        <label className="label text-sm font-medium">Judul Tugas</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input input-bordered w-full focus:input-primary"
                            placeholder="Contoh: Buat artikel tentang Layanan IT"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label text-sm font-medium">Target Halaman</label>
                            <select
                                name="target_page"
                                value={formData.target_page}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                {targetPages.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">Tipe Tampilan</label>
                            <select
                                name="display_type"
                                value={formData.display_type}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                {displayTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label text-sm font-medium">Deskripsi / Instruksi</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full h-24 focus:textarea-primary"
                            placeholder="Jelaskan detail tugas yang harus dikerjakan writer..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label text-sm font-medium">Assign To (Writer)</label>
                            <select
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                className="select select-bordered w-full focus:select-primary"
                                required
                            >
                                <option value="">Pilih Writer</option>
                                {writers.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label text-sm font-medium">Deadline</label>
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>

                    {dataToEdit && (
                        <div className="form-control">
                            <label className="label text-sm font-medium">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                            >
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="submitted">Submitted</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    )}

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
                                "Simpan Tugas"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;
