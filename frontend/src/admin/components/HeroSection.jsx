// src/admin/components/HeroSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Container from "./Container";

const API_BASE = "import.meta.env.VITE_API_URL";
const CACHE_KEY = "hero_published_cache_v1";

const HeroSection = () => {
    // default fallback (agar tidak berkedip)
    const [heading, setHeading] = useState("Menaungi Inovasi,\nMerajut Masa Depan");
    const [subheading, setSubheading] = useState(
        "Holding Multisektor Teknologi, Fashion, Edukasi & Jasa"
    );
    const [bgUrl, setBgUrl] = useState("/assets/img/Hero.jpg");

    useEffect(() => {
        // 1) Render dari cache (kalau ada) supaya anti-kedip
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const j = JSON.parse(cached);
                if (j?.heading) setHeading(j.heading);
                if (j?.subheading !== undefined) setSubheading(j.subheading || "");
                if (j?.image_url) setBgUrl(j.image_url);
            } catch { }
        }

        // 2) Ambil terbaru dari API (published)
        const fetchHero = async () => {
            try {
                const res = await axios.get(`${API_BASE}/hero`, {
                    headers: { Accept: "application/json" },
                });
                const data = res?.data?.data;
                if (data) {
                    setHeading(data.heading || "");
                    setSubheading(data.subheading || "");
                    if (data.image_url) setBgUrl(data.image_url);
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                }
            } catch {
                // biarkan fallback/cached
            }
        };

        fetchHero();
    }, []);

    // pecah heading ke dua baris jika ada \n (biar sesuai tampilan lama)
    const [line1, line2] = String(heading).split("\n");

    return (
        <div
            className="hero min-h-[115vh] bg-center relative"
            style={{
                backgroundImage: `url('${bgUrl}')`,
                backgroundPositionY: "-200px",
            }}
        >
            <div className="hero-overlay bg-black/30"></div>

            {/* Text kiri dengan Container */}
            <Container>
                <div className="absolute top-1/2 -translate-y-1/2 text-left text-white max-w-[682px] animate__animated animate__fadeInUp">
                    <h1 className="text-[56px] md:text-[64px] font-bold leading-tight mb-4">
                        {line1}
                        {line2 && (
                            <>
                                <br />
                                {line2}
                            </>
                        )}
                    </h1>
                    <p className="text-[18px] md:text-[24px] font-normal">
                        {subheading}
                    </p>
                </div>
            </Container>
        </div>
    );
};

export default HeroSection;
