import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Context from '../../store/Context';
import Cookies from 'js-cookie';

export default function DoctorRoute({ children }) {
    const isLoggedIn = !!Cookies.get('logged');
    if (!isLoggedIn) return <Navigate to="/login" replace />;

    const { dataUser } = useContext(Context);

    // Nếu dataUser chưa load xong thì chờ (tránh redirect nhầm)
    if (!dataUser?.role) return null;

    // Không phải doctor → redirect về trang tương ứng
    if (dataUser.role === 'admin')  return <Navigate to="/admin" replace />;
    if (dataUser.role !== 'doctor') return <Navigate to="/" replace />;

    return children;
}
