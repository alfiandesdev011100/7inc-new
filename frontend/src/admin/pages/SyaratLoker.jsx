// src/admin/Page/SyaratLoker.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../layouts/AdminLayout";
import Container from "../components/Container";

const SyaratLoker = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const job = location.state?.job;
    const [items, setItems] = useState({
        umum: [],
        khusus: [],
        tanggung_jawab: [],
        benefit: [],
    });
    const [intro, setIntro] = useState("");
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState({ type: 'umum', text: '' });

    useEffect(() => {
        if (!job?.id) {
            navigate("/admin/edit-posisi-pekerjaan");
            return;
        }
        fetchRequirements();
    }, [job?.id]);

    const fetchRequirements = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/requirements/by-job/${job.id}`);
            const data = res?.data?.data;
            if (data) {
                setIntro(data.intro_text || "");
                setItems({
                    umum: data.items?.umum || [],
                    khusus: data.items?.khusus || [],
                    tanggung_jawab: data.items?.tanggung_jawab || [],
                    benefit: data.items?.benefit || [],
                });
            }
        } catch (error) {
            console.error("Failed to fetch requirements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus persyaratan ini?")) return;
        try {
            await api.delete(`/admin/requirements/${id}`);
            fetchRequirements();
        } catch (error) {
            alert("Gagal menghapus requirement");
        }
    };

    const handleAdd = async () => {
        if (!newItem.text) return;
        try {
            await api.post("/admin/requirements", {
                job_work_id: job.id,
                type: newItem.type,
                text: newItem.text
            });
            setNewItem({ ...newItem, text: '' });
            fetchRequirements();
        } catch (error) {
            alert("Gagal menambah requirement");
        }
    };

    const renderSection = (title, data, type) => (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wider border-b pb-2">{title}</h2>
            <ul className="space-y-2 mb-4">
                {data.map((it) => (
                    <li key={it.id} className="flex justify-between items-start bg-white p-3 rounded shadow-sm">
                        <span className="text-gray-700">{it.text}</span>
                        <button
                            onClick={() => handleDelete(it.id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                            title="Hapus"
                        >
                            <i className="ri-delete-bin-line"></i>
                        </button>
                    </li>
                ))}
            </ul>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder={`Tambah ${title.toLowerCase()}...`}
                    className="flex-1 border border-gray-300 p-2 rounded bg-gray-50 text-gray-800 focus:bg-white focus:border-blue-400 focus:outline-none transition-all"
                    value={newItem.type === type ? newItem.text : ''}
                    onChange={(e) => setNewItem({ type, text: e.target.value })}
                    onFocus={() => setNewItem({ ...newItem, type })}
                />
                <button
                    onClick={handleAdd}
                    disabled={newItem.type !== type || !newItem.text}
                    className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    <i className="ri-add-line"></i> Tambah
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <Container>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <button onClick={() => navigate("/admin/edit-posisi-pekerjaan")} className="text-gray-500 hover:text-gray-800 mb-2">
                            <i className="ri-arrow-left-line"></i> Kembali
                        </button>
                        <h1 className="text-2xl font-bold">Edit Syarat & Ketentuan</h1>
                        <p className="text-gray-600">Posisi: {job?.title}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {renderSection("Kualifikasi Umum", items.umum, "umum")}
                            {renderSection("Kualifikasi Khusus", items.khusus, "khusus")}
                        </div>
                        <div>
                            {renderSection("Tanggung Jawab", items.tanggung_jawab, "tanggung_jawab")}
                            {renderSection("Benefit", items.benefit, "benefit")}
                        </div>
                    </div>
                )}
            </Container>
        </AdminLayout>
    );
};

export default SyaratLoker;
