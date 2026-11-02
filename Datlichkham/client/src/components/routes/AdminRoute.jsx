import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Context from '../../store/Context';

export default function AdminRoute({ children }) {
    const { dataUser } = useContext(Context);
    const isLoggedIn = !!Cookies.get('logged');

    // Chưa đăng nhập → về trang login
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    // Chưa load xong dataUser → chờ
    if (!dataUser?.role) return null;

    // Không phải admin → redirect về trang tương ứng với role
    if (dataUser.role === 'doctor') return <Navigate to="/bac-si-dashboard" replace />;
    if (dataUser.role !== 'admin')  return <Navigate to="/" replace />;

    return children;
}
