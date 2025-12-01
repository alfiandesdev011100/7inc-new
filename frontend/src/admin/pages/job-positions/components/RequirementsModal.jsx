import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom"; // IMPORT createPortal
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const TYPES = [
  { value: "umum", label: "KUALIFIKASI UMUM" },
  { value: "khusus", label: "KUALIFIKASI KHUSUS" },
  { value: "tanggung_jawab", label: "TANGGUNG JAWAB" },
  { value: "benefit", label: "BENEFIT" },
];
const emptyGrouped = { umum: [], khusus: [], tanggung_jawab: [], benefit: [] };

const RequirementsModal = ({ isOpen, onClose, jobData }) => {
  // Auth Headers
  const token = useMemo(() => localStorage.getItem("adminToken"), []);
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
    : { Accept: "application/json" };

  // States
  const [requirementId, setRequirementId] = useState(null);
  const [introText, setIntroText] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [groupedItems, setGroupedItems] = useState(emptyGrouped);
  const [selectedType, setSelectedType] = useState("umum");
  const [newItemText, setNewItemText] = useState("");

  // Loading States
  const [loadingReq, setLoadingReq] = useState(false);
  const [savingIntro, setSavingIntro] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [messageReq, setMessageReq] = useState(null);

  const showMsg = (type, text) => {
    setMessageReq({ type, text });
    setTimeout(() => setMessageReq(null), 3000);
  };

  // Load Data when Modal Opens
  useEffect(() => {
    if (isOpen && jobData) {
      loadRequirements();
    } else {
      setRequirementId(null);
      setIntroText("");
      setGroupedItems(emptyGrouped);
      setMessageReq(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, jobData]);

  const loadRequirements = async () => {
    setLoadingReq(true);
    try {
      const res = await axios.get(
        `${API_BASE}/requirements/by-job/${jobData.id}`
      );
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
      } else {
        setRequirementId(null);
      }
    } catch (error) {
      console.log("Belum ada requirement, siap dibuat.");
    } finally {
      setLoadingReq(false);
    }
  };

  const onSaveIntro = async () => {
    if (!introText.trim()) return showMsg("error", "Intro wajib diisi.");
    setSavingIntro(true);
    try {
      const payload = {
        job_work_id: jobData.id,
        intro_text: introText,
        is_published: isPublished,
      };
      let res;
      if (requirementId) {
        res = await axios.patch(
          `${API_BASE}/admin/requirements/${requirementId}`,
          payload,
          { headers: authHeaders }
        );
      } else {
        res = await axios.post(`${API_BASE}/admin/requirements`, payload, {
          headers: authHeaders,
        });
      }

      const data = res?.data?.data;
      if (data?.id) {
        setRequirementId(data.id);
        showMsg("success", "Intro berhasil disimpan.");
      }
    } catch {
      showMsg("error", "Gagal menyimpan intro.");
    } finally {
      setSavingIntro(false);
    }
  };

  const onAddItem = async () => {
    if (!requirementId)
      return showMsg("error", "Simpan Intro terlebih dahulu.");
    if (!newItemText.trim())
      return showMsg("error", "Teks tidak boleh kosong.");

    setAddingItem(true);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/requirements/${requirementId}/items`,
        { type: selectedType, text: newItemText },
        { headers: authHeaders }
      );
      const item = res?.data?.data;
      setGroupedItems((prev) => ({
        ...prev,
        [selectedType]: [...prev[selectedType], item],
      }));
      setNewItemText("");
    } catch {
      showMsg("error", "Gagal menambah item.");
    } finally {
      setAddingItem(false);
    }
  };

  const onDeleteItem = async (itemId) => {
    if (!confirm("Hapus item ini?")) return;
    try {
      await axios.delete(
        `${API_BASE}/admin/requirements/${requirementId}/items/${itemId}`,
        { headers: authHeaders }
      );
      setGroupedItems((prev) => ({
        ...prev,
        [selectedType]: prev[selectedType].filter((it) => it.id !== itemId),
      }));
    } catch {
      showMsg("error", "Gagal menghapus.");
    }
  };

  const EditableItem = ({ item }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(item.text);

    const handleSave = async () => {
      try {
        await axios.patch(
          `${API_BASE}/admin/requirements/${requirementId}/items/${item.id}`,
          { text: val },
          { headers: authHeaders }
        );
        setIsEditing(false);
      } catch {
        alert("Gagal update");
      }
    };

    if (isEditing) {
      return (
        <div className="flex gap-2 w-full">
          <input
            className="input input-sm input-bordered flex-1 bg-white text-gray-800"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <button className="btn btn-sm btn-success" onClick={handleSave}>
            OK
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setIsEditing(false)}
          >
            X
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-between items-center w-full">
        <span>{val}</span>
        <div className="flex gap-1">
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => setIsEditing(true)}
          >
            <i className="ri-pencil-line" />
          </button>
          <button
            className="btn btn-xs btn-ghost text-red-500"
            onClick={() => onDeleteItem(item.id)}
          >
            <i className="ri-delete-bin-line" />
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // GUNAKAN createPortal UNTUK RENDER MODAL DI BODY
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl min-h-[80vh] m-4 rounded-xl shadow-2xl flex flex-col animate__animated animate__fadeInUp">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Kelola Persyaratan
            </h2>
            <p className="text-sm text-gray-500">
              Posisi:{" "}
              <span className="font-semibold text-blue-600">
                {jobData?.title}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loadingReq ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-dots loading-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Kiri: Intro & Config */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-gray-700 mb-2">
                    1. Intro & Status
                  </h3>
                  <textarea
                    className="textarea textarea-bordered w-full h-32 bg-white text-gray-800"
                    placeholder="Tulis paragraf pembuka..."
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm">Publish?</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                  </div>
                  <button
                    onClick={onSaveIntro}
                    disabled={savingIntro}
                    className="btn btn-primary w-full mt-4"
                  >
                    {savingIntro
                      ? "Menyimpan..."
                      : requirementId
                      ? "Update Intro"
                      : "Simpan Intro"}
                  </button>
                </div>

                {messageReq && (
                  <div
                    className={`alert ${
                      messageReq.type === "error"
                        ? "alert-error"
                        : "alert-success"
                    } text-sm`}
                  >
                    {messageReq.text}
                  </div>
                )}
              </div>

              {/* Kanan: Item Management */}
              <div
                className={`lg:col-span-2 ${
                  !requirementId ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <h3 className="font-bold text-gray-700 mb-4">2. Detail Item</h3>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-4 bg-gray-100">
                  {TYPES.map((t) => (
                    <a
                      key={t.value}
                      className={`tab ${
                        selectedType === t.value
                          ? "tab-active bg-blue-600 text-white"
                          : ""
                      }`}
                      onClick={() => setSelectedType(t.value)}
                    >
                      {t.label.replace("KUALIFIKASI ", "")}
                    </a>
                  ))}
                </div>

                {/* Add Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    className="input input-bordered flex-1 bg-white text-gray-800"
                    placeholder="Tambah item baru..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAddItem()}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={onAddItem}
                    disabled={addingItem}
                  >
                    {addingItem ? "..." : <i className="ri-add-line" />}
                  </button>
                </div>

                {/* List */}
                <ul className="space-y-2">
                  {groupedItems[selectedType].length === 0 && (
                    <p className="text-gray-400 italic text-center py-4">
                      Belum ada item.
                    </p>
                  )}
                  {groupedItems[selectedType].map((item) => (
                    <li
                      key={item.id}
                      className="p-3 bg-gray-50 border rounded flex items-center"
                    >
                      <EditableItem item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body // Target render di element body
  );
};

export default RequirementsModal;
