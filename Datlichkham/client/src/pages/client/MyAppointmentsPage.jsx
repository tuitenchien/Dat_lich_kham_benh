import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tag, Popconfirm, Input, message } from 'antd';
import { CalendarDays, Clock, MapPin, Loader2, ClipboardList, CreditCard } from 'lucide-react';
import { requestGetMyAppointments, requestCancelAppointment } from '../../config/AppointmentRequest';
import Cookies from 'js-cookie';

const STATUS_CONFIG = {
    pending:   { label: 'Chờ xác nhận', color: 'orange' },
    confirmed: { label: 'Đã xác nhận',  color: 'blue' },
    completed: { label: 'Đã khám xong', color: 'green' },
    cancelled: { label: 'Đã hủy',       color: 'red' },
};

const PAYMENT_LABELS = {
    cash:  { img: 'https://salt.tikicdn.com/ts/upload/92/b2/78/1b3b9cda5208b323eb9ec56b84c7eb87.png', label: 'Tiền mặt' },
    momo:  { img: 'https://salt.tikicdn.com/ts/upload/ce/f6/e8/ea880ef285856f744e3ffb5d282d4b2d.jpg', label: 'MoMo' },
    vnpay: { img: 'https://salt.tikicdn.com/ts/upload/77/6a/df/a35cb9c62b9215dbc6d334a77cda4327.png', label: 'VNPay' },
};

function AppointmentCard({ appt, onCancelled }) {
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const config = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
    const canCancel = appt.status === 'pending';

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await requestCancelAppointment(appt._id, cancelReason);
            message.success('Đã hủy lịch khám');
            onCancelled(appt._id);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi hủy');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
            {/* Avatar bác sĩ */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {appt.doctorId?.image
                    ? <img src={appt.doctorId.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl">👨‍⚕️</span>}
            </div>

            {/* Thông tin */}
            <div className="flex-grow">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900">{appt.doctorId?.name}</h3>
                        <p className="text-primary-600 text-xs font-medium">{appt.doctorId?.specialtyId?.name}</p>
                    </div>
                    <Tag color={config.color} className="font-semibold">{config.label}</Tag>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-semibold text-primary-700">{appt.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{appt.doctorId?.clinicId?.name}</span>
                    </div>
                    {appt.paymentMethod && (
                        <div className="flex items-center gap-1.5">
                            <CreditCard size={14} className="text-gray-400" />
                            <img src={PAYMENT_LABELS[appt.paymentMethod]?.img} alt="" className="w-5 h-5 rounded object-contain" />
                            <span>{PAYMENT_LABELS[appt.paymentMethod]?.label}</span>
                            {appt.paymentStatus === 'paid'
                                ? <span className="text-xs text-green-600 font-semibold">✔ Đã thanh toán</span>
                                : <span className="text-xs text-orange-500 font-semibold">Chưa thanh toán</span>}
                        </div>
                    )}
                </div>

                {appt.reason && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        Lý do: {appt.reason}
                    </p>
                )}
                {appt.cancelReason && (
                    <p className="text-xs text-red-500 mt-2 bg-red-50 rounded-lg px-3 py-1.5">
                        Lý do hủy: {appt.cancelReason}
                    </p>
                )}
            </div>

            {/* Nút hủy */}
            {canCancel && (
                <div className="flex-shrink-0 self-start">
                    <Popconfirm
                        title="Hủy lịch khám này?"
                        description={
                            <Input.TextArea
                                rows={2}
                                placeholder="Lý do hủy (tùy chọn)"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="mt-2"
                            />
                        }
                        onConfirm={handleCancel}
                        okText="Xác nhận hủy"
                        cancelText="Không hủy"
                        okButtonProps={{ danger: true, loading: cancelling }}
                    >
                        <button className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl font-semibold transition-colors">
                            Hủy lịch
                        </button>
                    </Popconfirm>
                </div>
            )}
        </div>
    );
}

export default function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchParams] = useSearchParams();
    const isLoggedIn = !!Cookies.get('logged');

    // Thông báo kết quả thanh toán khi được redirect về
    useEffect(() => {
        const payment = searchParams.get('payment');
        const status = searchParams.get('status');
        const resultCode = searchParams.get('resultCode');
        if (payment) {
            if (status === 'success' || resultCode === '0') {
                message.success(`Thanh toán ${payment.toUpperCase()} thành công! Lịch khám đã được xác nhận.`);
            } else if (status === 'fail' || (resultCode && resultCode !== '0')) {
                message.error(`Thanh toán ${payment.toUpperCase()} thất bại hoặc bị hủy.`);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isLoggedIn) return;
        const fetch = async () => {
            try {
                const res = await requestGetMyAppointments();
                setAppointments(res.metadata || []);
            } catch {
                message.error('Lỗi tải danh sách lịch');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleCancelled = (id) => {
        setAppointments(prev => prev.map(a =>
            a._id === id ? { ...a, status: 'cancelled' } : a
        ));
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    if (!isLoggedIn) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <ClipboardList size={52} className="text-gray-300" />
            <h2 className="text-xl font-bold text-gray-700">Vui lòng đăng nhập để xem lịch</h2>
            <Link to="/login" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                Đăng nhập
            </Link>
        </div>
    );

    return (
        <main className="bg-gray-50 min-h-screen pb-20">
            <div className="container-custom pt-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lịch khám của tôi</h1>
                        <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các lịch hẹn của bạn</p>
                    </div>
                    <Link to="/bac-si">
                        <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors flex items-center gap-2">
                            <CalendarDays size={16} /> Đặt lịch mới
                        </button>
                    </Link>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'pending', label: 'Chờ xác nhận' },
                        { key: 'confirmed', label: 'Đã xác nhận' },
                        { key: 'completed', label: 'Đã khám xong' },
                        { key: 'cancelled', label: 'Đã hủy' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                                filter === tab.key
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={36} /></div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                        <ClipboardList size={52} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-700 text-lg mb-2">Chưa có lịch hẹn nào</h3>
                        <p className="text-gray-500 text-sm mb-6">Hãy đặt lịch khám với bác sĩ để bắt đầu!</p>
                        <Link to="/bac-si">
                            <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
                                Tìm bác sĩ
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(appt => (
                            <AppointmentCard key={appt._id} appt={appt} onCancelled={handleCancelled} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
