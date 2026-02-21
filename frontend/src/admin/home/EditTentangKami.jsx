import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import SectionArticlesManager from "../components/SectionArticlesManager";

const SUB_MAX = 100;
const HEAD_MAX = 255;

const AdminEditTentangKami = () => {
    // hydrate cache dari localStorage (legacy: image_url1..3)
    const cached = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("about.cache") || "null"); }
        catch { return null; }
    }, []);

    const [subtitle, setSubtitle] = useState(cached?.subtitle || "");
    const [headline, setHeadline] = useState(cached?.headline || "");
    const [imgs, setImgs] = useState([
        cached?.image_url1 || null,
        cached?.image_url2 || null,
        cached?.image_url3 || null,
    ]);

    const [slot, setSlot] = useState(1);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [inputKey, setInputKey] = useState(Date.now());

    // gambar besar mengikuti slot terpilih
    const currentImg = preview || imgs[slot - 1] || "/assets/img/Tempat.png";

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/about", {
                    headers: { Accept: "application/json" },
                });
                const data = res.data?.data;
                if (!data) return;

                setSubtitle(data.subtitle || "");
                setHeadline(data.headline || "");
                setImgs([
                    data.image_url1 || null,
                    data.image_url2 || null,
                    data.image_url3 || null,
                ]);

                // simpan cache versi legacy (tanpa images[])
                localStorage.setItem("about.cache", JSON.stringify(data));
            } catch {
                // ignore
            }
        };

        fetchAbout();
    }, []);

    const onPick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 2 * 1024 * 1024) { alert("Maksimal 2MB"); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const clearPick = () => {
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setInputKey(Date.now());
    };

    const onSave = async () => {
        if (!subtitle.trim() || !headline.trim()) {
            alert("Subtitle & Headline wajib diisi");
            return;
        }

        try {
            setSaving(true);
            setSuccess(false);

            const form = new FormData();
            form.append("subtitle", subtitle);
            form.append("headline", headline);
            form.append("slot", String(slot)); // penting: slot gambar (1..3)
            if (file) form.append("image", file);

            const token = localStorage.getItem("adminToken");
            const res = await axios.post("import.meta.env.VITE_API_URL/admin/about", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
            });

            const data = res.data?.data;
            if (data) {
                // update state & cache (legacy)
                setSubtitle(data.subtitle || "");
                setHeadline(data.headline || "");
                setImgs([
                    data.image_url1 || null,
                    data.image_url2 || null,
                    data.image_url3 || null,
                ]);

                clearPick();
                localStorage.setItem("about.cache", JSON.stringify(data));
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2200);
            }
        } catch (e) {
            console.error(e);
            alert("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    // === DEFAULT PARAGRAPHS (tanpa tag HTML) ===
    const DEFAULT_PARAGRAPHS = {
        left: {
            1: "Seven Inc. berasal dari kata Seven, yang dalam bahasa Jawa berarti “Pitu”, yang juga memiliki makna “Pitulungane” atau Pertolongan. Nama ini dipilih sebagai wujud komitmen perusahaan untuk senantiasa memberikan dukungan dan manfaat nyata bagi masyarakat melalui berbagai layanan yang ditawarkan.",
            2: "Seven Inc. merupakan perusahaan digital yang bergerak di bidang industri kreatif, dengan titik awal usaha pada sektor fashion atau apparel pria. Dengan mengedepankan sistem pelayanan daring, Seven Inc. memberikan kemudahan dan kenyamanan bagi para pelanggan dalam memperoleh produk, tanpa harus mengunjungi toko secara langsung.",
            3: "Dalam perkembangannya, Seven Inc. terus memperluas lini bisnisnya ke sektor jasa, antara lain melalui unit usaha Konveksi yang melayani kebutuhan produksi pakaian secara massal maupun custom, serta Jasa Pengelasan yang menyediakan layanan konstruksi logam untuk berbagai keperluan.",
        },
        right: {
            1: "Selain fokus pada kegiatan usaha, Seven Inc. juga berperan aktif dalam mendukung pengembangan sumber daya manusia. Perusahaan membuka kesempatan bagi siswa SMK dan mahasiswa untuk menimba pengalaman kerja melalui program magang dan pelatihan, sehingga mereka dapat mengasah keterampilan sesuai dengan bidang keahliannya masing-masing.",
            2: "Berbekal semangat Pitulungan, Seven Inc. senantiasa berupaya menjadi mitra terpercaya bagi para pelanggan, relasi bisnis, dan masyarakat luas. Dengan inovasi berkelanjutan dan pelayanan profesional, Seven Inc. berkomitmen untuk menghadirkan solusi terbaik, membuka peluang kerja sama, serta berkontribusi positif bagi pertumbuhan industri kreatif di Indonesia.",
        },
    };

    const getDefault = (s, sl) => DEFAULT_PARAGRAPHS?.[s]?.[sl] ?? "";

    // === STATE utk paragraf ===
    const [side, setSide] = useState("left");     // 'left' | 'right'
    const [pSlot, setPSlot] = useState(1);        // left: 1..3, right: 1..2
    const [pContent, setPContent] = useState(""); // teks paragraf yang sedang diedit
    const [paraSaving, setParaSaving] = useState(false);

    // Saat ganti side/slot → ambil nilai terbaru dari cache server; kalau tidak ada, kosong (placeholder menampilkan default)
    useEffect(() => {
        try {
            const d = JSON.parse(localStorage.getItem("about.cache") || "null");
            const key = side === "left" ? `left_p${pSlot}` : `right_p${pSlot}`;
            setPContent(d?.[key] ?? "");
        } catch { }
    }, [side, pSlot]);

    // Muat ulang dari server terakhir (cache lokal yang terakhir disimpan)
    const loadParagraphFromCache = () => {
        try {
            const d = JSON.parse(localStorage.getItem("about.cache") || "null");
            const key = side === "left" ? `left_p${pSlot}` : `right_p${pSlot}`;
            setPContent(d?.[key] ?? "");
        } catch { }
    };

    // Simpan paragraf (konten yang sedang diedit)
    const saveParagraph = async () => {
        if (!pContent.trim()) { alert("Teks paragraf tidak boleh kosong"); return; }
        try {
            setParaSaving(true);
            const token = localStorage.getItem("adminToken");
            const res = await axios.post(
                "import.meta.env.VITE_API_URL/admin/about/paragraph",
                { side, slot: pSlot, content: pContent },
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const data = res.data?.data;
            if (data) {
                localStorage.setItem("about.cache", JSON.stringify(data));
                alert("Paragraf berhasil disimpan");
            }
        } catch (e) {
            console.error(e);
            alert("Gagal menyimpan paragraf");
        } finally {
            setParaSaving(false);
        }
    };

    // Reset hanya untuk slot terpilih → pakai default, lalu simpan ke server
    const resetParagraph = async () => {
        const content = getDefault(side, pSlot);
        try {
            setParaSaving(true);
            setPContent(content);
            const token = localStorage.getItem("adminToken");
            const res = await axios.post(
                "import.meta.env.VITE_API_URL/admin/about/paragraph",
                { side, slot: pSlot, content },
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const data = res.data?.data;
            if (data) {
                localStorage.setItem("about.cache", JSON.stringify(data));
                alert("Paragraf dikembalikan ke default.");
            }
        } catch (e) {
            console.error(e);
            alert("Gagal reset paragraf");
        } finally {
            setParaSaving(false);
        }
    };

    // ====== DEFAULT CORE TEXT ======
    const DEFAULT_CORE = {
        title: "Core Value Perusahaan",
        headline: "Prinsip Utama yang Menjadi\nDasar Tumbuh Bersama",
        paragraph:
            "Sembilan nilai inti ini menjadi pedoman tim Seven INC. dalam membangun budaya kerja profesional, kolaboratif, dan berkelanjutan menuju visi perusahaan yang terus berkembang.",
    };

    const [coreField, setCoreField] = useState("title"); // 'title' | 'headline' | 'paragraph'
    const [coreContent, setCoreContent] = useState("");
    const [coreSaving, setCoreSaving] = useState(false);

    // ambil dari cache terakhir tiap ganti field
    useEffect(() => {
        try {
            const d = JSON.parse(localStorage.getItem("about.cache") || "null");
            if (!d) return setCoreContent("");
            const key =
                coreField === "title"
                    ? "core_title"
                    : coreField === "headline"
                        ? "core_headline"
                        : "core_paragraph";
            setCoreContent(d[key] || "");
        } catch { }
    }, [coreField]);

    const loadCoreFromCache = () => {
        try {
            const d = JSON.parse(localStorage.getItem("about.cache") || "null");
            if (!d) return setCoreContent("");
            const key =
                coreField === "title"
                    ? "core_title"
                    : coreField === "headline"
                        ? "core_headline"
                        : "core_paragraph";
            setCoreContent(d[key] || "");
        } catch { }
    };

    const saveCoreText = async () => {
        if (!coreContent.trim()) { alert("Isi tidak boleh kosong"); return; }
        try {
            setCoreSaving(true);
            const token = localStorage.getItem("adminToken");
            const res = await axios.post(
                "import.meta.env.VITE_API_URL/admin/about/core-text",
                { field: coreField, content: coreContent },
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const data = res.data?.data;
            if (data) {
                localStorage.setItem("about.cache", JSON.stringify(data));
                alert("Core text tersimpan");
            }
        } catch (e) {
            console.error(e);
            alert("Gagal menyimpan core text");
        } finally {
            setCoreSaving(false);
        }
    };

    const resetCoreToDefault = async () => {
        const content = DEFAULT_CORE[coreField] || "";
        try {
            setCoreSaving(true);
            setCoreContent(content);
            const token = localStorage.getItem("adminToken");
            const res = await axios.post(
                "import.meta.env.VITE_API_URL/admin/about/core-text",
                { field: coreField, content },
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const data = res.data?.data;
            if (data) {
                localStorage.setItem("about.cache", JSON.stringify(data));
                alert("Dikembalikan ke default.");
            }
        } catch (e) {
            console.error(e);
            alert("Gagal reset core text");
        } finally {
            setCoreSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col items-center w-full mx-auto pt-[120px] pb-[100px]">
                <h1 className="text-black text-4xl md:text-5xl font-bold italic mb-6">
                    EDIT TENTANG KAMI
                </h1>

                {success && (
                    <div role="alert" className="alert alert-success mt-2 w-full max-w-3xl">
                        <span>Berhasil disimpan.</span>
                    </div>
                )}

                <div className="w-full max-w-3xl mt-8">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-7">

                        {/* Subtitle */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Text kecil (Subtitle)</legend>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Contoh: Tentang Kita"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value.slice(0, SUB_MAX))}
                                maxLength={SUB_MAX}
                            />
                            <span className="label text-xs text-gray-500 mt-1">
                                {subtitle.length}/{SUB_MAX} karakter
                            </span>
                        </fieldset>

                        {/* Headline */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Headline</legend>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Contoh: Dari Ide Menjadi Karya Demi Kemajuan Bersamamu"
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value.slice(0, HEAD_MAX))}
                                maxLength={HEAD_MAX}
                            />
                            <span className="label text-xs text-gray-500 mt-1">
                                {headline.length}/{HEAD_MAX} karakter
                            </span>
                        </fieldset>

                        {/* Pilih slot gambar */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Pilih gambar yang ingin diganti</legend>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <label key={i} className={`cursor-pointer p-3 rounded-xl border ${slot === i ? "border-red-500" : "border-gray-200"} flex flex-col items-center gap-2`}>
                                        <input
                                            type="radio"
                                            name="slot"
                                            className="radio radio-error"
                                            checked={slot === i}
                                            onChange={() => setSlot(i)}
                                        />
                                        <span className="text-sm text-black">Gambar {i}</span>
                                        <img
                                            src={imgs[i - 1] || "/assets/img/Tempat.png"}
                                            onError={(e) => { e.currentTarget.src = "/assets/img/Tempat.png"; }}
                                            alt={`Hero ${i}`}
                                            className="h-20 w-auto object-contain"
                                        />
                                    </label>
                                ))}
                            </div>
                            <span className="label text-xs text-gray-500 mt-2">
                                Yang ditampilkan besar di bawah mengikuti pilihan slot.
                            </span>
                        </fieldset>

                        {/* Preview besar */}
                        <div className="flex flex-col items-start gap-3">
                            <span className="text-sm text-gray-500">Gambar saat ini</span>
                            <div className="rounded-xl border border-base-300 bg-white p-3">
                                <img
                                    src={currentImg}
                                    alt="About hero current"
                                    className="h-40 w-auto object-contain"
                                />
                            </div>
                        </div>

                        {/* File input */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Pick a file (akan menggantikan Gambar {slot})</legend>
                            <input
                                key={inputKey}
                                type="file"
                                className="file-input file-input-primary"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={onPick}
                            />
                            <label className="label">Max size 2MB</label>
                            {preview && (
                                <button type="button" onClick={clearPick} className="btn btn-outline btn-primary btn-sm mt-2">
                                    Hapus pilihan
                                </button>
                            )}
                        </fieldset>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            {(file || saving) && (
                                <button
                                    className="px-5 h-11 rounded-full bg-[#3b3b3b] text-white font-semibold disabled:opacity-60"
                                    onClick={clearPick}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className="px-6 h-11 rounded-full bg-[#D43026] text-white font-semibold disabled:opacity-60 flex items-center gap-2"
                            >
                                {saving ? (<><span className="loading loading-spinner" /> saving</>) : ("Save")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================== Editor Paragraf (Kiri/Kanan) ================== */}
                <div className="w-full max-w-3xl mt-8">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                        <h2 className="text-xl font-semibold text-black">Edit Paragraf</h2>

                        {/* Pilih sisi */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Sisi paragraf</legend>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="side"
                                        className="radio radio-error"
                                        checked={side === "left"}
                                        onChange={() => { setSide("left"); setPSlot(1); }}
                                    />
                                    <span className="text-sm text-black">Kiri (3 paragraf)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="side"
                                        className="radio radio-error"
                                        checked={side === "right"}
                                        onChange={() => { setSide("right"); setPSlot(1); }}
                                    />
                                    <span className="text-sm text-black">Kanan (2 paragraf)</span>
                                </label>
                            </div>
                        </fieldset>

                        {/* Pilih slot */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Pilih paragraf yang ingin diganti</legend>
                            <div className="flex items-center gap-4">
                                {[1, 2, ...(side === "left" ? [3] : [])].map((i) => (
                                    <label key={i} className={`cursor-pointer p-3 rounded-xl border ${pSlot === i ? "border-red-500" : "border-gray-200"} flex items-center gap-2`}>
                                        <input
                                            type="radio"
                                            name="pslot"
                                            className="radio radio-error"
                                            checked={pSlot === i}
                                            onChange={() => setPSlot(i)}
                                        />
                                        <span className="text-sm text-black">Paragraf {i}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {/* Textarea (placeholder = default per slot) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-black text-sm">Isi paragraf</label>
                            <textarea
                                className="textarea textarea-bordered min-h-[140px] w-full"
                                placeholder={getDefault(side, pSlot)}
                                value={pContent}
                                onChange={(e) => setPContent(e.target.value)}
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={resetParagraph}
                                    disabled={paraSaving}
                                    className="btn btn-outline btn-error btn-sm"
                                >
                                    {paraSaving ? "Memproses..." : "Reset ke default"}
                                </button>

                                <button
                                    type="button"
                                    onClick={loadParagraphFromCache}
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    Muat dari server terakhir
                                </button>

                                <button
                                    type="button"
                                    onClick={saveParagraph}
                                    disabled={paraSaving}
                                    className="btn btn-error btn-sm text-white disabled:opacity-60"
                                >
                                    {paraSaving ? "Menyimpan..." : "Simpan Paragraf"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ====== Editor Core Value (H2/H3/Paragraf) ====== */}
                <div className="w-full max-w-3xl mt-8">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                        <h2 className="text-xl font-semibold text-black">Edit Core Value Perusahaan</h2>

                        {/* Pilih field */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-black">Pilih bagian</legend>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="coreField"
                                        className="radio radio-error"
                                        checked={coreField === "title"}
                                        onChange={() => setCoreField("title")}
                                    />
                                    <span className="text-sm text-black">Headline kecil (H2)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="coreField"
                                        className="radio radio-error"
                                        checked={coreField === "headline"}
                                        onChange={() => setCoreField("headline")}
                                    />
                                    <span className="text-sm text-black">Judul utama (H3)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="coreField"
                                        className="radio radio-error"
                                        checked={coreField === "paragraph"}
                                        onChange={() => setCoreField("paragraph")}
                                    />
                                    <span className="text-sm text-black">Paragraf</span>
                                </label>
                            </div>
                        </fieldset>

                        {/* Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-black text-sm">
                                {coreField === "title" ? "H2" : coreField === "headline" ? "H3" : "Paragraf"}
                            </label>

                            {coreField === "paragraph" ? (
                                <textarea
                                    className="textarea textarea-bordered min-h-[140px] w-full"
                                    placeholder={DEFAULT_CORE.paragraph}
                                    value={coreContent}
                                    onChange={(e) => setCoreContent(e.target.value)}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder={coreField === "title" ? DEFAULT_CORE.title : DEFAULT_CORE.headline}
                                    value={coreContent}
                                    onChange={(e) => setCoreContent(e.target.value)}
                                />
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={resetCoreToDefault}
                                    disabled={coreSaving}
                                    className="btn btn-outline btn-error btn-sm"
                                >
                                    {coreSaving ? "Memproses..." : "Reset ke default"}
                                </button>

                                <button
                                    type="button"
                                    onClick={loadCoreFromCache}
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    Muat dari server terakhir
                                </button>

                                <button
                                    type="button"
                                    onClick={saveCoreText}
                                    disabled={coreSaving}
                                    className="btn btn-error btn-sm text-white disabled:opacity-60"
                                >
                                    {coreSaving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Drafts & Articles */}
                <SectionArticlesManager
                    targetPage="about"
                    title="Daftar Artikel Section Tentang Kami"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminEditTentangKami;
