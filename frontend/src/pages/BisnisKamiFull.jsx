import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const BisnisKamiFull = () => {
    const location = useLocation();

    // Smooth scroll ke anchor saat hash berubah
    useEffect(() => {
        if (location.hash) {
            const el = document.getElementById(location.hash.slice(1));
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [location.hash]);

    return (
        <Layout>
            <div className=" bg-white text-gray-800 font-poppins">
                {/* Header Gambar + Teks di Tengah */}
                <div className="relative w-full h-[508px]">
                    <img
                        src="/assets/img/Banner2.png"
                        alt="Header Bisnis Kami"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                        <h2 className="uppercase tracking-[0.4em] text-[20px] mb-3 text-black">
                            Lini Bisnis Kami
                        </h2>
                        <h1 className="text-[40px] font-bold text-black">
                            Satu Visi, Banyak Solusi
                        </h1>
                    </div>
                </div>

                {/* Deskripsi Umum */}
                <Container>
                    <div className="mt-[59px] px-4 text-center">
                        <p className="text-gray-700 text-[16px] leading-relaxed">
                            Sebagai perusahaan holding multisektor, Seven INC. menaungi beragam
                            unit usaha strategis yang bergerak di bidang teknologi, fashion &
                            tekstil, jasa layanan, serta edukasi dan pelatihan. Setiap sektor
                            dikelola secara profesional untuk menghadirkan solusi nyata dan
                            berdaya saing tinggi, sejalan dengan visi perusahaan dalam membangun
                            ekosistem bisnis yang berdampak, berkelanjutan, dan adaptif terhadap
                            perkembangan zaman.
                        </p>
                    </div>
                </Container>

                {/* Section 1 - Seven Tech */}
                <Container>
                    <div
                        id="seven-tech"
                        className="scroll-mt-[110px] flex flex-col md:flex-row items-center gap-20 mt-[59px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">Seven Tech</h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                Seven Tech merupakan sebuah sektor teknologi dari Seven INC. yang
                                berfokus pada penyediaan solusi digital komprehensif untuk
                                mendukung pertumbuhan bisnis di era modern. Melalui pengembangan
                                teknologi berbasis web dan mobile, layanan desain visual
                                profesional, hingga konsultasi digital, Seven Tech hadir sebagai
                                katalis transformasi digital bagi berbagai sektor usaha.<br /> Dengan
                                pendekatan inovatif dan berorientasi pada hasil, sektor ini
                                mengintegrasikan strategi bisnis dengan pemanfaatan teknologi untuk
                                menciptakan sistem kerja yang lebih efisien, terukur, dan berdaya
                                saing tinggi. Seven Tech juga berperan penting dalam mendorong
                                percepatan adaptasi digital UMKM maupun perusahaan skala menengah
                                melalui penerapan platform digital yang ramah pengguna dan
                                berkelanjutan.
                            </p>
                        </div>
                        <img
                            src="/assets/img/Perusahaan.png"
                            alt="Seven Tech"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>

                {/* Section 2 - Seven Style */}
                <Container>
                    <div
                        id="seven-style"
                        className="scroll-mt-[110px] flex flex-col md:flex-row-reverse items-center gap-20 mt-[59px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">Seven Style</h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                Seven Style merupakan sektor bisnis Seven INC. yang bergerak di
                                bidang fashion dan tekstil, dengan dedikasi tinggi terhadap
                                pengembangan produk lokal yang berkualitas dan bernilai budaya.
                                Unit usaha di bawah Seven Style antara lain Crows Denim,
                                Alphawear, Grenade, TailorJogja.com, dan Rumah Konveksi
                                masing-masing membawa identitas dan spesialisasi dalam dunia
                                busana pria premium, fashion kasual lokal, hingga produksi tekstil
                                konveksi.<br /> Seven Style tidak sekadar memproduksi pakaian, tetapi juga
                                membangun narasi budaya dalam setiap desainnya. Dengan menonjolkan
                                elemen lokal dan menggabungkan pendekatan desain modern, sektor
                                ini mampu menciptakan produk yang relevan di pasar domestik maupun
                                internasional. Proses produksinya mengedepankan kualitas
                                pengerjaan manual (handmade), pemilihan bahan yang teliti, serta
                                kolaborasi erat dengan pelaku industri kreatif. Selain itu,
                                melalui platform online dan sistem distribusi terintegrasi, Seven
                                Style turut mendorong efisiensi dalam rantai pasok dan memperluas
                                akses pasar bagi brand lokal.
                            </p>
                        </div>
                        <img
                            src="/assets/img/cardPakaian.png"
                            alt="Seven Style"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>

                {/* Section 3 - Seven Serve */}
                <Container>
                    <div
                        id="seven-serve"
                        className="scroll-mt-[110px] flex flex-col md:flex-row items-center gap-18 mt-[59px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">Seven Serve</h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                Seven Serve merupakan sektor layanan dari Seven INC. yang menaungi
                                berbagai jenis usaha berbasis jasa, mulai dari layanan rumah
                                tangga, kebutuhan teknis lapangan, hingga jasa pendukung acara dan
                                operasional bisnis. Dengan cakupan yang luas dan beragam, sektor
                                ini dirancang untuk memberikan kemudahan, kecepatan, dan kualitas
                                pelayanan yang sesuai dengan kebutuhan masyarakat urban dan dunia
                                industri.<br /> Setiap unit dalam sektor ini dikelola dengan standar
                                profesionalisme tinggi dan didukung oleh sistem kerja yang
                                efisien, sehingga mampu menjawab kebutuhan klien secara tepat
                                waktu dan berkualitas. Seven Serve juga menjadi pendorong
                                terciptanya ekosistem jasa yang memberdayakan tenaga kerja lokal,
                                membuka lapangan kerja baru, serta meningkatkan akses masyarakat
                                terhadap layanan yang terjangkau dan terpercaya.
                            </p>
                        </div>
                        <img
                            src="/assets/img/Keuntungan.png"
                            alt="Seven Serve"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>

                {/* Section 4 - Seven Edu */}
                <Container>
                    <div
                        id="seven-edu"
                        className="scroll-mt-[110px] flex flex-col md:flex-row-reverse items-center gap-17 mt-[59px] mb-[60px]"
                    >
                        <div className="flex-1 text-justify">
                            <h3 className="text-[32px] font-bold mb-3">Seven Edu</h3>
                            <p className="text-gray-700 leading-relaxed mb-3 text-[16px]">
                                Seven Edu merupakan sektor pendidikan dan pelatihan dari Seven
                                INC. yang dirancang untuk menciptakan sumber daya manusia yang
                                kompeten, siap kerja, dan berintegritas. Sektor ini
                                menyelenggarakan program magang, pelatihan kerja, bimbingan
                                belajar, serta workshop pengembangan diri yang menyasar pelajar,
                                mahasiswa, dan masyarakat umum.<br /> Dengan pendekatan berbasis praktik
                                langsung di lingkungan kerja nyata, Seven Edu tidak hanya
                                membekali peserta dengan keterampilan teknis, tetapi juga
                                menanamkan nilai-nilai profesionalisme, tanggung jawab, dan
                                kolaborasi. Program pelatihan disusun untuk menjawab kebutuhan
                                dunia industri, serta memberikan pengalaman berharga yang
                                memperkuat kesiapan peserta dalam memasuki dunia kerja.
                            </p>
                        </div>
                        <img
                            src="/assets/img/School.png"
                            alt="Seven Edu"
                            className="w-[480px] h-[320px] object-cover"
                        />
                    </div>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default BisnisKamiFull;
