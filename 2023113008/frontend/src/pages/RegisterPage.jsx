import { Link } from 'react-router-dom';
import Header from '../Header';
import logo from '../static/logo.png';
import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function registerUser(ev){
    ev.preventDefault();
    try{
      await axios.post('/register',{
      name,
      email,
      password,
    });
    alert('Registered Successfully!');
  }catch{
    alert('Regestration faled ,try again later.');
  }
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
          <form className="max-w-md mx-auto mt-4 space-y-4" onSubmit={registerUser}>
            <input type="text" placeholder="John Doe"
            value={name} 
            onChange={ev=> setName(ev.target.value)} />
            <input type="email" placeholder="example123@gmail.com" 
            value={email}
            onChange={ev=> setEmail(ev.target.value)}/>
            <input type="password" placeholder="password" 
            value={password}
            onChange={ev => setPassword(ev.target.value)}/>
            <div className="pb-5">
              <button className="primary text-gray-800 text-xl">Register</button>
              <div className="flex justify-center pt-3 text-gray-200 font-serif">
                Already have an account?{" "}
                <Link to={"/login"} className="text-cyan-200 pl-2">
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
