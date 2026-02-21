import Navbar from './Navbar';
import HealthCheck from './HealthCheck';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white relative">
            <Navbar />
            <main>{children}</main>
            <HealthCheck />
        </div>
    );
};

export default Layout;
