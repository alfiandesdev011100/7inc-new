import Layout from "./Layout";
import HeroSection from "./HeroSection";
import TentangKami from "./TentangKami";
import BisnisKami from "./BisnisKami";
import FirstBerita from './FirstBerita';
import Kontak from "./Kontak";
import Footer from "./Footer";

function LandingContent() {
    return (
        <Layout>
            <HeroSection />
            <TentangKami />
            <BisnisKami />
            <FirstBerita />
            <Kontak />
            <Footer />
        </Layout>
    );
}

export default LandingContent;
