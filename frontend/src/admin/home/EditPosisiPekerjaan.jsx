// src/admin/home/EditPosisiPekerjaan.jsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = "import.meta.env.VITE_API_URL";

// ====== Konstanta untuk SyaratLoker ======
const TYPES = [
    { value: "umum", label: "KUALIFIKASI UMUM" },
    { value: "khusus", label: "KUALIFIKASI KHUSUS" },
    { value: "tanggung_jawab", label: "TANGGUNG JAWAB" },
    { value: "benefit", label: "BENEFIT" },
];
const emptyGrouped = { umum: [], khusus: [], tanggung_jawab: [], benefit: [] };

const EditPosisiPekerjaan = () => {
    // ================== STATE POSISI ==================
    const [positions, setPositions] = useState([]);
    const [newPosition, setNewPosition] = useState({
        title: "",
        company: "",
        location: "",
        close_date: "",
    });
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch job positions on page load and when page changes
    useEffect(() => {
        async function fetchPositions() {
            try {
                const response = await axios.get(`${API_BASE}/job-works?page=${currentPage}`);
                setPositions(response.data.data);
                setTotalPages(response.data.last_page); // Assume API returns last_page
            } catch (error) {
                console.error("Error fetching positions", error);
            }
        }
        fetchPositions();
    }, [currentPage]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPosition({ ...newPosition, [name]: value });
    };

    // Add new job position
    const handleAddPosition = async () => {
        try {
            const response = await axios.post(`${API_BASE}/job-works`, newPosition);
            setPositions([...positions, response.data]);
            setNewPosition({ title: "", company: "", location: "", close_date: "" });
        } catch (error) {
            console.error("Error adding position", error);
        }
    };

    // Edit job position
    const handleEditPosition = (id) => {
        const positionToEdit = positions.find((position) => position.id === id);
        setNewPosition({
            title: positionToEdit.title,
            company: positionToEdit.company,
            location: positionToEdit.location,
            close_date: positionToEdit.close_date,
        });
        setEditId(id);
    };

    // Save edited position
    const handleSavePosition = async () => {
        try {
            const response = await axios.put(`${API_BASE}/job-works/${editId}`, newPosition);
            const updatedPositions = positions.map((position) =>
                position.id === editId ? response.data : position
            );
            setPositions(updatedPositions);
            setEditId(null);
            setNewPosition({ title: "", company: "", location: "", close_date: "" });
        } catch (error) {
            console.error("Error saving position", error);
        }
    };

    // Delete job position
    const handleDeletePosition = async (id) => {
        try {
            await axios.delete(`${API_BASE}/job-works/${id}`);
            setPositions(positions.filter((position) => position.id !== id));
        } catch (error) {
            console.error("Error deleting position", error);
        }
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // ================== STATE & LOGIKA SYARAT LOKER ==================
    const token = useMemo(() => localStorage.getItem("adminToken"), []);
    const authHeaders = token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" };

    // Data requirement terkait posisi yang SEDANG di-edit (editId)
    const [requirementId, setRequirementId] = useState(null);
    const [introText, setIntroText] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [groupedItems, setGroupedItems] = useState(emptyGrouped);

    const [selectedType, setSelectedType] = useState("umum");
    const [newItemText, setNewItemText] = useState("");

    const [loadingReq, setLoadingReq] = useState(false);
    const [savingIntro, setSavingIntro] = useState(false);
    const [addingItem, setAddingItem] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [messageReq, setMessageReq] = useState(null); // {type, text}

    const showMsgReq = (type, text) => {
        setMessageReq({ type, text });
        setTimeout(() => setMessageReq(null), 3000);
    };

    const resetReq = () => {
        setRequirementId(null);
        setIntroText("");
        setIsPublished(true);
        setGroupedItems(emptyGrouped);
    };

    // Muat requirement secara OTOMATIS ketika user klik "Edit" pada posisi
    useEffect(() => {
        const loadForJob = async () => {
            if (!editId) {
                resetReq();
                return;
            }

            setLoadingReq(true);
            try {
                // GET publik by job id
                const res = await axios.get(`${API_BASE}/requirements/by-job/${editId}`, {
                    headers: { Accept: "application/json" },
                });
                const data = res?.data?.data;
                if (data?.id) {
                    setRequirementId(data.id);
                    setIntroText(data.intro_text || "");
                    setIsPublished(data.is_published ?? true);
                    setGroupedItems({
                        umum: data.items?.umum || [],
                        khusus: data.items?.khusus || [],
                        tanggung_jawab: data.items?.tanggung_jawab || [],
                        benefit: data.items?.benefit || [],
                    });
                    showMsgReq("success", "Persyaratan dimuat untuk posisi yang dipilih.");
                } else {
                    resetReq();
                }
            } catch {
                // belum ada, kosongkan agar siap buat intro pertama kali
                resetReq();
            } finally {
                setLoadingReq(false);
            }
        };

        loadForJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    // Simpan Intro (buat baru jika belum ada, otomatis kaitkan ke editId)
    const onSaveIntro = async () => {
        if (!editId) {
            showMsgReq("error", "Pilih posisi (klik Edit) terlebih dahulu.");
            return;
        }
        if (!introText.trim()) {
            showMsgReq("error", "Intro wajib diisi.");
            return;
        }

        setSavingIntro(true);
        try {
            let data;
            if (requirementId) {
                const res = await axios.patch(
                    `${API_BASE}/admin/requirements/${requirementId}`,
                    { job_work_id: editId, intro_text: introText, is_published: isPublished },
                    { headers: authHeaders }
                );
                data = res?.data?.data;
            } else {
                const res = await axios.post(
                    `${API_BASE}/admin/requirements`,
                    { job_work_id: editId, intro_text: introText, is_published: isPublished },
                    { headers: authHeaders }
                );
                data = res?.data?.data;
                if (data?.id) setRequirementId(data.id);
            }

            if (data) {
                setIntroText(data.intro_text || "");
                setIsPublished(data.is_published ?? true);
                setGroupedItems({
                    umum: data.items?.umum || [],
                    khusus: data.items?.khusus || [],
                    tanggung_jawab: data.items?.tanggung_jawab || [],
                    benefit: data.items?.benefit || [],
                });
                showMsgReq("success", requirementId ? "Intro diperbarui." : "Intro dibuat.");
            }
        } catch {
            showMsgReq("error", "Gagal menyimpan intro.");
        } finally {
            setSavingIntro(false);
        }
    };

    // Tambah item
    const onAddItem = async () => {
        if (!editId || !requirementId) {
            showMsgReq("error", "Buat atau muat Persyaratan dulu.");
            return;
        }
        if (!newItemText.trim()) {
            showMsgReq("error", "Isi teks item dulu.");
            return;
        }
        setAddingItem(true);
        try {
            const res = await axios.post(
                `${API_BASE}/admin/requirements/${requirementId}/items`,
                { type: selectedType, text: newItemText },
                { headers: authHeaders }
            );
            const item = res?.data?.data;
            if (item) {
                const next = { ...groupedItems };
                next[selectedType] = [...next[selectedType], item];
                setGroupedItems(next);
                setNewItemText("");
                showMsgReq("success", "Item ditambahkan.");
            }
        } catch {
            showMsgReq("error", "Gagal menambahkan item.");
        } finally {
            setAddingItem(false);
        }
    };

    // Update item (inline)
    const onUpdateItem = async (itemId, newText) => {
        if (!newText.trim()) {
            showMsgReq("error", "Teks tidak boleh kosong.");
            return;
        }
        try {
            await axios.patch(
                `${API_BASE}/admin/requirements/${requirementId}/items/${itemId}`,
                { text: newText },
                { headers: authHeaders }
            );
            const next = { ...groupedItems };
            next[selectedType] = next[selectedType].map((it) => (it.id === itemId ? { ...it, text: newText } : it));
            setGroupedItems(next);
            showMsgReq("success", "Item diperbarui.");
        } catch {
            showMsgReq("error", "Gagal memperbarui item.");
        }
    };

    // Hapus item
    const onDeleteItem = async (itemId) => {
        if (!confirm("Yakin hapus item ini?")) return;
        try {
            await axios.delete(`${API_BASE}/admin/requirements/${requirementId}/items/${itemId}`, { headers: authHeaders });
            const next = { ...groupedItems };
            next[selectedType] = next[selectedType].filter((it) => it.id !== itemId);
            setGroupedItems(next);
            showMsgReq("success", "Item dihapus.");
        } catch {
            showMsgReq("error", "Gagal menghapus item.");
        }
    };

    // Reorder (Up/Down)
    const onMove = async (index, dir) => {
        const list = groupedItems[selectedType];
        const targetIdx = dir === "up" ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= list.length) return;

        const newList = [...list];
        [newList[index], newList[targetIdx]] = [newList[targetIdx], newList[index]];
        const orders = newList.map((it, i) => ({ id: it.id, sort_order: i + 1 }));

        setReordering(true);
        try {
            await axios.put(
                `${API_BASE}/admin/requirements/${requirementId}/items/reorder`,
                { type: selectedType, orders },
                { headers: authHeaders }
            );
            const next = { ...groupedItems, [selectedType]: newList };
            setGroupedItems(next);
            showMsgReq("success", "Urutan diperbarui.");
        } catch {
            showMsgReq("error", "Gagal memperbarui urutan.");
        } finally {
            setReordering(false);
        }
    };

    // ================== RENDER ==================
    return (
        <AdminLayout>
            <h1 className="text-5xl text-black text-center font-bold italic">Edit Posisi Pekerjaan</h1>

            {/* Form to add or edit position */}
            <div className="mt-6 text-black">
                <h2 className="text-3xl text-gray-800">{editId ? "Edit Posisi Pekerjaan" : "Tambah Posisi Pekerjaan Baru"}</h2>
                <input
                    type="text"
                    name="title"
                    value={newPosition.title}
                    onChange={handleInputChange}
                    placeholder="Title"
                    className="block w-full p-2 mt-2 mb-4 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="company"
                    value={newPosition.company}
                    onChange={handleInputChange}
                    placeholder="Company"
                    className="block w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    name="location"
                    value={newPosition.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="block w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <input
                    type="date"
                    name="close_date"
                    value={newPosition.close_date}
                    onChange={handleInputChange}
                    className="block w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <button
                    onClick={editId ? handleSavePosition : handleAddPosition}
                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-800"
                >
                    {editId ? "Simpan Perubahan" : "Tambah Posisi"}
                </button>
            </div>

            {/* Daftar Posisi Pekerjaan */}
            <div className="mt-10 text-black">
                <h2 className="text-3xl text-gray-800">Daftar Posisi Pekerjaan</h2>
                <div className="mt-6">
                    {positions && positions.length > 0 ? (
                        positions.map((position, index) => (
                            <div key={position.id} className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-xl">
                                        {index + 1}. {position.title}
                                    </h3>
                                    <p>{position.company}</p>
                                    <p>{position.location}</p>
                                    <p>Close Date: {position.close_date}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditPosition(position.id)}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-yellow-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeletePosition(position.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">Tidak ada posisi pekerjaan yang tersedia.</p>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-300 cursor-pointer text-white rounded disabled:bg-gray-500"
                    >
                        Previous
                    </button>
                    <span className="mx-4 text-lg">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-300 text-white rounded disabled:bg-gray-500 cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* ================== PANEL SYARAT LOKER (paling bawah) ================== */}
            <div className="mx-auto max-w-4xl mt-8">
                {/* Alert */}
                {messageReq && (
                    <div
                        role="alert"
                        className={`alert ${messageReq.type === "success" ? "alert-success" : "alert-error"
                            } mt-6 w-full`}
                    >
                        <span>{messageReq.text}</span>
                    </div>
                )}

                {loadingReq && (
                    <div className="mt-4 flex justify-center">
                        <span className="loading loading-dots loading-lg" />
                    </div>
                )}

                {/* Panel: Intro & Publish */}
                <div className="mt-6 p-6 rounded-xl border border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-black mb-2">Paragraf Pembuka</h2>
                    <p className="text-sm text-gray-500 mb-3">
                        Simpan <span className="font-semibold">hanya</span> paragraf yang dimulai dengan:{" "}
                        <em>
                            “Bertanggung jawab dalam mengelola administrasi kepegawaian, proses rekrutmen, pengembangan sumber daya
                            manusia, serta memastikan implementasi kebijakan dan budaya perusahaan berjalan efektif.”
                        </em>
                    </p>

                    {!editId && (
                        <div className="mb-3 text-sm text-red-500">
                            Pilih salah satu posisi dan klik <b>Edit</b> untuk mengelola persyaratan.
                        </div>
                    )}

                    <textarea
                        className="textarea textarea-bordered w-full min-h-[120px]"
                        placeholder="Tulis paragraf pembuka..."
                        value={introText}
                        onChange={(e) => setIntroText(e.target.value)}
                        disabled={!editId}
                    />

                    <div className="mt-4 flex items-center gap-4">
                        <label className="cursor-pointer label">
                            <span className="label-text text-black mr-3">Published</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-success"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                disabled={!editId}
                            />
                        </label>

                        <button onClick={onSaveIntro} className="btn btn-accent" disabled={savingIntro || !editId}>
                            {savingIntro ? (
                                <>
                                    <span className="loading loading-spinner" /> Menyimpan...
                                </>
                            ) : requirementId ? (
                                "Update Intro"
                            ) : (
                                "Buat Intro"
                            )}
                        </button>
                    </div>
                </div>

                {/* Panel: Items CRUD */}
                <div className="mt-6 p-6 rounded-xl border border-gray-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-bold text-black">Daftar Item</h2>

                        {/* Radio Kategori */}
                        <div className="join">
                            {TYPES.map((t) => (
                                <input
                                    key={t.value}
                                    className="join-item btn"
                                    type="radio"
                                    name="type"
                                    aria-label={t.label}
                                    checked={selectedType === t.value}
                                    onChange={() => setSelectedType(t.value)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Add new item */}
                    <div className="mt-4 flex gap-2">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder={`Tambah item untuk ${selectedType.toUpperCase().replace("_", " ")}`}
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            disabled={!requirementId}
                        />
                        <button className="btn btn-primary" onClick={onAddItem} disabled={!requirementId || addingItem}>
                            {addingItem ? <span className="loading loading-spinner" /> : "Tambah"}
                        </button>
                    </div>

                    {/* List items */}
                    <ul className="mt-4 space-y-3">
                        {groupedItems[selectedType].length === 0 && <li className="text-gray-500">Belum ada data.</li>}

                        {groupedItems[selectedType].map((item, idx) => (
                            <li key={item.id} className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 bg-gray-50">
                                {/* Reorder */}
                                <div className="flex flex-col">
                                    <button
                                        className="btn btn-xs"
                                        onClick={() => onMove(idx, "up")}
                                        disabled={reordering || idx === 0}
                                        title="Naik"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        className="btn btn-xs mt-1"
                                        onClick={() => onMove(idx, "down")}
                                        disabled={reordering || idx === groupedItems[selectedType].length - 1}
                                        title="Turun"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Editable text */}
                                <EditableText initialValue={item.text} onSave={(val) => onUpdateItem(item.id, val)} />

                                {/* Actions */}
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-xs text-gray-400">#{item.sort_order}</span>
                                    <button className="btn btn-error btn-sm" onClick={() => onDeleteItem(item.id)}>
                                        Hapus
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* ================== /PANEL SYARAT LOKER ================== */}
        </AdminLayout>
    );
};

// Komponen teks editable kecil (dipakai panel item)
const EditableText = ({ initialValue, onSave }) => {
    const [val, setVal] = useState(initialValue);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);

    const handleSave = async () => {
        if (!val.trim()) return;
        setSaving(true);
        try {
            await onSave(val);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1">
            {editing ? (
                <div className="flex gap-2">
                    <input className="input input-bordered w-full" value={val} onChange={(e) => setVal(e.target.value)} />
                    <button className="btn btn-success btn-sm" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="loading loading-spinner" /> : "Simpan"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={saving}>
                        Batal
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-black">{val}</span>
                    <button className="btn btn-outline btn-xs" onClick={() => setEditing(true)}>
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditPosisiPekerjaan;
