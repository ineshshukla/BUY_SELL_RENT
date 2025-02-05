import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard' 
import Search from './pages/Search'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import ProtectedRoutes from './components/ProtectedRoutes'
import Item from './pages/Item'
import Deliver from './pages/Deliver'
import Support from './pages/Support'
import CASRegisterPage from './pages/CASRegisterPage'

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path='/search' element={<Search />}/>
          <Route path='/cart' element={<Cart />}/>
          <Route path='/items/:itemId' element={<Item />}/>
          <Route path="/deliver" element={<Deliver />} />
          <Route path="/support" element={<Support />} /> {/* Moved inside ProtectedRoutes */}
        </Route>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage />}/>
        <Route path='/cas-register' element={<CASRegisterPage />}/>
      </Routes>
    </UserContextProvider>
  )
}
  
export default App
