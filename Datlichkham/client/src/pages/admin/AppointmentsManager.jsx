import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Select, DatePicker, Button, message, Popconfirm } from 'antd';
import { requestGetAllAppointments, requestUpdateAppointmentStatus } from '../../config/AppointmentRequest';
import { requestGetDoctors } from '../../config/DoctorRequest';
import { RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
    pending:   { label: 'Chờ xác nhận', color: 'orange' },
    confirmed: { label: 'Đã xác nhận',  color: 'blue' },
    completed: { label: 'Đã khám xong', color: 'green' },
    cancelled: { label: 'Đã hủy',       color: 'red' },
};

export default function AppointmentsManager() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ doctorId: undefined, date: undefined, status: undefined });

    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const res = await requestGetAllAppointments(params);
            setAppointments(res.metadata || []);
        } catch {
            message.error('Lỗi tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        requestGetDoctors().then(r => setDoctors(r.metadata || [])).catch(() => {});
    }, [fetchData]);

    const handleStatusChange = async (id, status) => {
        try {
            await requestUpdateAppointmentStatus(id, status);
            message.success('Cập nhật trạng thái thành công');
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi cập nhật');
        }
    };

    const handleFilter = () => {
        const params = {};
        if (filters.doctorId) params.doctorId = filters.doctorId;
        if (filters.date) params.date = filters.date.format('DD/MM/YYYY');
        if (filters.status) params.status = filters.status;
        fetchData(params);
    };

    const columns = [
        {
            title: 'STT',
            width: 55,
            render: (_, __, i) => <span className="text-gray-400 text-sm">{i + 1}</span>
        },
        {
            title: 'Bệnh nhân',
            key: 'patient',
            render: (_, r) => {
                const info = r.patientInfo;
                if (info) {
                    return (
                        <div>
                            <div className="font-semibold text-gray-800 text-sm">{info.fullName}</div>
                            <div className="text-gray-400 text-xs">{info.phone}</div>
                            <div className="text-gray-400 text-xs">{info.email}</div>
                        </div>
                    );
                }
                return <div className="text-gray-500 text-sm">{r.patientId?.fullName || r.patientId?.email || '---'}</div>;
            }
        },
        {
            title: 'Bác sĩ',
            key: 'doctor',
            render: (_, r) => (
                <div>
                    <div className="font-semibold text-gray-800 text-sm">{r.doctorId?.name || '---'}</div>
                    <div className="text-primary-600 text-xs">{r.doctorId?.specialtyId?.name}</div>
                </div>
            )
        },
        {
            title: 'Ngày & Giờ',
            key: 'datetime',
            render: (_, r) => (
                <div className="text-sm">
                    <div className="font-semibold text-gray-800">{r.date}</div>
                    <div className="text-primary-600 font-medium">{r.timeSlot}</div>
                </div>
            )
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            render: (v) => <span className="text-gray-500 text-sm">{v || '—'}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                return <Tag color={cfg.color} className="font-semibold">{cfg.label}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_, r) => {
                if (r.status === 'cancelled' || r.status === 'completed') return <span className="text-gray-400 text-xs">—</span>;
                return (
                    <div className="flex gap-2">
                        {r.status === 'pending' && (
                            <Popconfirm
                                title="Xác nhận lịch khám này?"
                                onConfirm={() => handleStatusChange(r._id, 'confirmed')}
                                okText="Xác nhận" cancelText="Hủy"
                            >
                                <button className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                                    Xác nhận
                                </button>
                            </Popconfirm>
                        )}
                        {r.status === 'confirmed' && (
                            <Popconfirm
                                title="Đánh dấu đã khám xong?"
                                onConfirm={() => handleStatusChange(r._id, 'completed')}
                                okText="Hoàn thành" cancelText="Hủy"
                            >
                                <button className="text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                                    Hoàn thành
                                </button>
                            </Popconfirm>
                        )}
                    </div>
                );
            }
        }
    ];

    // Stats
    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Lịch hẹn</h1>
                <p className="text-gray-500 text-sm mt-1">Xem và xử lý các cuộc hẹn khám bệnh</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Tổng cộng', value: stats.total, color: 'bg-gray-50 border-gray-200', text: 'text-gray-800' },
                    { label: 'Chờ xác nhận', value: stats.pending, color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
                    { label: 'Đã xác nhận', value: stats.confirmed, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                    { label: 'Hoàn thành', value: stats.completed, color: 'bg-green-50 border-green-200', text: 'text-green-700' },
                    { label: 'Đã hủy', value: stats.cancelled, color: 'bg-red-50 border-red-200', text: 'text-red-700' },
                ].map(stat => (
                    <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
                        <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5 pb-5 border-b border-gray-100 items-end">
                    <Select
                        allowClear placeholder="Lọc bác sĩ"
                        showSearch optionFilterProp="label"
                        options={doctors.map(d => ({ value: d._id, label: d.name }))}
                        onChange={(v) => setFilters(f => ({ ...f, doctorId: v }))}
                        style={{ minWidth: 180 }}
                    />
                    <DatePicker
                        format="DD/MM/YYYY" placeholder="Lọc theo ngày" allowClear
                        onChange={(v) => setFilters(f => ({ ...f, date: v }))}
                    />
                    <Select
                        allowClear placeholder="Trạng thái"
                        options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
                        onChange={(v) => setFilters(f => ({ ...f, status: v }))}
                        style={{ minWidth: 150 }}
                    />
                    <Button type="primary" onClick={handleFilter}>Lọc</Button>
                    <button onClick={() => { setFilters({}); fetchData(); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                        <RefreshCw size={14} /> Làm mới
                    </button>
                </div>

                <Table
                    columns={columns}
                    dataSource={appointments}
                    rowKey="_id"
                    loading={loading}
                    size="middle"
                    pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} lịch hẹn` }}
                    locale={{ emptyText: 'Chưa có lịch hẹn nào' }}
                />
            </div>
        </div>
    );
}
