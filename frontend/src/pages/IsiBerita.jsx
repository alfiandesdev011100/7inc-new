import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import Container from "../components/Container";

const IsiBerita = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Selalu mulai dari atas saat halaman ini dibuka
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    const pageState = location.state?.page || 1;

    return (
        <Layout>
            <div className="bg-white text-gray-800 pt-[100px]">
                <Container>
                    <h1 className="text-gray-900 font-bold leading-snug text-[31px] max-w-[1280px]">
                        Integritas dan Disiplin, Dua Pilar Penting Pembentukan SDM Berkualitas di Seven INC.
                    </h1>

                    <p
                        className="text-red-500 mt-[30px]"
                        style={{ width: "112px", height: "30px", fontSize: "16px" }}
                    >
                        28 Jul 2025
                    </p>

                    <div className="flex justify-center mt-[57px]">
                        <img
                            src="/assets/img/news.png"
                            alt="Card Berita"
                            style={{ width: "998px", height: "539px" }}
                            className="object-cover"
                        />
                    </div>

                    <div
                        className="mt-[50px] leading-relaxed text-justify mx-auto"
                        style={{ maxWidth: "1262px" }}
                    >
                        <p className="text-[15.5px] mb-[12px]">
                            <span className="font-semibold text-gray-900 text-[20px]">Jakarta (LoremPost)</span>{" "}
                            — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer finibus ligula non
                            felis tincidunt, et hendrerit nunc convallis. Quisque ut placerat elit. Menurut
                            pengamat tipografi, penggunaan struktur teks seperti ini sangat membantu dalam mengisi
                            ruang visual tanpa gangguan makna. "Donec accumsan sagittis tincidunt. Nullam ante
                            arcu, auctor eget vulputate eu, cursus id leo,” ujarnya saat ditemui di sela kegiatan
                            pameran desain. Ia menambahkan bahwa kenyamanan dalam membaca menjadi perhatian
                            penting. In sollicitudin pretium erat porttitor suscipit. Sed volutpat sem sit amet
                            sem cursus tincidunt. Ut urna magna, ornare in consectetur at, congue vel risus,"
                            tambahnya.
                        </p>
                    </div>

                    <p className="text-[15.5px] max-w-[1262px] mx-auto">
                        Baca juga:{" "}
                        <span className="font-semibold text-gray-900 italic">
                            Lorem Ipsum Diumumkan Sebagai Standar Tipografi Global
                        </span>
                    </p>

                    <div className="text-[20px] leading-relaxed text-justify mx-auto max-w-[1262px]">
                        <div className="mt-[12px]">
                            <p className="font-semibold text-gray-900">Kondisi Terkini dan Tanggapan Peserta</p>
                            <p className="text-[15.5px]">
                                Interdum et malesuada fames ac ante ipsum primis in faucibus. Etiam turpis metus,
                                dictum ut nisi non, pellentesque porta purus. Proin eget posuere leo. Nam aliquet
                                finibus ante vitae viverra. Integer pretium mauris non metus pulvinar aliquet. Nam
                                sit amet iaculis metus. Vivamus non lorem odio. Nam ornare interdum arcu, et
                                sagittis purus placerat et. "Struktur teks ini memberikan kenyamanan saat mendesain
                                layout cetak maupun digital," ungkap seorang desainer editorial. Donec blandit
                                gravida quam, non fermentum nisi rutrum in. Proin cursus dignissim magna, quis
                                mollis odio congue ac. Etiam porta justo nec mauris tristique, euismod auctor ante
                                sagittis. Cras quis ligula id est faucibus tincidunt in at dolor.
                            </p>
                        </div>

                        <div className="mt-[12px]">
                            <p className="font-semibold text-gray-900">
                                Perspektif Editorial dan Analisis Format
                            </p>
                            <p className="text-[15.5px]">
                                Ut metus diam, varius a leo eget, ultricies accumsan ligula. Maecenas tempor
                                fermentum lobortis. Nam fermentum tortor non neque congue tempus. Mauris feugiat leo
                                eros, eu tincidunt libero consequat a. Ut aliquam nisi leo, sit amet mollis nibh
                                aliquam non. "Kelebihan utama dari lorem ipsum adalah ke-netralan kata yang tidak
                                memiliki makna sebenarnya," ujar editor tipografi. Cras consequat libero sed mollis
                                elementum. Mauris elementum massa leo, non ultrices risus efficitur nec.
                            </p>
                        </div>

                        <div className="mt-[12px]">
                            <p className="font-semibold text-gray-900">Respons Positif dan Dukungan Teknis</p>
                            <p className="text-[15.5px]">
                                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia
                                curae; Praesent fermentum arcu ac porttitor imperdiet. Nulla blandit tortor quis
                                iaculis commodo. Quisque rutrum massa risus, ac pellentesque massa auctor eu. Nunc
                                dictum pellentesque nibh. Curabitur at quam nisl. Aliquam erat volutpat. "Saya
                                menggunakan Lorem Ipsum hampir setiap hari untuk mendemokan desain halaman," kata
                                salah satu peserta konferensi desain. Vestibulum non bibendum nunc. Proin sagittis
                                sed risus iaculis eleifend. Etiam hendrerit elit et magna feugiat facilisis.
                            </p>
                        </div>

                        <div className="mt-[12px]">
                            <p className="font-semibold text-gray-900">Penutupan Acara dan Rencana Lanjutan</p>
                            <p className="text-[15.5px]">
                                Sed placerat, sapien et fermentum finibus, nibh tellus feugiat odio, ac semper eros
                                dui non odio. Donec dui dui, varius in neque quis, congue sollicitudin dui.
                                Phasellus gravida neque eget leo aliquet, sed sagittis tortor feugiat. Interdum et
                                malesuada fames ac ante ipsum primis in faucibus. Sed purus orci, ornare at dui at,
                                feugiat placerat magna. Pellentesque pulvinar maximus pulvinar. "Penggunaan teks
                                dummy seperti ini sudah menjadi bagian dari tradisi desain modern," tutup
                                penyelenggara acara. Sed faucibus, sem sed fringilla feugiat, metus ligula imperdiet
                                massa, eget tincidunt nibh ipsum in augue. Donec fringilla orci eget dolor pulvinar
                                maximus. Sed lacinia eros eu ante fringilla, ut molestie orci porttitor. Quisque
                                magna diam, semper at tempus ac, faucibus ut lectus. Quisque sem leo, dignissim vel
                                mi in, rutrum rhoncus ipsum. Suspendisse a turpis dictum, vehicula enim quis,
                                condimentum lectus. Pellentesque accumsan non magna vel sagittis.
                            </p>
                        </div>

                        <div className="mt-[44px] mb-[44px]">
                            <button
                                onClick={() => {
                                    navigate("/berita", { state: { page: pageState } });
                                    window.scrollTo({ top: 0, left: 0, behavior: "auto" }); // mulai dari atas
                                }}
                                className="flex items-center gap-2 text-red-500 cursor-pointer text-[16px] font-medium group"
                                style={{ width: "246px", height: "63px" }}
                            >
                                <i className="ri-arrow-left-long-line text-[20px] transition-colors duration-300 group-hover:text-black"></i>
                                <span className="transition-colors duration-300 group-hover:text-black group-hover:underline">
                                    Kembali ke Berita
                                </span>
                            </button>
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
        </Layout>
    );
};

export default IsiBerita;
