import { useState, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../UserContext';
import logo from '../static/logo.png';

export default function CASRegisterPage() {
    const location = useLocation();
    const casEmail = location.state?.email;
    const { setUser } = useContext(UserContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [redirect, setRedirect] = useState(false);

    if (!casEmail) {
        return <Navigate to="/login" />;
    }

    async function registerUser(ev) {
        ev.preventDefault();
        try {
            const { data } = await axios.post('/cas-register', {
                email: casEmail,
                firstName,
                lastName,
                age: parseInt(age),
                contactNumber,
                isCASUser: true
            });
            setUser(data);
            alert('Registration successful!');
            setRedirect(true);
        } catch (e) {
            alert('Registration failed. Please try again.');
        }
    }

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <div className="bg-gray-800 text-white">
                <header className="flex items-center justify-between h-20 px-4">
                    <img src={logo} alt="Logo" className="bg-gray-100 rounded-xl h-16 w-auto" />
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-center text-gray-100 flex-1">
                        Complete Registration
                    </h1>
                </header>
            </div>

            <div className="flex-grow flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl text-gray-100 mb-4">Complete your profile for {casEmail}</h2>
                    <form className="max-w-md mx-auto space-y-4" onSubmit={registerUser}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={ev => setFirstName(ev.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={ev => setLastName(ev.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            value={age}
                            onChange={ev => setAge(ev.target.value)}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Contact Number"
                            value={contactNumber}
                            onChange={ev => setContactNumber(ev.target.value)}
                            required
                        />
                        <button className="primary text-gray-800 text-xl">Complete Registration</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
