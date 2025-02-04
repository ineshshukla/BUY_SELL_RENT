import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import { UserContext } from '../UserContext';
import axios from 'axios';

export default function Item() {
    const { user } = useContext(UserContext);
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchItem() {
            try {
                const { data } = await axios.get(`/api/items/${itemId}`);
                setItem(data);
            } catch (err) {
                console.error("Failed to fetch item:", err);
                setError('Failed to fetch item.');
            }
        }

        fetchItem();
    }, [itemId]);

    const addToCart = async () => {
        try {
            await axios.post('/api/cart/add', { userId: user._id, itemId: item._id });
            alert('Item added to cart successfully');
        } catch (err) {
            console.error("Failed to add item to cart:", err);
            setError('Failed to add item to cart.');
        }
    };

    if (!item) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
                    <h1 className="text-3xl font-serif mb-6">{item.name}</h1>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <p className="text-gray-300">Price: ${item.price}</p>
                    <p className="text-gray-300">Description: {item.description}</p>
                    <p className="text-gray-300">Category: {item.category}</p>
                    <p className="text-gray-300">Vendor: {item.seller.name}</p>
                    <button 
                        onClick={addToCart} 
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                    > Add to Cart</button>
                </div>
            </div>
        </div>
    );
}
