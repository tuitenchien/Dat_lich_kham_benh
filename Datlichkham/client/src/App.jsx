import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from './store/Provider';
import Context from './store/Context';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DoctorDetailPage from './pages/client/DoctorDetailPage';
import ClinicDetailPage from './pages/client/ClinicDetailPage';
import SearchDoctorPage from './pages/client/SearchDoctorPage';
import ClinicsPage from './pages/client/ClinicsPage';
import SpecialtiesPage from './pages/client/SpecialtiesPage';
import ContactPage from './pages/client/ContactPage';
import ArticlesPage from './pages/client/ArticlesPage';
import ArticleDetail from './pages/client/ArticleDetail';
import MyAppointmentsPage from './pages/client/MyAppointmentsPage';
import PaymentSuccessPage from './pages/client/PaymentSuccessPage';
import AdminRoute from './components/routes/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SpecialtiesManager from './pages/admin/SpecialtiesManager';
import ClinicsManager from './pages/admin/ClinicsManager';
import DoctorsManager from './pages/admin/DoctorsManager';
import SchedulesManager from './pages/admin/SchedulesManager';
import AppointmentsManager from './pages/admin/AppointmentsManager';
import MedicinesManager from './pages/admin/MedicinesManager';
import UsersManager from './pages/admin/UsersManager';
import ArticlesManager from './pages/admin/ArticlesManager';
import ContactsManager from './pages/admin/ContactsManager';
import ProfileLayout from './components/layout/ProfileLayout';
import ProfileInfo from './pages/profile/ProfileInfo';
import ProfileAppointments from './pages/profile/ProfileAppointments';
import ProfileFavoriteDoctors from './pages/profile/ProfileFavoriteDoctors';
import ProfileMessages from './pages/profile/ProfileMessages';
import DoctorRoute from './components/routes/DoctorRoute';
import DoctorLayout from './components/layout/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorSchedules from './pages/doctor/DoctorSchedules';
import AIChatbot from './components/chat/AIChatbot';
import Cookies from 'js-cookie';
import './index.css';

// ─── Helper: home page theo role ─────────────────────────────────────────────
function homeByRole(role) {
    if (role === 'admin')  return '/admin';
    if (role === 'doctor') return '/bac-si-dashboard';
    return '/';
}

// ─── Protected Route (chỉ user thường) ───────────────────────────────────────
function ProtectedRoute({ children }) {
    const isLoggedIn = !!Cookies.get('logged');
    const { dataUser } = useContext(Context);

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (!dataUser?.role) return null; // chờ load

    // Admin/Doctor cố vào trang user → redirect về trang của họ
    if (dataUser.role === 'admin')  return <Navigate to="/admin" replace />;
    if (dataUser.role === 'doctor') return <Navigate to="/bac-si-dashboard" replace />;

    return children;
}

// ─── Guest Route (redirect nếu đã đăng nhập) ─────────────────────────────────
function GuestRoute({ children }) {
    const isLoggedIn = !!Cookies.get('logged');
    const { dataUser } = useContext(Context);

    if (!isLoggedIn) return children;
    if (!dataUser?.role) return null; // chờ load

    return <Navigate to={homeByRole(dataUser.role)} replace />;
}
// ─── User Only Route (user thường + chưa đăng nhập) ─────────────────────────
// Admin/Doctor truy cập → redirect về dashboard của họ
function UserOnlyRoute({ children }) {
    const { dataUser } = useContext(Context);
    const isLoggedIn = !!Cookies.get('logged');

    // Chưa đăng nhập → OK (user public)
    if (!isLoggedIn) return children;

    // Chờ load role
    if (!dataUser?.role) return null;

    // Admin/Doctor → về trang của họ
    if (dataUser.role === 'admin')  return <Navigate to="/admin" replace />;
    if (dataUser.role === 'doctor') return <Navigate to="/bac-si-dashboard" replace />;

    return children;
}

// ─── Layout with Header + Footer ─────────────────────────────────────────────
function MainLayout({ children }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
    return (
        <BrowserRouter>
            <Provider>
                <Routes>
                    {/* Auth pages – no header/footer */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <RegisterPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <GuestRoute>
                                <ForgotPasswordPage />
                            </GuestRoute>
                        }
                    />

                    {/* Public pages with layout */}
                    <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
                        <Route index element={<HomePage />} />
                        <Route path="bac-si" element={<SearchDoctorPage />} />
                        <Route path="bac-si/:id" element={<DoctorDetailPage />} />
                        <Route path="co-so-y-te" element={<ClinicsPage />} />
                        <Route path="co-so-y-te/:id" element={<ClinicDetailPage />} />
                        <Route path="chuyen-khoa" element={<SpecialtiesPage />} />
                        <Route path="tin-tuc" element={<ArticlesPage />} />
                        <Route path="tin-tuc/:slug" element={<ArticleDetail />} />
                        <Route path="about" element={<div className="pt-20 text-center h-screen">Về chúng tôi</div>} />
                        <Route path="lien-he" element={<ContactPage />} />
                    </Route>

                    {/* Trang Profile người dùng */}
                    <Route path="/ho-so" element={<MainLayout><ProfileLayout /></MainLayout>}>
                        <Route index element={<Navigate to="thong-tin" replace />} />
                        <Route path="thong-tin" element={<ProfileInfo />} />
                        <Route path="lich-kham" element={<ProfileAppointments />} />
                        <Route path="bac-si-yeu-thich" element={<ProfileFavoriteDoctors />} />
                        <Route path="tin-nhan" element={<ProfileMessages />} />
                    </Route>

                    {/* Trang lịch của bệnh nhân */}
                    <Route
                        path="/lich-cua-toi"
                        element={
                            <MainLayout>
                                <MyAppointmentsPage />
                            </MainLayout>
                        }
                    />

                    {/* Trang thanh toán thành công */}
                    <Route
                        path="/thanh-toan-thanh-cong"
                        element={
                            <MainLayout>
                                <PaymentSuccessPage />
                            </MainLayout>
                        }
                    />

                    {/* Admin pages */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="clinics" element={<ClinicsManager />} />
                        <Route path="specialties" element={<SpecialtiesManager />} />
                        <Route path="doctors" element={<DoctorsManager />} />
                        <Route path="schedules" element={<SchedulesManager />} />
                        <Route path="medicines" element={<MedicinesManager />} />
                        <Route path="users" element={<UsersManager />} />
                        <Route path="articles" element={<ArticlesManager />} />
                        <Route path="appointments" element={<AppointmentsManager />} />
                        <Route path="contacts" element={<ContactsManager />} />
                        <Route path="settings" element={<div className="p-6">Cài đặt hệ thống</div>} />
                    </Route>

                    {/* Doctor pages */}
                    <Route
                        path="/bac-si-dashboard"
                        element={
                            <DoctorRoute>
                                <DoctorLayout />
                            </DoctorRoute>
                        }
                    >
                        <Route index element={<DoctorDashboard />} />
                        <Route path="lich-hen" element={<DoctorAppointments />} />
                        <Route path="tin-nhan" element={<DoctorMessages />} />
                        <Route path="don-thuoc" element={<DoctorPrescriptions />} />
                        <Route path="danh-gia" element={<DoctorReviews />} />
                        <Route path="lich-lam-viec" element={<DoctorSchedules />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* AI Chatbot Floating Widget */}
                <AIChatbot />
            </Provider>
        </BrowserRouter>
    );
}
