import axios from "axios";
import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";

const Profil = () => {
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
        <AdminLayout>
            <div className="flex flex-col items-center w-full mx-auto pt-[120px] pb-[100px] border-2 border-gray-200 rounded-lg">
                {/* Avatar */}
                <div className="avatar">
                    <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2 mb-[27px]">
                        <img
                            src={
                                JSON.parse(localStorage.getItem("adminData"))?.avatar ||
                                "https://img.daisyui.com/images/profile/demo/spiderperson@192.webp"
                            }
                            alt="avatar"
                        />
                    </div>
                </div>

                {/* Form Wrapper */}
                <div className="flex flex-col w-full gap-4 max-w-md">
                    {/* Input File */}
                    <div>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="file-input w-full bg-white border border-gray-300 text-gray-700"
                        />
                    </div>

                    {/* Input Nama Lengkap */}
                    <div>
                        <label className="block mb-1 font-semibold text-black">
                            Nama Lengkap
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full px-3 py-2 pr-10 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${getBorderClass(
                                    usernameTouched,
                                    usernameValid
                                )}`}
                                placeholder="Nama Lengkap"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onBlur={() => setUsernameTouched(true)}
                            />
                            {usernameTouched && usernameValid && (
                                <span className="absolute right-3 top-2.5">
                                    <span className="w-5 h-5 flex items-center justify-center rounded bg-green-500 text-white text-xs">
                                        <i className="ri-check-fill"></i>
                                    </span>
                                </span>
                            )}
                        </div>
                        {usernameTouched && !usernameValid && (
                            <p className="text-sm mt-1 text-red-500">
                                Nama harus memiliki minimal 6 karakter
                            </p>
                        )}
                    </div>

                    {/* Input Email */}
                    <div>
                        <label className="block mb-1 font-semibold text-black">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                className={`w-full px-3 py-2 pr-10 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${getBorderClass(
                                    emailTouched,
                                    emailValid
                                )}`}
                                placeholder="mail@site.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                            />
                            {emailTouched && emailValid && (
                                <span className="absolute right-3 top-2.5">
                                    <span className="w-5 h-5 flex items-center justify-center rounded bg-green-500 text-white text-xs">
                                        <i className="ri-check-fill"></i>
                                    </span>
                                </span>
                            )}
                        </div>
                        {emailTouched && !emailValid && (
                            <p className="text-sm mt-1 text-red-500">
                                Format email tidak valid
                            </p>
                        )}
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-center gap-4 mt-6">
                    <button className="btn btn-outline btn-error">Cancel</button>
                    <button
                        className="btn btn-neutral btn-outline"
                        disabled={
                            !(file || (usernameValid && username !== initialUsername))
                        }
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Profil;
