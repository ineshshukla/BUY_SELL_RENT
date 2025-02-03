import { Link } from 'react-router-dom';
import logo from '../static/logo.png';
import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function registerUser(ev) {
    ev.preventDefault();

    // Frontend validation for IIIT emails
    if (!email.endsWith('@iiit.ac.in')) {
      setError('Only IIIT emails are allowed.');
      return;
    }

    try {
      await axios.post('/register', {
        firstName,
        lastName,
        email,
        age,
        contactNumber,
        password,
      });
      alert('Registered Successfully!');
      setRedirect(true);
    } catch (err) {
      setError(err.response?.data || 'Registration failed, try again later.');
    }
  }

  if(redirect){
      return <Navigate to={'/login'}/>
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-800 text-white">
        <header className="flex items-center justify-between h-20 px-4">
          <img src={logo} alt="Logo" className="bg-gray-100 rounded-xl h-16 w-auto" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-center text-gray-100 flex-1">
            BUY-SELL
          </h1>
        </header>
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl sm:text-3xl text-center text-gray-100 font-serif mb-6">Register</h1>
          {error && <p className="text-red-400 text-center">{error}</p>}
          <form className="max-w-md mx-auto mt-4 space-y-4" onSubmit={registerUser}>
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
              type="email"
              placeholder="example@iiit.ac.in"
              value={email}
              onChange={ev => setEmail(ev.target.value)}
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
              type="text"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={ev => setContactNumber(ev.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              required
            />
            <div className="pb-5">
              <button className="primary text-gray-800 text-xl">Register</button>
              <div className="flex justify-center pt-3 text-gray-200 font-serif">
                Already have an account?{" "}
                <Link to="/login" className="text-cyan-200 pl-2">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
