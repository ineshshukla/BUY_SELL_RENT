import logo from './static/logo.png'
export default function Header(){
    return(
        <div className="bg-gray-800 text-white">
                <header className="flex items-center justify-between h-20 px-4">
                {/* Logo */}
                <img src={logo} alt="Logo" className="bg-gray-100 rounded-xl h-16 w-auto" />
                
                {/* Navigation links */}
                <nav className="space-x-6 text-lg">
                    <a href="#search" className="hover:text-gray-400">Search</a>
                    <a href="#items" className="hover:text-gray-400">Items</a>
                    <a href="#orders" className="hover:text-gray-400">Orders</a>
                    <a href="#deliver" className="hover:text-gray-400">Deliver</a>
                    <a href="#cart" className="hover:text-gray-400">My Cart</a>
                    <a href="#support" className="hover:text-gray-400">Support</a>
                </nav>
                </header>
        </div>
    );
}