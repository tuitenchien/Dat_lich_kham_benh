import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../config/axiosClient';
import {
    CalendarDays, Clock, Users, CheckCircle, AlertCircle,
    TrendingUp, Loader2, ChevronRight, User, BadgeCheck, XCircle
} from 'lucide-react';

const STATUS_CONFIG = {
    pending:   { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700',   icon: AlertCircle },
    confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
    completed: { label: 'Đã khám',       color: 'bg-emerald-100 text-emerald-700', icon: BadgeCheck },
    cancelled: { label: 'Đã hủy',        color: 'bg-red-100 text-red-700',      icon: XCircle },
};

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function DoctorDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get('/api/appointments/doctor/my');
                setData(res.data.metadata);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-teal-500" size={40} />
            </div>
        );
    }

    const { stats, appointments } = data || {};

    // Lịch hẹn hôm nay
    const todayStr = new Date().toLocaleDateString('vi-VN');
    const todayAppts = (appointments || []).filter(a => a.date === todayStr);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Hôm nay, {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users}       label="Lịch hẹn hôm nay"       value={stats?.todayTotal ?? 0}     color="bg-teal-500" />
                <StatCard icon={AlertCircle} label="Chờ xác nhận"            value={stats?.todayPending ?? 0}   color="bg-amber-500" />
                <StatCard icon={CheckCircle} label="Đã xác nhận"             value={stats?.todayConfirmed ?? 0} color="bg-blue-500" />
                <StatCard icon={TrendingUp}  label="Đã khám xong"            value={stats?.todayCompleted ?? 0} color="bg-emerald-500" />
            </div>

            {/* Today appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <CalendarDays size={18} className="text-teal-500" />
                        Lịch hẹn hôm nay
                    </h2>
                    <Link to="/bac-si-dashboard/lich-hen" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </div>

                {todayAppts.length === 0 ? (
                    <div className="py-16 text-center">
                        <CalendarDays size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 text-sm">Không có lịch hẹn nào hôm nay</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {todayAppts.map(appt => {
                            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={appt._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {appt.patientId?.avatar
                                            ? <img src={appt.patientId.avatar} className="w-full h-full object-cover" alt="" />
                                            : <User size={18} className="text-gray-400" />
                                        }
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{appt.patientInfo?.fullName}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Clock size={12} />
                                            {appt.timeSlot}
                                            <span className="mx-1">·</span>
                                            {appt.reason || 'Không ghi lý do'}
                                        </p>
                                    </div>
                                    {/* Status badge */}
                                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                                        <StatusIcon size={13} />
                                        {cfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
