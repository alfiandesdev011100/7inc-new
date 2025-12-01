import { useState } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const KontakFull = () => {
    // Email
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [touched, setTouched] = useState(false);
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (touched) setEmailError(!validateEmail(e.target.value));
    };
    const handleBlur = () => {
        setTouched(true);
        setEmailError(!validateEmail(email));
    };

    // Phone
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState(false);
    const [phoneTouched, setPhoneTouched] = useState(false);
    const validatePhone = (value) => /^[0-9]{10,15}$/.test(value);
    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
        if (phoneTouched) setPhoneError(!validatePhone(e.target.value));
    };
    const handlePhoneBlur = () => {
        setPhoneTouched(true);
        setPhoneError(!validatePhone(phone));
    };

    // Subject dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");

    // Tambahan: Nama & Pesan (state + touched)
    const [name, setName] = useState("");
    const [nameTouched, setNameTouched] = useState(false);
    const [message, setMessage] = useState("");
    const [messageTouched, setMessageTouched] = useState(false);

    // Nomor WhatsApp tujuan
    const WA_TARGET = "6289529002944";

    const buildWhatsAppText = () => {
        const lines = [
            "*Form Kontak Seven INC*",
            `Nama: ${name}`,
            `Email: ${email}`,
            `No. Telp: ${phone}`,
            `Subjek: ${selectedValue}`,
            "",
            "Pesan:",
            message,
        ];
        return encodeURIComponent(lines.join("\n"));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Sentuh semua field supaya error state muncul kalau kosong/invalid
        setNameTouched(true);
        setTouched(true);
        setPhoneTouched(true);
        setMessageTouched(true);

        const isNameValid = name.trim().length > 0;
        const isEmailValid = validateEmail(email);
        const isPhoneValid = validatePhone(phone);
        const isSubjectValid = selectedValue.trim().length > 0;
        const isMessageValid = message.trim().length > 0;

        if (!isNameValid || !isEmailValid || !isPhoneValid || !isSubjectValid || !isMessageValid) {
            setEmailError(!isEmailValid);
            setPhoneError(!isPhoneValid);
            return;
        }

        const text = buildWhatsAppText();
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        // Deep link app & web link dengan prefilled text
        const urlApp = `whatsapp://send?phone=${WA_TARGET}&text=${text}`;
        const urlWeb = `https://api.whatsapp.com/send?phone=${WA_TARGET}&text=${text}`;

        // Buka sesuai perangkat (prefill akan muncul di kolom chat)
        window.open(isMobile ? urlApp : urlWeb, "_blank");
    };

    return (
        <Layout>
            <Container>
                {/* Bagian Judul */}
                <div className="mb-10 pt-[120px]">
                    <p className="text-[20px] font-normal tracking-[0.4em] uppercase text-gray-800">Kontak</p>
                    <h1 className="text-[64px] font-bold text-gray-800 leading-tight">Hubungi Kami</h1>
                </div>

                {/* Pembungkus Merah */}
                <div className="relative w-full h-[790px] mx-auto">
                    {/* Bagian Kanan (Info Kontak) */}
                    <div className="absolute right-0 top-0 bg-red-600 rounded-2xl w-[532px] h-[704px] pt-18 pb-10 pr-10 pl-[168px] flex flex-col justify-start text-white">
                        {/* Kantor Pusat */}
                        <div className="mb-8">
                            <h2 className="text-[30px] font-bold mb-3">Kantor Pusat</h2>
                            <p className="flex items-start gap-4 text-[16px] leading-relaxed">
                                <i className="ri-map-pin-line text-[25px]"></i>
                                Jl. Raya Janti Gg. Harjuna No.59, Jaranan, Karangjambe, Kec. Banguntapan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55198
                            </p>
                        </div>

                        {/* Hubungi CS Kami */}
                        <div className="mb-8">
                            <h2 className="text-[30px] font-bold mb-3">Hubungi CS Kami</h2>
                            <p className="text-[16px] mb-2 flex items-center gap-4">
                                <img src="/assets/img/vectorPhone.png" alt="phone" className="w-[25px] h-full" />
                                089653040200
                            </p>
                        </div>

                        {/* Email */}
                        <div className="mb-8">
                            <h2 className="text-[30px] font-bold mb-3">Email</h2>
                            <p className="text-[16px] mb-2 flex items-center gap-4">
                                <img src="/assets/img/vectorEmail.png" alt="email" className="w-[25px] h-full" />
                                sevenincjogja@gmail.com
                            </p>
                        </div>

                        {/* Follow Sosial Media */}
                        <div>
                            <h2 className="text-[30px] font-bold mb-3">Follow Sosial Media</h2>
                            <div className="flex gap-3">
                                <i className="ri-linkedin-box-fill text-white text-[35px]"></i>
                                <i className="ri-instagram-line text-white text-[35px]"></i>
                                <i className="ri-facebook-circle-line text-white text-[35px]"></i>
                                <i className="ri-twitter-x-line text-white text-[35px]"></i>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Kiri (Form) */}
                    <div
                        className="absolute top-0 left-0 bg-white p-8 rounded-l-2xl rounded-r-4xl shadow-md border border-gray-300"
                        style={{ width: "862px", height: "704px" }}
                    >
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                            {/* Nama Lengkap */}
                            <div className="flex flex-col pt-1">
                                <label className="font-bold text-[20px] mb-1 text-black">
                                    Nama Lengkap<span className="text-red-500"> *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: John Doe"
                                    className={`w-full text-black bg-white border rounded-lg px-4 py-3 focus:outline-none text-[16px] ${nameTouched && name.trim() === "" ? "border-red-500" : "border-gray-300"
                                        }`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => setNameTouched(true)}
                                    required
                                />
                                {nameTouched && name.trim() === "" && (
                                    <p className="text-red-500 text-sm mt-1">Nama wajib diisi.</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col pt-1">
                                <label className="font-bold text-[20px] mb-1 text-black">
                                    Email<span className="text-red-500"> *</span>
                                </label>
                                <div
                                    className={`w-full bg-white px-4 py-3 h-[51px] flex items-center rounded-lg border ${emailError ? "border-red-500" : touched && email !== "" ? "border-green-500" : "border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="email"
                                        placeholder="Contoh: johndoe@gmail.com"
                                        value={email}
                                        onChange={handleEmailChange}
                                        onBlur={handleBlur}
                                        className="w-full outline-none bg-transparent text-[16px] text-black"
                                        required
                                    />
                                </div>
                                {emailError && <p className="text-red-500 text-sm mt-1">Masukkan email yang valid</p>}
                            </div>

                            {/* Nomor Telepon */}
                            <div className="flex flex-col pt-4">
                                <label className="font-bold text-[20px] mb-1 text-black">
                                    Nomor Telepon<span className="text-red-500"> *</span>
                                </label>
                                <div
                                    className={`w-full bg-white px-4 py-3 h-[51px] flex items-center rounded-lg border ${phoneError ? "border-red-500" : phoneTouched && phone !== "" ? "border-green-500" : "border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="tel"
                                        placeholder="Contoh: 081234567891"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        onBlur={handlePhoneBlur}
                                        className="w-full outline-none bg-transparent text-[16px] text-black"
                                        required
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-red-500 text-sm mt-1">Masukkan nomor telepon yang valid (10-15 digit)</p>
                                )}
                            </div>

                            {/* Subjek */}
                            <div className="flex flex-col">
                                <label className="font-bold text-[20px] mb-1 text-black">
                                    Subjek<span className="text-red-500 font-bold text-[20px]"> *</span>
                                </label>

                                <div className="relative">
                                    {/* Tombol Dropdown */}
                                    <div
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="bg-white border border-gray-300 text-black text-[16px] rounded-lg px-4 py-3 h-[51px] flex justify-between items-center cursor-pointer"
                                    >
                                        <span>{selectedValue || "Pilih Objek"}</span>
                                        <i
                                            className={`ri-arrow-down-wide-line text-gray-700 text-[25px] transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0"
                                                }`}
                                        ></i>
                                    </div>

                                    {/* Isi Dropdown */}
                                    {isDropdownOpen && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-md">
                                            {["Kemitraan", "Layanan", "Karir", "Lainnya"].map((option) => (
                                                <li
                                                    key={option}
                                                    onClick={() => {
                                                        setSelectedValue(option);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`text-black px-4 py-2 cursor-pointer transition-all ${selectedValue === option ? "border-l-4 border-[#D43026] bg-gray-50" : "pl-4"
                                                        } hover:bg-[#D43026] hover:text-white`}
                                                >
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {selectedValue.trim() === "" && (
                                    <p className="text-gray-400 text-xs mt-1">Pilih salah satu subjek.</p>
                                )}
                            </div>

                            {/* Pesan Anda */}
                            <div className="col-span-1 md:col-span-2 pt-4">
                                <label className="font-bold text-[20px] mb-1 text-black">
                                    Pesan Anda<span className="text-red-500"> *</span>
                                </label>
                                <textarea
                                    placeholder="Pesan Anda"
                                    className={`w-full h-40 bg-white border px-4 py-3 rounded-lg focus:outline-none text-[16px] text-black ${messageTouched && message.trim() === "" ? "border-red-500" : "border-gray-300"
                                        }`}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onBlur={() => setMessageTouched(true)}
                                    required
                                />
                                {messageTouched && message.trim() === "" && (
                                    <p className="text-red-500 text-sm mt-1">Pesan wajib diisi.</p>
                                )}
                            </div>

                            {/* Tombol */}
                            <div className="col-span-1 md:col-span-2 flex justify-center pt-12">
                                <button
                                    onClick={handleSubmit}
                                    className="relative overflow-hidden group bg-white border border-gray-200 rounded-full px-6 py-4 text-[20px] transition-all w-[550px] text-black cursor-pointer"
                                >
                                    {/* Layer merah sliding dari kiri */}
                                    <span className="absolute inset-0 bg-[#D43026] rounded-full translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
                                    {/* Isi tombol */}
                                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                        Kirim Pesan
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
            {/* Maps */}
            <div className="mt-[15px] w-full flex justify-center">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d494.1243780736823!2d110.40937613622742!3d-7.7903502705397845!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1753938097574!5m2!1sen!2sid"
                    width="100%"
                    height="410"
                    style={{ border: 0, maxWidth: "1440px" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            <Footer />
        </Layout>
    );
};

export default KontakFull;