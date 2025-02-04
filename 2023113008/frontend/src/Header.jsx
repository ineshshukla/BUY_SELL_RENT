import logo from './static/logo.png'
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './UserContext';

export default function Header(){
    const { logout } = useContext(UserContext);

    return(
        <div className="bg-gray-800 text-white">
                <header className="flex items-center justify-between h-20 px-4">
                {/* Logo */}
                <Link to="/"><img src={logo} alt="Logo" className="bg-gray-100 rounded-xl h-16 w-auto" /></Link>
                {/* Navigation links */}
                <nav className="space-x-6 text-lg">
                    <Link to="/search" className="hover:text-gray-400">Search</Link>
                    <Link to="/orders" className="hover:text-gray-400">Orders</Link>
                    <Link to="/deliver" className="hover:text-gray-400">Deliver</Link>
                    <Link to="/cart" className="hover:text-gray-400">My Cart</Link>
                    <Link to="/support" className="hover:text-gray-400">Support</Link>
                    <button onClick={logout} className="hover:text-gray-400 !bg-transparent !border-none">Logout</button>
                </nav>
                </header>
        </div>
    );
}