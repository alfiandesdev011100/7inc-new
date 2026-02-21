import { useState, useEffect } from 'react';
import Container from './Container';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BisnisKami = () => {
    const [headerSubtitle, setHeaderSubtitle] = useState('');
    const [headerTitle, setHeaderTitle] = useState('');

    useEffect(() => {
        // Fetch data dari API untuk Lini Bisnis Kami dan Satu Visi, Banyak Solusi
        const fetchData = async () => {
            try {
                const response = await axios.get('import.meta.env.VITE_API_URL/bisnis-kami-full');
                const data = response.data;
                setHeaderSubtitle(data.header_subtitle || 'Lini Bisnis Kami');
                setHeaderTitle(data.header_title || 'Satu Visi, Banyak Solusi');
            } catch (error) {
                console.error('Gagal mengambil data:', error);
            }
        };

        fetchData();
    }, []);

    const businessLines = [
        {
            name: "Seven Tech",
            image: "/assets/img/card.png",
            dad: "100",
            description:
                "Seven Tech menaungi lini usaha di bidang teknologi digital, pengembangan website, desain digital, serta layanan konsultasi bisnis berbasis platform.",
        },
        {
            name: "Seven Style",
            image: "/assets/img/card.png",
            dad: "300",
            description:
                "Seven Style berfokus pada industri Fashion dan tekstil, menaungi brand clothing lokal berkualitas seperti Crows Denim, Alphawear, Grenade, hingga Tailor Jogja.com.",
        },
        {
            name: "Seven Serve",
            image: "/assets/img/card.png",
            dad: "500",
            description:
                "Seven Serve menjadi payung usaha untuk berbagi layanan jasa yang mendukung kebutuhan masyarakat modern dari jasa kebersihan Rumah dan lain-lain.",
        },
        {
            name: "Seven Edu",
            image: "/assets/img/card.png",
            dad: "700",
            description:
                "Seven Edu menjadi payung usaha untuk berbagi layanan jasa yang mendukung kebutuhan masyarakat modern dari jasa kebersihan Rumah dan lain-lain.",
        },
    ];

    // mapping anchor yang eksplisit biar aman
    const anchorMap = {
        "Seven Tech": "seven-tech",
        "Seven Style": "seven-style",
        "Seven Serve": "seven-serve",
        "Seven Edu": "seven-edu",
    };

    return (
        <section className="w-full bg-white mt-[85px]">
            <Container>
                {/* Heading Section */}
                <div className="text-center mb-6">
                    <p
                        className="text-[20px] tracking-[0.4em] font-normal uppercase text-black mb-4"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-once="true"
                    >
                        {headerSubtitle}
                    </p>
                    <h2
                        className="text-[20px] md:text-[32px] font-bold text-gray-900"
                        data-aos="fade-up"
                        data-aos-duration="1000"
                        data-aos-once="true"
                    >
                        {headerTitle}
                    </h2>
                </div>

                {/* Card Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                    {businessLines.map((item, index) => (
                        <div
                            key={index}
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay={item.dad}
                            data-aos-once="true"
                            className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-[0_1px_6px_rgba(0,0,0,0.05)] w-[296px] h-[369px] flex items-center justify-center text-center mx-auto cursor-pointer transition duration-300"
                        >
                            {/* Gambar yang membesar saat hover */}
                            <img
                                src={item.image}
                                alt={item.name}
                                className={`absolute ${item.name === "Seven Tech" ? "top-[51%]" : "top-1/2"} left-1/2 -translate-x-1/2 -translate-y-1/2 w-[145px] h-[145px] object-contain transition-all duration-500 ease-in-out group-hover:scale-[2] group-hover:opacity-10`}
                            />

                            {/* Konten utama */}
                            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-left">
                                {/* Judul */}
                                <p
                                    className={`text-[20px] font-bold text-gray-800 mt-115 transition-all duration-500 ease-in-out group-hover:mt-[-10px] ${item.name === "Seven Tech" ? "relative top-[-10px]" : ""
                                        }`}
                                >
                                    {item.name}
                                </p>

                                {/* Deskripsi + tombol muncul saat hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 mt-4 text-[18px] text-gray-700 leading-relaxed text-justify pointer-events-none group-hover:pointer-events-auto">
                                    <p className="font-normal mb-4">{item.description}</p>

                                    {/* Link ke halaman full + anchor */}
                                    <Link
                                        to={`/admin/bisnis-kami#${anchorMap[item.name]}`}
                                        className={`flex items-center gap-1 font-bold text-red-600 hover:text-black transition duration-300 ${item.name === "Seven Tech" ? "relative top-[20px]" : ""
                                            }`}
                                    >
                                        Baca Selengkapnya
                                        <i className="ri-arrow-right-s-line text-[18px]"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Banner Section */}
            <Container>
                <div
                    className="relative h-[380px] py-5"
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    data-aos-once="true"
                >
                    {/* Banner Box */}
                    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                        {/* Layer merah kiri */}
                        <div className="absolute top-0 left-0 h-full w-[810px] bg-[#D43026] z-0" />

                        {/* Chevron Arrows */}
                        <img
                            src="/assets/img/Chevron.png"
                            alt="Chevron Arrows"
                            className="absolute right-0 top-0 translate-x-[40px] w-[670px] h-full object-cover z-10"
                            draggable={false}
                            data-aos="fade-left"
                            data-aos-duration="1000"
                            data-aos-once="true"
                        />

                        {/* Text + Button */}
                        <div className="absolute top-1/2 left-[100px] -translate-y-1/2 z-20 text-white">
                            <p
                                className="uppercase tracking-[0.4em] text-[20px] font-medium mb-4"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-once="true"
                            >
                                Bergabunglah Sekarang
                            </p>
                            <h2
                                className="text-white font-bold text-[20px] md:text-[32px] mb-6"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-once="true"
                            >
                                Kesempatan Berkembang<br />
                                Bersama Seven INC.
                            </h2>

                            <button
                                className="relative overflow-hidden group rounded-4xl font-medium tracking-[0.05em] text-[20px] w-[220px] h-[60px] bg-white text-black transition-all duration-300 cursor-pointer border border-transparent"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-once="true"
                            >
                                <span className="absolute inset-0 bg-[#D43026] rounded-4xl translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-400 ease-in-out z-0" />
                                <span className="relative z-10 flex items-center justify-center h-full w-full group-hover:text-white transition-colors duration-300">
                                    Daftar Sekarang
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Gambar Orang */}
                    <img
                        src="/assets/img/Hero2.png"
                        alt="Business Person"
                        className="absolute right-[49px] bottom-10 w-[440px] z-20"
                        draggable={false}
                        data-aos="fade-left"
                        data-aos-duration="1000"
                        data-aos-once="true"
                    />
                </div>
            </Container>
        </section>
    );
};

export default BisnisKami;
