import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import { UserContext } from '../UserContext';
import axios from 'axios';

export default function Search() {
    const { user } = useContext(UserContext);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchItems() {
            try {
                const { data } = await axios.get('/api/items/search', {
                    params: { 
                        userId: user._id,
                        status: 'available' // Add status parameter
                    }
                });
                setItems(data);
            } catch (err) {
                console.error("Failed to fetch items:", err);
                setError('Failed to fetch items.');
            }
        }

        if (user) {
            fetchItems();
        }
    }, [user]);

    const addToCart = async (itemId) => {
        try {
            await axios.post('/api/cart/add', { userId: user._id, itemId });
            alert('Item added to cart successfully');
        } catch (err) {
            console.error("Failed to add item to cart:", err);
            setError('Failed to add item to cart.');
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className=" bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
                    <h1 className="text-3xl font-serif mb-6">Search Items</h1>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search for items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-md text-gray-800"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <div 
                                key={item._id} 
                                className="bg-gray-700 rounded-lg p-4 shadow-md cursor-pointer"
                                onClick={() => navigate(`/items/${item._id}`)}
                            >
                                <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                                <p className="text-gray-300">Price: ${item.price}</p>
                                <p className="text-gray-300">Description: {item.description}</p>
                                <p className="text-gray-300">Category: {item.category}</p>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item._id);
                                    }} 
                                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
