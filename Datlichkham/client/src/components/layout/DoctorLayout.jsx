import { useState, useContext } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    LogOut,
    User,
    Menu,
    X,
    Stethoscope,
    MessageSquare,
    FileText,
    Star,
    Clock,
    ChevronRight
} from 'lucide-react';
import Context from '../../store/Context';
import Cookies from 'js-cookie';
import { useSocket } from '../../context/SocketContext';
import NotificationBell from './NotificationBell';

const navItems = [
    { to: '/bac-si-dashboard', label: 'Tổng quan', icon: LayoutDashboard, end: true },
    { to: '/bac-si-dashboard/lich-lam-viec', label: 'Lịch & Ngày nghỉ', icon: Clock },
    { to: '/bac-si-dashboard/lich-hen', label: 'Lịch hẹn', icon: CalendarDays },
    { to: '/bac-si-dashboard/tin-nhan', label: 'Tin nhắn', icon: MessageSquare, badge: true },
    { to: '/bac-si-dashboard/don-thuoc', label: 'Đơn thuốc', icon: FileText },
    { to: '/bac-si-dashboard/danh-gia', label: 'Đánh giá', icon: Star },
];

export default function DoctorLayout() {
    const { dataUser } = useContext(Context);
    const { unreadCount, pendingCount } = useSocket() || {};
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await apiClient.post('/api/users/logout');
        } catch {}
        Cookies.remove('logged');
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ── Overlay mobile ── */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 flex flex-col
                transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none lg:border-r border-gray-100
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-gray-900 text-base">MediCare</span>
                        <span className="text-teal-600 font-bold">+</span>
                        <p className="text-[11px] text-gray-400 leading-none">Bảng điều khiển bác sĩ</p>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-gray-400 hover:text-gray-700"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Doctor Info */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3 flex-1 mr-2 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {dataUser?.avatar ? (
                                <img src={dataUser.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <User size={20} className="text-teal-700" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{dataUser?.fullName}</p>
                            <p className="text-xs text-teal-600 truncate">Bác sĩ</p>
                        </div>
                    </div>
                    <div className="hidden lg:block shrink-0">
                        <NotificationBell />
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon, end, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                    isActive
                                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-200'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={18}
                                        className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'}
                                    />
                                    <span className="flex-1">{label}</span>
                                    {badge && (unreadCount > 0 || pendingCount > 0) && (
                                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            {unreadCount + pendingCount > 9 ? '9+' : unreadCount + pendingCount}
                                        </span>
                                    )}
                                    {!badge && isActive && <ChevronRight size={14} className="ml-auto text-teal-200" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar mobile */}
                <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-800">
                            <Menu size={22} />
                        </button>
                        <span className="font-bold text-gray-800">
                            MediCare<span className="text-teal-600">+</span>
                        </span>
                    </div>
                    <NotificationBell />
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
