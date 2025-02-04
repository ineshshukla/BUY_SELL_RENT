import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../UserContext';

const ProtectedRoutes = () => {
    const { user, ready } = useContext(UserContext);

    if (!ready) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default ProtectedRoutes;
