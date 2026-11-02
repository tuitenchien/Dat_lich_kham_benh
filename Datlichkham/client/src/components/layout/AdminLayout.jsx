import { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarCheck,
    CalendarDays,
    Settings,
    LogOut,
    Menu,
    Search,
    Bell,
    UserCircle,
    Activity,
    Building2,
    Pill,
    FileText,
    MessageSquare
} from 'lucide-react';
import Cookies from 'js-cookie';
import Context from '../../store/Context';
import NotificationBell from './NotificationBell';

const ADMIN_LINKS = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Người dùng', href: '/admin/users', icon: <Users size={20} /> },
    { label: 'Cơ sở y tế', href: '/admin/clinics', icon: <Building2 size={20} /> },
    { label: 'Kho thuốc', href: '/admin/medicines', icon: <Pill size={20} /> },
    { label: 'Bài viết', href: '/admin/articles', icon: <FileText size={20} /> },
    { label: 'Chuyên khoa', href: '/admin/specialties', icon: <Activity size={20} /> },
    { label: 'Bác sĩ', href: '/admin/doctors', icon: <Stethoscope size={20} /> },
    { label: 'Lịch làm việc', href: '/admin/schedules', icon: <CalendarDays size={20} /> },
    { label: 'Lịch hẹn', href: '/admin/appointments', icon: <CalendarCheck size={20} /> },
    { label: 'Liên hệ', href: '/admin/contacts', icon: <MessageSquare size={20} /> },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const { dataUser } = useContext(Context);

    const handleLogout = () => {
        Cookies.remove('logged');
        Cookies.remove('tokenResetPassword');
        window.location.href = '/';
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">Hồ sơ cá nhân</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogOut size={16} />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* ── Sidebar ── */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-100 transition-all duration-300 flex flex-col shadow-sm ${
                    sidebarOpen ? 'w-64' : 'w-20 lg:w-20 -translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Sidebar Header */}
                <div className="h-[68px] flex items-center justify-center border-b border-gray-100 px-4">
                    <Link to="/" className={`flex items-center gap-2 ${!sidebarOpen && 'lg:hidden'}`}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    fill="white"
                                />
                                <path
                                    d="M7 12h2l1.5-3L13 15l1.5-3H17"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <span className="font-bold text-primary-700 whitespace-nowrap overflow-hidden">
                                Admin<span className="text-cyan-500">Panel</span>
                            </span>
                        )}
                    </Link>
                </div>

                {/* Sidebar Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
                    {ADMIN_LINKS.map((link) => {
                        const isActive = location.pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary-50 text-primary-600 shadow-sm font-semibold'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-primary-600 font-medium'
                                }`}
                                title={!sidebarOpen ? link.label : ''}
                            >
                                <div className={`${isActive ? 'text-primary-600' : 'text-gray-400'}`}>{link.icon}</div>
                                {sidebarOpen && <span className="whitespace-nowrap">{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-red-500 hover:bg-red-50 transition-colors ${!sidebarOpen && 'justify-center'}`}
                        title="Đăng xuất"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-[68px] bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center relative">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white w-64 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                            <button className="flex items-center gap-2 hover:bg-gray-50 py-1 pl-1 pr-3 rounded-full border border-gray-200 transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-cyan-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                                    {dataUser?.fullName ? dataUser.fullName.charAt(0) : <UserCircle size={18} />}
                                </div>
                                <div className="hidden sm:flex flex-col items-start leading-none">
                                    <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                                        {dataUser?.fullName || 'Admin'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">Quản trị viên</span>
                                </div>
                            </button>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
