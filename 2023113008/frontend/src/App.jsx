import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard' 
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/register' element={<RegisterPage />}/>
    </Routes>
  )
}
  
export default App
 