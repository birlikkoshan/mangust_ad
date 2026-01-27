import { Link } from "react-router-dom";

const UserNavbar = () => {
    return (
        <nav className="navbar">
            <div className="container">
                <div>
                    <Link to="/">Mangust AD</Link>
                </div>
                <div>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            </div>
        </nav>
    );
};

export default UserNavbar;
