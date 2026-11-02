import { useState, useEffect } from 'react';
import { 
    Users, 
    Stethoscope, 
    CalendarCheck, 
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    CheckCircle,
    Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, Tag, message } from 'antd';
import { apiClient } from '../../config/axiosClient';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalRevenue: 0,
        paymentRate: 0,
        cancelRate: 0,
        revenueChartData: [],
        todayAppointments: [],
        topDoctors: []
    });
    
    const [realtime, setRealtime] = useState({
        onlineDoctors: 0,
        activeCalls: 0
    });

    useEffect(() => {
        fetchDashboardStats();

        // Polling realtime stats every 5 seconds
        const interval = setInterval(fetchRealtimeStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const res = await apiClient.get('/api/admin/dashboard');
            if (res.data.metadata) {
                setStats(res.data.metadata);
                setRealtime(res.data.metadata.realtime);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            message.error('Lỗi khi tải dữ liệu thống kê');
        }
    };

    const fetchRealtimeStats = async () => {
        try {
            const res = await apiClient.get('/api/admin/dashboard/realtime');
            if (res.data.metadata) {
                setRealtime(res.data.metadata);
            }
        } catch (error) {}
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const dynamicStatsCards = [
        { 
            title: 'Tổng Bệnh Nhân', 
            value: stats.totalPatients, 
            trend: 'Hoạt động', 
            trendUp: true, 
            icon: <Users size={24} />,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600'
        },
        { 
            title: 'Bác Sĩ', 
            value: stats.totalDoctors, 
            trend: `${realtime.onlineDoctors} Đang online`, 
            trendUp: realtime.onlineDoctors > 0, 
            icon: <Stethoscope size={24} />,
            color: 'from-cyan-500 to-cyan-600',
            bg: 'bg-cyan-50',
            text: 'text-cyan-600'
        },
        { 
            title: 'Tổng Lịch Khám', 
            value: stats.totalAppointments, 
            trend: `${stats.paymentRate}% Tỉ lệ thanh toán`, 
            trendUp: stats.paymentRate > 50, 
            icon: <CalendarCheck size={24} />,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
        },
        { 
            title: 'Doanh Thu', 
            value: formatCurrency(stats.totalRevenue), 
            trend: `${stats.cancelRate}% Tỉ lệ hủy`, 
            trendUp: stats.cancelRate < 20, 
            icon: <TrendingUp size={24} />,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600'
        },
    ];

    const todayAppointmentsData = stats.todayAppointments.map((app, index) => ({
        key: app._id,
        patient: app.patientInfo?.fullName || app.patientId?.fullName || 'N/A',
        doctor: app.doctorId?.name || 'N/A',
        date: app.date,
        time: app.timeSlot,
        status: app.status
    }));

    const columns = [
        {
            title: 'Bệnh nhân',
            dataIndex: 'patient',
            key: 'patient',
            render: (text) => <span className="font-semibold text-gray-700">{text}</span>,
        },
        {
            title: 'Bác sĩ',
            dataIndex: 'doctor',
            key: 'doctor',
        },
        {
            title: 'Ngày & Giờ',
            key: 'datetime',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="text-sm">{record.date}</span>
                    <span className="text-xs text-gray-500">{record.time}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status) => {
                let color = 'default';
                let text = status;
                if (status === 'pending') { color = 'warning'; text = 'Chờ xác nhận'; }
                if (status === 'confirmed') { color = 'processing'; text = 'Đã xác nhận'; }
                if (status === 'completed') { color = 'success'; text = 'Hoàn thành'; }
                if (status === 'cancelled') { color = 'error'; text = 'Đã hủy'; }
                return (
                    <Tag color={color} className="rounded-full px-3 py-1 font-medium border-0">
                        {text}
                    </Tag>
                );
            },
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi các chỉ số hoạt động chính của hệ thống MediCare+</p>
                </div>
                <a
                    href="/api/admin/dashboard/export-revenue"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                    onClick={async (e) => {
                        e.preventDefault();
                        try {
                            const res = await apiClient.get('/api/admin/dashboard/export-revenue', { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'BaoCao_DoanhThu.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            message.success('Xuất báo cáo thành công');
                        } catch (error) {
                            message.error('Lỗi khi xuất báo cáo');
                        }
                    }}
                >
                    <Download size={18} />
                    Xuất Báo Cáo
                </a>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dynamicStatsCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${stat.color} group-hover:scale-150 transition-transform duration-500`}></div>
                        
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.text}`}>
                                {stat.icon}
                            </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 z-10">
                            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Activity size={20} className="text-primary-500" />
                                Tăng trưởng doanh thu
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Biểu đồ tổng quan doanh thu 7 tháng gần nhất</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }} 
                                    tickFormatter={(val) => `${val >= 1000000 ? (val/1000000) + 'M' : val}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CalendarCheck size={20} className="text-primary-500" />
                                Số lượng Lịch khám
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Thống kê lượng đặt lịch mới</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [value, 'Lịch khám']}
                                />
                                <Bar dataKey="appointments" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables / Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lịch hẹn mới nhất */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Lịch hẹn cần xử lý</h3>
                        <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">Xem tất cả</button>
                    </div>
                    <Table 
                        columns={columns} 
                        dataSource={todayAppointmentsData} 
                        pagination={{ pageSize: 5 }} 
                        className="custom-table"
                        locale={{ emptyText: 'Chưa có lịch hẹn nào hôm nay' }}
                    />
                </div>

                {/* Hoạt động gần đây (Top Bác Sĩ + Realtime Cuộc gọi) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Bác sĩ nổi bật</h3>
                    </div>
                    <div className="space-y-6">
                        {stats.topDoctors.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Chưa có dữ liệu</p>}
                        {stats.topDoctors.map((doc, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600`}>
                                    <Stethoscope size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{doc.count} lượt khám</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Realtime
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Bác sĩ online</span>
                                <span className="font-bold text-emerald-600">{realtime.onlineDoctors}</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Video Call hiện tại</span>
                                <span className="font-bold text-blue-600">{realtime.activeCalls}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Custom CSS for Recharts Tooltip and Antd Table */}
            <style>{`
                .custom-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    border-bottom: 1px solid #f1f5f9;
                }
                .custom-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #f8fafc;
                }
                .custom-table .ant-table-tbody > tr:hover > td {
                    background-color: #f8fafc;
                }
                .recharts-tooltip-cursor {
                    fill: #f1f5f9;
                }
            `}</style>
        </div>
    );
}
