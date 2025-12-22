import React from "react";
import { Link } from "react-router";

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <h1 className="text-lg font-bold">Pfa Logo</h1>
            <div className="flex gap-4">
                <Link to="/profile" className="hover:text-gray-300">Profile</Link>
                <Link to="/" className="hover:text-gray-300">Home</Link>
            </div>
        </nav>
    );
};

export default Navbar;
