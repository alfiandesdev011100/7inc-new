import { useState } from "react";
import Container from "./Container";

const Kontak = () => {
    // Nama
    const [name, setName] = useState("");
    const [nameTouched, setNameTouched] = useState(false);

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

    // Kontak (telp user)
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

    // Subjek
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");

    // Pesan
    const [message, setMessage] = useState("");
    const [messageTouched, setMessageTouched] = useState(false);

    // Tujuan WhatsApp
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

        // Deteksi perangkat: app (mobile) vs web (desktop)
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        // Deep link app & web link dengan prefilled text
        const urlApp = `whatsapp://send?phone=${WA_TARGET}&text=${text}`;
        const urlWeb = `https://api.whatsapp.com/send?phone=${WA_TARGET}&text=${text}`;

        // Buka sesuai perangkat (prefill akan muncul di kolom chat)
        window.open(isMobile ? urlApp : urlWeb, "_blank");
    };

    return (
        <section className="bg-white mb-[60px] mt-[81px]">
            <Container>
                <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                    {/* Kiri: Info Kontak */}
                    <div className="md:w-1/2">
                        <h3
                            className="text-[20px] tracking-[0.4em] uppercase font-normal text-black mb-3"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-once="true"
                        >
                            Kontak
                        </h3>
                        <h2
                            className="text-[32px] font-bold text-black mb-6"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-once="true"
                        >
                            Hubungi Kami
                        </h2>
                        <p
                            className="text-[16px] leading-relaxed text-black text-justify"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-once="true"
                        >
                            Jangan ragu menghubungi Seven INC. untuk menjalin kemitraan dan kesempatan berkembang bersama.
                        </p>
                    </div>

                    {/* Kanan: Form Kontak */}
                    <div
                        className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-once="true"
                        data-aos-delay="300"
                    >
                        {/* Nama Lengkap */}
                        <div className="flex flex-col">
                            <label className="font-bold text-[20px] mb-1 text-black">
                                Nama Lengkap
                                <span className="text-red-500 font-bold text-[20px]"> *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: John Doe"
                                className={`w-full bg-white text-black border rounded-lg px-4 py-3 focus:outline-none text-[16px] ${nameTouched && name.trim() === "" ? "border-red-500" : "border-gray-300"
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
                        <div className="flex flex-col">
                            <label className="font-bold text-[20px] mb-1 text-black">
                                Email
                                <span className="text-red-500 font-bold text-[20px]"> *</span>
                            </label>
                            <div
                                className={`w-full bg-white text-black px-4 py-3 h-[51px] flex items-center rounded-lg ${emailError
                                        ? "border border-red-500"
                                        : touched && email !== ""
                                            ? "border border-green-500"
                                            : "border border-gray-300"
                                    }`}
                            >
                                <input
                                    type="email"
                                    placeholder="contoh : JohnDoe@gmail.com"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={handleBlur}
                                    className="w-full outline-none bg-white text-black border-none text-[16px]"
                                />
                            </div>
                            {emailError && (
                                <p className="text-red-500 text-sm mt-1">Enter valid email address</p>
                            )}
                        </div>

                        {/* Nomor Telepon */}
                        <div className="flex flex-col">
                            <label className="font-bold text-[20px] mb-1 text-black">
                                Nomor Telepon
                                <span className="text-red-500 font-bold text-[20px]"> *</span>
                            </label>
                            <div
                                className={`w-full bg-white text-black px-4 py-3 h-[51px] flex items-center rounded-lg ${phoneError
                                        ? "border border-red-500"
                                        : phoneTouched && phone !== ""
                                            ? "border border-green-500"
                                            : "border border-gray-300"
                                    }`}
                            >
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onBlur={handlePhoneBlur}
                                    placeholder="Contoh: 081234567891"
                                    className="tabular-nums bg-white text-black w-full outline-none text-[16px]"
                                    required
                                />
                            </div>
                            {phoneError && (
                                <p className="text-red-500 text-sm mt-1">Must be 10-15 digits</p>
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
                                                className={`text-black px-4 py-2 cursor-pointer transition-all ${selectedValue === option
                                                        ? "border-l-4 border-[#D43026] bg-gray-50"
                                                        : "pl-4"
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
                        <div className="col-span-1 md:col-span-2">
                            <label className="block font-bold text-[20px] mb-1 text-black">
                                Pesan Anda
                                <span className="text-red-500 font-bold text-[20px]"> *</span>
                            </label>
                            <textarea
                                placeholder="Pesan Anda"
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onBlur={() => setMessageTouched(true)}
                                className={`w-full h-40 bg-white text-black border px-4 py-3 rounded-lg focus:outline-none text-[16px] ${messageTouched && message.trim() === ""
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                            />
                            {messageTouched && message.trim() === "" && (
                                <p className="text-red-500 text-sm mt-1">Pesan wajib diisi.</p>
                            )}
                        </div>

                        {/* Kirim Pesan */}
                        <div className="col-span-1 md:col-span-2 flex justify-center">
                            <button
                                onClick={handleSubmit}
                                className="relative overflow-hidden group btn btn-outline bg-white text-black rounded-4xl font-medium tracking-[0.05em] text-[20px] px-6 py-6 border border-gray-200 transition-all duration-200 shadow-none w-[550px]"
                            >
                                <span className="absolute inset-0 bg-[#D43026] rounded-4xl translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
                                <span className="relative z-10 group-hover:text-white transition duration-300">
                                    Kirim Pesan
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default Kontak;
