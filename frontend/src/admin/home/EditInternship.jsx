import { useEffect, useRef, useState, Fragment } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Container from "../components/Container";
import SectionArticlesManager from "../components/SectionArticlesManager";
import axios from "axios";


const useAlert = () => {
    const [alert, setAlert] = useState(null);
    useEffect(() => {
        if (!alert) return;
        const t = setTimeout(() => setAlert(null), 3000);
        return () => clearTimeout(t);
    }, [alert]);
    return [alert, setAlert];
};
const btn = "inline-flex items-center justify-center h-[44px] px-6 rounded-lg font-semibold text-white cursor-pointer transition disabled:opacity-50";
const Btn = ({ onClick, disabled, children, color = "bg-blue-600 hover:bg-blue-700", className = "" }) => (
    <button onClick={onClick} disabled={disabled} className={`${btn} ${color} ${className}`}>{children}</button>
);

export default function EditInternship() {
    const [alert, setAlert] = useAlert();
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("adminToken");
    const api = axios.create({
        baseURL: "import.meta.env.VITE_API_URL",
        headers: { Accept: "application/json", Authorization: token ? `Bearer ${token}` : "" },
    });


    const [subtitle, setSubtitle] = useState("");
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const heroFileRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/internship/hero");
                const d = res.data?.data;
                setSubtitle(d?.subtitle || ""); setTitle(d?.title || ""); setImageUrl(d?.image_url || null);
            } catch { setAlert({ type: "error", message: "Gagal memuat data hero." }); }
        })();
    }, []);

    const handleSaveHeroText = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put("/admin/internship/hero", { subtitle, title });
            setAlert({ type: "success", message: "Teks hero berhasil disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan teks hero." }); }
        finally { setLoading(false); }
    };
    const handleChooseHero = (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setImageFile(f); const r = new FileReader(); r.onload = ev => setImageUrl(ev.target.result); r.readAsDataURL(f);
    };
    const handleSaveHeroImage = async () => {
        if (!imageFile) return setAlert({ type: "error", message: "Belum memilih file gambar." });
        try {
            setLoading(true); setAlert(null);
            const form = new FormData(); form.append("image", imageFile);
            const res = await api.post("/admin/internship/hero/image", form, { headers: { "Content-Type": "multipart/form-data" } });
            setImageUrl(res.data?.data?.image_url || null); setImageFile(null);
            setAlert({ type: "success", message: "Gambar hero berhasil disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan gambar hero." }); }
        finally { setLoading(false); }
    };


    const [coreTitle, setCoreTitle] = useState("");
    const [coreHeadline, setCoreHeadline] = useState("");
    const [coreParagraph, setCoreParagraph] = useState("");
    const [coreCards, setCoreCards] = useState([]);
    const [selectedCoreCardId, setSelectedCoreCardId] = useState(null);
    const selectedCoreCard = coreCards.find(c => c.id === selectedCoreCardId) || null;
    const [coreCardTitle, setCoreCardTitle] = useState("");
    const [coreCardDescription, setCoreCardDescription] = useState("");
    const [coreCardImageUrl, setCoreCardImageUrl] = useState(null);
    const [coreCardImageFile, setCoreCardImageFile] = useState(null);
    const coreCardFileRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/internship/core-values");
                const h = res.data?.data?.header; const list = res.data?.data?.cards || [];
                setCoreTitle(h?.core_title || ""); setCoreHeadline(h?.core_headline || ""); setCoreParagraph(h?.core_paragraph || ""); setCoreCards(list);
            } catch { setAlert({ type: "error", message: "Gagal memuat Core Value." }); }
        })();
    }, []);

    const handleSaveCoreHeader = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put("/admin/internship/core-values/header", {
                core_title: coreTitle, core_headline: coreHeadline, core_paragraph: coreParagraph,
            });
            setAlert({ type: "success", message: "Header Core Value disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan header Core Value." }); }
        finally { setLoading(false); }
    };

    const openCoreCardEditor = (id) => {
        const c = coreCards.find(x => x.id === id); if (!c) return;
        setSelectedCoreCardId(id); setCoreCardTitle(c.title || ""); setCoreCardDescription(c.description || "");
        setCoreCardImageUrl(c.image_url || null); setCoreCardImageFile(null);
    };
    const backToCoreGrid = () => { setSelectedCoreCardId(null); setCoreCardImageFile(null); };
    const handleChooseCoreCardImage = (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setCoreCardImageFile(f); const r = new FileReader(); r.onload = ev => setCoreCardImageUrl(ev.target.result); r.readAsDataURL(f);
    };

    const handleSaveCoreCardImage = async () => {
        if (!selectedCoreCardId || !coreCardImageFile) return setAlert({ type: "error", message: "Belum memilih file gambar card." });
        try {
            setLoading(true); setAlert(null);
            const form = new FormData(); form.append("image", coreCardImageFile);
            const res = await api.post(`/admin/internship/core-values/cards/${selectedCoreCardId}/image`, form, { headers: { "Content-Type": "multipart/form-data" } });
            const newUrl = res.data?.data?.image_url || null;
            setCoreCards(prev => prev.map(c => c.id === selectedCoreCardId ? { ...c, image_url: newUrl } : c));
            setCoreCardImageUrl(newUrl); setCoreCardImageFile(null);
            setAlert({ type: "success", message: "Gambar card berhasil disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan gambar card." }); }
        finally { setLoading(false); }
    };


    const [termsSubtitle, setTermsSubtitle] = useState("");
    const [termsHeadline, setTermsHeadline] = useState("");
    const [terms, setTerms] = useState([]);
    const [selectedTermIdx, setSelectedTermIdx] = useState(0);
    const [termText, setTermText] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/internship/terms");
                const h = res.data?.data?.header ?? {};
                const items = (res.data?.data?.items ?? []).map(t => typeof t === "string" ? t : t?.text ?? "");
                setTermsSubtitle(h.subtitle ?? ""); setTermsHeadline(h.headline ?? ""); setTerms(items);
                setSelectedTermIdx(0); setTermText(items[0] ?? "");
            } catch { setAlert({ type: "error", message: "Gagal memuat Syarat & Ketentuan." }); }
        })();
    }, []);

    const handleSaveTermsHeader = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put("/admin/internship/terms/header", { subtitle: termsSubtitle, headline: termsHeadline });
            setAlert({ type: "success", message: "Header Syarat & Ketentuan disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan header Syarat & Ketentuan." }); }
        finally { setLoading(false); }
    };
    const handleSelectTerm = (idx) => { setSelectedTermIdx(idx); setTermText(terms[idx] ?? ""); };
    const handleSaveSelectedTerm = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put(`/admin/internship/terms/items/${selectedTermIdx + 1}`, { text: termText });
            setTerms(prev => { const n = [...prev]; n[selectedTermIdx] = termText; return n; });
            setAlert({ type: "success", message: "Syarat berhasil disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan syarat." }); }
        finally { setLoading(false); }
    };


    const [formSub, setFormSub] = useState("");
    const [formHead, setFormHead] = useState("");
    const [formPara, setFormPara] = useState("");
    const [formCards, setFormCards] = useState([]);
    const [selectedFormCardId, setSelectedFormCardId] = useState(null);
    const selectedFormCard = formCards.find(c => c.id === selectedFormCardId) || null;
    const [formCardTitle, setFormCardTitle] = useState("");
    const [formCardImageUrl, setFormCardImageUrl] = useState(null);
    const [formCardImageFile, setFormCardImageFile] = useState(null);
    const formCardFileRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/internship/formations");
                const h = res.data?.data?.header ?? {};
                setFormSub(h.subtitle ?? ""); setFormHead(h.headline ?? ""); setFormPara(h.paragraph ?? "");
                setFormCards(res.data?.data?.cards ?? []);
            } catch { setAlert({ type: "error", message: "Gagal memuat Formasi Internship." }); }
        })();
    }, []);

    const handleSaveFormationHeader = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put("/admin/internship/formations/header", { subtitle: formSub, headline: formHead, paragraph: formPara });
            setAlert({ type: "success", message: "Header Formasi disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan header Formasi." }); }
        finally { setLoading(false); }
    };

    const openFormCardEditor = (id) => {
        const c = formCards.find(x => x.id === id); if (!c) return;
        setSelectedFormCardId(id); setFormCardTitle(c.title || ""); setFormCardImageUrl(c.image_url || null); setFormCardImageFile(null);
    };
    const backToFormGrid = () => { setSelectedFormCardId(null); setFormCardImageFile(null); };
    const handleChooseFormCardImage = (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setFormCardImageFile(f); const r = new FileReader(); r.onload = ev => setFormCardImageUrl(ev.target.result); r.readAsDataURL(f);
    };

    const handleSaveFormCardImage = async () => {
        if (!selectedFormCardId || !formCardImageFile) return setAlert({ type: "error", message: "Belum memilih file gambar card." });
        try {
            setLoading(true); setAlert(null);
            const form = new FormData(); form.append("image", formCardImageFile);
            const res = await api.post(`/admin/internship/formations/cards/${selectedFormCardId}/image`, form, { headers: { "Content-Type": "multipart/form-data" } });
            const newUrl = res.data?.data?.image_url || null;
            setFormCards(prev => prev.map(c => c.id === selectedFormCardId ? { ...c, image_url: newUrl } : c));
            setFormCardImageUrl(newUrl); setFormCardImageFile(null);
            setAlert({ type: "success", message: "Gambar card formasi disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan gambar card formasi." }); }
        finally { setLoading(false); }
    };


    const [facSub, setFacSub] = useState("");
    const [facHead, setFacHead] = useState("");
    const [facItems, setFacItems] = useState([]);
    const [selectedFacIdx, setSelectedFacIdx] = useState(0);
    const [facText, setFacText] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/internship/facilities");
                const h = res.data?.data?.header ?? {};
                const items = (res.data?.data?.items ?? []).map(t => typeof t === "string" ? t : t?.text ?? "");
                setFacSub(h.subtitle ?? ""); setFacHead(h.headline ?? ""); setFacItems(items);
                setSelectedFacIdx(0); setFacText(items[0] ?? "");
            } catch { setAlert({ type: "error", message: "Gagal memuat Fasilitas." }); }
        })();
    }, []);

    const handleSaveFacilityHeader = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put("/admin/internship/facilities/header", { subtitle: facSub, headline: facHead });
            setAlert({ type: "success", message: "Header Fasilitas disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan header Fasilitas." }); }
        finally { setLoading(false); }
    };
    const handleSelectFacility = (idx) => { setSelectedFacIdx(idx); setFacText(facItems[idx] ?? ""); };
    const handleSaveFacilityItem = async () => {
        try {
            setLoading(true); setAlert(null);
            await api.put(`/admin/internship/facilities/items/${selectedFacIdx + 1}`, { text: facText });
            setFacItems(prev => { const n = [...prev]; n[selectedFacIdx] = facText; return n; });
            setAlert({ type: "success", message: "Fasilitas berhasil disimpan!" });
        } catch { setAlert({ type: "error", message: "Gagal menyimpan fasilitas." }); }
        finally { setLoading(false); }
    };


    return (
        <AdminLayout>
            <Container className="max-w-[1200px]">
                {alert && (
                    <div role="alert" className={`alert mb-6 ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            {alert.type === "success" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                        <span>{alert.message}</span>
                    </div>
                )}

                {/* LAYOUT 1 */}
                <h1 className="text-[24px] font-bold mb-5 text-blue-600">Layout 1 – Edit Text dan Gambar</h1>
                <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-gray-800 mb-2">Sub Judul</label>
                            <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Internship" />
                            <label className="block text-gray-800 mt-5 mb-2">Judul Utama</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={6} value={title} onChange={e => setTitle(e.target.value)} placeholder={"Temukan\nKesempatan, Bangun\nMasa Depan."} />
                            <Btn onClick={handleSaveHeroText} disabled={loading} className="mt-6"> {loading ? "Menyimpan..." : "Simpan"} </Btn>
                        </div>
                        <div>
                            <p className="text-gray-800 mb-3">Ganti Gambar</p>
                            <div className="w-full rounded-lg overflow-hidden border border-gray-200">
                                {imageUrl ? <img src={imageUrl} alt="Preview Hero" className="w-full h-[260px] object-cover" /> :
                                    <div className="w-full h-[260px] bg-gray-100 flex items-center justify-center text-gray-500">Belum ada gambar</div>}
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <label htmlFor="heroFile" className="inline-flex items-center justify-center h-[44px] px-5 rounded-lg bg-green-600 text-white font-semibold cursor-pointer hover:bg-green-700 transition">Choose File</label>
                                <input id="heroFile" ref={heroFileRef} type="file" accept="image/*" onChange={handleChooseHero} className="hidden" />
                                <div className="flex-1 h-[44px] rounded-lg border border-gray-300 px-3 flex items-center bg-white text-gray-700">{imageFile ? imageFile.name : "Belum pilih file"}</div>
                            </div>
                            <Btn onClick={handleSaveHeroImage} disabled={loading} className="mt-4">{loading ? "Menyimpan..." : "Simpan"}</Btn>
                        </div>
                    </div>
                </section>

                {/* LAYOUT 2 */}
                <h2 className="text-[24px] font-bold mb-5 text-blue-600">Layout 2 – Edit Text dan 9 Card</h2>
                <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-800 mb-2">Sub Judul</label>
                            <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                value={coreTitle} onChange={e => setCoreTitle(e.target.value)} placeholder="CORE VALUE PERUSAHAAN" />
                            <label className="block text-gray-800 mt-5 mb-2">Judul Utama</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3} value={coreHeadline} onChange={e => setCoreHeadline(e.target.value)} placeholder="Prinsip Utama yang Menjadi Dasar Tumbuh Bersama" />
                            <label className="block text-gray-800 mt-5 mb-2">Deskripsi</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={6} value={coreParagraph} onChange={e => setCoreParagraph(e.target.value)} placeholder="Sembilan nilai inti ini menjadi pedoman tim Seven INC...." />
                            <Btn onClick={handleSaveCoreHeader} disabled={loading} className="mt-6">{loading ? "Menyimpan..." : "Simpan"}</Btn>
                        </div>

                        <div>
                            {selectedCoreCard ? (
                                <Fragment>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Card: {selectedCoreCard.title}</h3>
                                    <label className="block text-gray-800 mb-2">Judul</label>
                                    <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                        value={coreCardTitle} onChange={e => setCoreCardTitle(e.target.value)} placeholder="Judul card" />
                                    <label className="block text-gray-800 mt-5 mb-2">Deskripsi</label>
                                    <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={5} value={coreCardDescription} onChange={e => setCoreCardDescription(e.target.value)} placeholder="Tuliskan deskripsi card..." />
                                    <p className="text-gray-800 mt-5 mb-2">Ganti Gambar</p>
                                    <div className="w-full rounded-lg overflow-hidden border border-gray-200 mb-3 flex items-center justify-center">
                                        {coreCardImageUrl ? <img src={coreCardImageUrl} alt="Preview Card" className="w-[160px] h-[120px] object-contain p-3" /> :
                                            <div className="w-[160px] h-[120px] bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="coreCardFile" className="inline-flex items-center justify-center h-[44px] px-5 rounded-lg bg-green-600 text-white font-semibold cursor-pointer hover:bg-green-700 transition">Choose File</label>
                                        <input id="coreCardFile" ref={coreCardFileRef} type="file" accept="image/*" onChange={handleChooseCoreCardImage} className="hidden" />
                                        <div className="flex-1 h-[44px] rounded-lg border border-gray-300 px-3 flex items-center bg-white text-gray-700">{coreCardImageFile ? coreCardImageFile.name : "Belum pilih file"}</div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                        <Btn onClick={handleSaveCoreCardImage} disabled={loading}> {loading ? "Menyimpan..." : "Simpan Gambar"} </Btn>
                                        <Btn onClick={backToCoreGrid} color="bg-gray-600 hover:bg-gray-700">Kembali ke 9 Card</Btn>
                                    </div>
                                </Fragment>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {coreCards.map(c => (
                                        <button key={c.id} onClick={() => openCoreCardEditor(c.id)}
                                            className="w-full rounded-xl border border-gray-200 hover:border-gray-300 bg-white p-5 text-center shadow-sm hover:shadow transition cursor-pointer">
                                            <div className="w-full flex items-center justify-center mb-3">
                                                {c.image_url ? <img src={c.image_url} alt={c.title} className="w-[72px] h-[72px] object-contain" /> :
                                                    <div className="w-[72px] h-[72px] bg-gray-100 flex items-center justify-center text-gray-500 rounded">No Img</div>}
                                            </div>
                                            <p className="font-semibold text-gray-900">{c.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* LAYOUT 3 */}
                <h2 className="text-[24px] font-bold mb-5 text-blue-600">Layout 3 – Edit Syarat & Ketentuan</h2>
                <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-gray-800 mb-2">Sub Judul</label>
                            <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                value={termsSubtitle} onChange={e => setTermsSubtitle(e.target.value)} placeholder="Syarat & Ketentuan" />
                            <label className="block text-gray-800 mt-5 mb-2">Judul Utama</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={4} value={termsHeadline} onChange={e => setTermsHeadline(e.target.value)} placeholder="Persiapkan Dirimu, Tumbuh Bersama Kami." />
                            <Btn onClick={handleSaveTermsHeader} disabled={loading} className="mt-6">{loading ? "Menyimpan..." : "Simpan"}</Btn>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-3">Daftar Syarat</p>
                            <div className="space-y-3 mb-6">
                                {terms.length === 0 ? <p className="text-gray-600">Belum ada data syarat.</p> :
                                    terms.map((t, idx) => (
                                        <label key={idx} className="flex items-start gap-3 cursor-pointer">
                                            <input type="radio" name="term" className="radio radio-primary mt-1"
                                                checked={selectedTermIdx === idx} onChange={() => handleSelectTerm(idx)} />
                                            <span className="text-gray-900 leading-relaxed"><span className="font-semibold mr-2">{idx + 1}.</span>{t}</span>
                                        </label>
                                    ))
                                }
                            </div>
                            <p className="text-gray-800 mb-2">Edit Syarat Terpilih</p>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={4} value={termText} onChange={e => setTermText(e.target.value)} placeholder="Tulis syarat…" />
                            <Btn onClick={handleSaveSelectedTerm} disabled={loading || terms.length === 0} className="mt-4">
                                {loading ? "Menyimpan..." : "Simpan Syarat"}
                            </Btn>
                        </div>
                    </div>
                </section>

                {/* LAYOUT 4 */}
                <h2 className="text-[24px] font-bold mb-5 text-blue-600">Layout 4 – Formasi Internship (18 Card)</h2>
                <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-7 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-800 mb-2">Sub Judul</label>
                            <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                value={formSub} onChange={e => setFormSub(e.target.value)} placeholder="FORMASI INTERNSHIP" />
                            <label className="block text-gray-800 mt-5 mb-2">Judul</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3} value={formHead} onChange={e => setFormHead(e.target.value)} placeholder="Bangun Kompetensi dan Karakter Bersama Seven INC." />
                            <label className="block text-gray-800 mt-5 mb-2">Deskripsi</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={6} value={formPara} onChange={e => setFormPara(e.target.value)} placeholder="Program magang dan internship di Seven INC. dirancang..." />
                            <Btn onClick={handleSaveFormationHeader} disabled={loading} className="mt-6">{loading ? "Menyimpan..." : "Simpan"}</Btn>
                        </div>

                        <div>
                            {selectedFormCard ? (
                                <Fragment>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Card: {selectedFormCard.title}</h3>
                                    <label className="block text-gray-800 mb-2">Judul Card</label>
                                    <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                        value={formCardTitle} onChange={e => setFormCardTitle(e.target.value)} placeholder="Judul card" />
                                    <p className="text-gray-800 mt-5 mb-2">Ganti Gambar</p>
                                    <div className="w-full rounded-lg overflow-hidden border border-gray-200 mb-3 flex items-center justify-center">
                                        {formCardImageUrl ? <img src={formCardImageUrl} alt="Preview Card" className="w-[160px] h-[120px] object-contain p-3" /> :
                                            <div className="w-[160px] h-[120px] bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="formCardFile" className="inline-flex items-center justify-center h-[44px] px-5 rounded-lg bg-green-600 text-white font-semibold cursor-pointer hover:bg-green-700 transition">Choose File</label>
                                        <input id="formCardFile" ref={formCardFileRef} type="file" accept="image/*" onChange={handleChooseFormCardImage} className="hidden" />
                                        <div className="flex-1 h-[44px] rounded-lg border border-gray-300 px-3 flex items-center bg-white text-gray-700">{formCardImageFile ? formCardImageFile.name : "Belum pilih file"}</div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                        <Btn onClick={handleSaveFormCardImage} disabled={loading}>{loading ? "Menyimpan..." : "Simpan Gambar"}</Btn>
                                        <Btn onClick={backToFormGrid} color="bg-gray-600 hover:bg-gray-700">Kembali ke 18 Card</Btn>
                                    </div>
                                </Fragment>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {formCards.map(c => (
                                        <button key={c.id} onClick={() => openFormCardEditor(c.id)}
                                            className="w-full rounded-xl border border-gray-200 hover:border-gray-300 bg-white p-5 text-center shadow-sm hover:shadow transition cursor-pointer">
                                            <div className="w-full flex items-center justify-center mb-3">
                                                {c.image_url ? <img src={c.image_url} alt={c.title} className="w-[72px] h-[72px] object-contain" /> :
                                                    <div className="w-[72px] h-[72px] bg-gray-100 flex items-center justify-center text-gray-500 rounded">No Img</div>}
                                            </div>
                                            <p className="font-semibold text-gray-900">{c.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* LAYOUT 5 */}
                <h2 className="text-[24px] font-bold mb-5 text-blue-600">Layout 5 – Edit Fasilitas</h2>
                <section className="bg-white rounded-xl border border-gray-200 p-6 md:p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-gray-800 mb-2">Sub Judul</label>
                            <input className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                value={facSub} onChange={e => setFacSub(e.target.value)} placeholder="FASILITAS YANG DIDAPAT" />
                            <label className="block text-gray-800 mt-5 mb-2">Judul Utama</label>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3} value={facHead} onChange={e => setFacHead(e.target.value)} placeholder="Karena Belajar Butuh Lingkungan yang Mendukung." />
                            <Btn onClick={handleSaveFacilityHeader} disabled={loading} className="mt-6">{loading ? "Menyimpan..." : "Simpan"}</Btn>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-3">Daftar Fasilitas</p>
                            <div className="space-y-3 mb-6">
                                {facItems.length === 0 ? <p className="text-gray-600">Belum ada data fasilitas.</p> :
                                    facItems.map((t, idx) => (
                                        <label key={idx} className="flex items-start gap-3 cursor-pointer">
                                            <input type="radio" name="facility" className="radio radio-primary mt-1"
                                                checked={selectedFacIdx === idx} onChange={() => setSelectedFacIdx(idx)} />
                                            <span className="text-gray-900 leading-relaxed"><span className="font-semibold mr-2">{idx + 1}.</span>{t}</span>
                                        </label>
                                    ))}
                            </div>
                            <p className="text-gray-800 mb-2">Edit Fasilitas Terpilih</p>
                            <textarea className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={4} value={facText} onChange={e => setFacText(e.target.value)} placeholder="Tulis fasilitas…" />
                            <Btn onClick={handleSaveFacilityItem} disabled={loading || facItems.length === 0} className="mt-4">
                                {loading ? "Menyimpan..." : "Simpan Fasilitas"}
                            </Btn>
                        </div>
                    </div>
                </section>

                {/* Section Drafts & Articles */}
                <SectionArticlesManager
                    targetPage="internship"
                    title="Daftar Artikel Section Internship"
                />
            </Container>
        </AdminLayout>
    );
}
