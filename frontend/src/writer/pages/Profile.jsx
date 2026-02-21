import axios from "axios";
import { useState, useEffect } from "react";
import WriterLayout from "../layouts/WriterLayout";

const WriterProfile = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [file, setFile] = useState(null);

    const [usernameTouched, setUsernameTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [initialUsername, setInitialUsername] = useState("");

    useEffect(() => {
        const storedAdmin = localStorage.getItem("adminData");
        if (storedAdmin) {
            const admin = JSON.parse(storedAdmin);
            setUsername(admin.name || "");
            setEmail(admin.email || "");
            setInitialUsername(admin.name || "");
            setUsernameTouched(true);
            setEmailTouched(true);
        }
    }, []);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const usernameValid = username.trim().length >= 6;

    const getBorderClass = (touched, valid) => {
        if (!touched) return "border-gray-300";
        return valid ? "border-green-500" : "border-red-500";
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSave = async () => {
        const token = localStorage.getItem("adminToken");

        try {
            // Jika ada file yang dipilih → update avatar
            if (file) {
                const formData = new FormData();
                formData.append("avatar", file);

                const res = await axios.post(
                    "import.meta.env.VITE_API_URL/admin/update-avatar",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                const adminData = JSON.parse(localStorage.getItem("adminData"));
                adminData.avatar = res.data.avatar_url; // update avatar di localStorage
                localStorage.setItem("adminData", JSON.stringify(adminData));
            }

            // Jika nama diubah → update nama di backend
            if (username !== initialUsername) {
                await axios.post(
                    "import.meta.env.VITE_API_URL/admin/update-profile",
                    { name: username },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const adminData = JSON.parse(localStorage.getItem("adminData"));
                adminData.name = username; // update nama di localStorage
                localStorage.setItem("adminData", JSON.stringify(adminData));
            }

            alert("Profil berhasil diperbarui!");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Gagal mengubah profil");
        }
    };

    return (
        <WriterLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Profil Saya
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Kelola data diri dan foto profil Anda.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
                <div className="flex flex-col items-center w-full">
                    {/* Avatar */}
                    <div className="avatar mb-6">
                        <div className="w-24 h-24 rounded-full ring-4 ring-blue-100 ring-offset-2 ring-offset-white overflow-hidden">
                            <img
                                src={
                                    JSON.parse(localStorage.getItem("adminData"))?.avatar ||
                                    "https://ui-avatars.com/api/?name=" + (username || "Writer") + "&background=0D8ABC&color=fff"
                                }
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Form Wrapper */}
                    <div className="flex flex-col w-full gap-5">
                        {/* Input File */}
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Foto Profil</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="file-input file-input-bordered w-full bg-white text-gray-700"
                            />
                        </div>

                        {/* Input Nama Lengkap */}
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Nama Lengkap</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className={`input input-bordered w-full bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 ${getBorderClass(
                                        usernameTouched,
                                        usernameValid
                                    )}`}
                                    placeholder="Nama Lengkap"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => setUsernameTouched(true)}
                                />
                                {usernameTouched && usernameValid && (
                                    <span className="absolute right-3 top-3 text-green-500">
                                        <i className="ri-check-fill text-xl"></i>
                                    </span>
                                )}
                            </div>
                            {usernameTouched && !usernameValid && (
                                <label className="label">
                                    <span className="label-text-alt text-red-500">Nama harus memiliki minimal 6 karakter</span>
                                </label>
                            )}
                        </div>

                        {/* Input Email */}
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                                value={email}
                                disabled
                            />
                            <label className="label">
                                <span className="label-text-alt text-gray-400">Email tidak dapat diubah.</span>
                            </label>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-3 w-full mt-8 pt-6 border-t border-gray-100">
                        <button
                            className="btn btn-primary text-white w-full md:w-auto"
                            disabled={!(file || (usernameValid && username !== initialUsername))}
                            onClick={handleSave}
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </WriterLayout>
    );
};

export default WriterProfile;
