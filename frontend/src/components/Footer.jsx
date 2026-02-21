import { Link } from "react-router-dom";
import Container from "./Container";

const Footer = () => {
    // Fungsi saat click supaya konten dimulai dari atas
    const scrollTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    return (
        <footer className="bg-[#BDBDBD] text-white pb-3">
            <Container>
                {/* Bagian Atas: Logo dan Icon Sosmed */}
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <img
                        src="/assets/img/Logo.png"
                        alt="Seven Inc Logo"
                        className="h-12"
                    />

                    {/* Icon Sosmed */}
                    <div className="flex space-x-4 text-[35px]">
                        <i className="ri-linkedin-box-fill cursor-pointer"></i>
                        <i className="ri-instagram-line cursor-pointer"></i>
                        <i className="ri-facebook-circle-fill cursor-pointer"></i>
                        <i className="ri-twitter-x-fill cursor-pointer"></i>
                    </div>
                </div>

                {/* Garis Pembatas */}
                <div className="border-t-2 border-white opacity-40 mb-8"></div>

                {/* Bagian Tengah: 4 Kolom */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-white mb-8">
                    {/* Kantor Pusat */}
                    <div>
                        <h3 className="text-[30px] font-bold mb-3">Kantor Pusat</h3>
                        <p className="flex items-start space-x-2">
                            <i className="ri-map-pin-line text-[25px]"></i>
                            <span className="text-[16px]">
                                Jl. Raya Janti Gg. Harjuna No.59,
                                Jaranan, Karangjambe, Kec. Banguntapan, Kabupaten Bantul,
                                Daerah Istimewa Yogyakarta 55198
                            </span>
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-[30px] font-bold mb-3 ml-20">Links</h3>
                        <ul className="space-y-2 ml-20 text-[16px]">
                            <li>
                                <Link to="/" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link to="/tentang-kami" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link to="/bisnis-kami" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                    Bisnis Kami
                                </Link>
                            </li>
                            <li>
                                <Link to="/berita" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                    Berita
                                </Link>
                            </li>
                            <li>
                                <Link to="/kontak" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                    Kontak
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/login" onClick={scrollTop} className="hover:text-[#DC3933] cursor-pointer">
                                    Login Admin
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Bisnis Kami */}
                    <div>
                        <h3 className="text-[30px] font-bold mb-3 ml-6">Bisnis Kami</h3>
                        <ul className="space-y-2 ml-6 text-[16px]">
                            <li>
                                <Link
                                    to="/bisnis-kami#seven-tech"
                                    className="hover:text-[#DC3933]"
                                >
                                    Seven Tech
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/bisnis-kami#seven-style"
                                    className="hover:text-[#DC3933]"
                                >
                                    Seven Style
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/bisnis-kami#seven-serve"
                                    className="hover:text-[#DC3933]"
                                >
                                    Seven Serve
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/bisnis-kami#seven-edu"
                                    className="hover:text-[#DC3933]"
                                >
                                    Seven Edu
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Hubungi CS Kami */}
                    <div>
                        <h3 className="text-[30px] font-bold mb-3 ml-3">Hubungi CS Kami</h3>
                        <p className="flex items-center space-x-2 mb-4 ml-2">
                            <i className="ri-phone-line text-[25px]"></i>
                            <span className="text-[16px] px-2">089633040200</span>
                        </p>
                        <p className="flex items-center space-x-2 ml-2">
                            <i className="ri-mail-line text-[25px]"></i>
                            <span className="text-[16px] px-2">sevenincjogja@gmail.com</span>
                        </p>
                    </div>
                </div>

                {/* Garis Pembatas */}
                <div className="border-t-2 border-white opacity-40 mb-4"></div>

                {/* Bagian Bawah */}
                <div className="text-center text-[18px] mb-1">
                    <p className="text-center font-medium">
                        Copyright © {new Date().getFullYear()} Seven INC., All right reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
