import { Link, redirect } from 'react-router-dom';
import Header from '../Header';
import logo from '../static/logo.png'
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    async function LoginUser(ev) {
      ev.preventDefault();
      try {
          console.log(email, password);
          const { data } = await axios.post('/login', { email, password });
          console.log(data); // You should check the response here for login success
          alert('Login Successful!');
          
      } catch (e) {
          console.log(e); // You can log the error to see what the backend sent
          if (e.response && e.response.status === 400) {
              alert('Login Failed! User not found.');
          } else if (e.response && e.response.status === 422) {
              alert('Login Failed! Incorrect password.');
          } else {
              alert('An error occurred during login.');
          }
      }
  }
    return(
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
          <h1 className="text-2xl sm:text-3xl text-center text-gray-100 font-serif mb-6">Login</h1>
          <form className="max-w-md mx-auto mt-4 space-y-4" onSubmit={LoginUser}>
            <input type="email" placeholder="example123@gmail.com" 
            value={email}
            onChange={ev=> setEmail(ev.target.value)}/>
            <input type="password" placeholder="password" 
            value={password}
            onChange={ev=> setPassword(ev.target.value)}/>
            <div className="pb-5">
              <button className="primary text-gray-800 text-xl">Login</button>
              <div className="flex justify-center pt-3 text-gray-200 font-serif">
                Don't have an account?{" "}
                <Link to={"/register"} className="text-cyan-200 pl-2">
                  Register
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    );
}