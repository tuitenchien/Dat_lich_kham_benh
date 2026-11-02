import { useState, useContext } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { User, CalendarDays, Heart, LogOut, ChevronRight, Shield, MessageSquare } from 'lucide-react';
import Context from '../../store/Context';
import { apiClient } from '../../config/axiosClient';
import Cookies from 'js-cookie';
import { useSocket } from '../../context/SocketContext';

const NAV_ITEMS = [
    { key: 'thong-tin',       label: 'Thông tin cá nhân',  icon: <User size={18} />,        to: '/ho-so/thong-tin' },
    { key: 'lich-kham',       label: 'Quản lý lịch khám',  icon: <CalendarDays size={18} />, to: '/ho-so/lich-kham' },
    { key: 'bac-si-yeu-thich',label: 'Bác sĩ yêu thích',   icon: <Heart size={18} />,       to: '/ho-so/bac-si-yeu-thich' },
    { key: 'tin-nhan',        label: 'Tin nhắn',            icon: <MessageSquare size={18} />, to: '/ho-so/tin-nhan', badge: true },
];

export default function ProfileLayout() {
    const { dataUser } = useContext(Context);
    const { unreadCount } = useSocket() || {};
    const isLoggedIn = !!Cookies.get('logged');

    if (!isLoggedIn) return <Navigate to="/login" replace />;

    const handleLogout = async () => {
        try { await apiClient.get('/api/users/logout'); } catch {}
        Cookies.remove('logged');
        window.location.href = '/';
    };

    const avatarFallback = dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero strip */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-500 h-36" />

            <div className="container-custom pb-16 -mt-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                    {/* ── Sidebar ── */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {/* Avatar + tên */}
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="relative inline-block mb-3">
                                    {dataUser?.avatar ? (
                                        <img
                                            src={dataUser.avatar}
                                            alt={dataUser.fullName}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-4 border-white shadow-md">
                                            <span className="text-white text-2xl font-bold">{avatarFallback}</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white" />
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg leading-snug">
                                    {dataUser?.fullName || 'Người dùng'}
                                </h2>
                                <p className="text-gray-400 text-xs mt-0.5 truncate">{dataUser?.email}</p>
                                {dataUser?.role === 'admin' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mt-2">
                                        <Shield size={11} /> Admin
                                    </span>
                                )}
                            </div>

                            {/* Nav items */}
                            <nav className="p-3">
                                {NAV_ITEMS.map(item => (
                                    <NavLink
                                        key={item.key}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all group ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700 font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span className={isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-grow">{item.label}</span>
                                                {item.badge && unreadCount > 0 && (
                                                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                                <ChevronRight size={14} className={`${isActive ? 'text-primary-400' : 'text-gray-300'} ${item.badge && unreadCount > 0 ? 'hidden' : ''}`} />
                                            </>
                                        )}
                                    </NavLink>
                                ))}

                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* ── Main content (Outlet) ── */}
                    <div className="lg:col-span-3">
                        <Outlet />
                    </div>

                </div>
            </div>
        </div>
    );
}
