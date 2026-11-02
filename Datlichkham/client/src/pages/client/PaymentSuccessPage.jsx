import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { requestGetMyAppointments } from '../../config/AppointmentRequest';
import { CheckCircle, CalendarDays, Clock, MapPin, User, Phone, CreditCard, ChevronRight, Home } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { message } from 'antd';

const PAYMENT_LABELS = {
    cash:  { label: 'Tiền mặt' },
    momo:  { label: 'Ví MoMo' },
    vnpay: { label: 'VNPay' },
};

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('id');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!appointmentId) {
            setLoading(false);
            return;
        }
        
        const fetchAppointment = async () => {
            try {
                const res = await requestGetMyAppointments();
                const appts = res.metadata || [];
                const found = appts.find(a => a._id === appointmentId);
                setAppointment(found);
            } catch (err) {
                message.error('Lỗi khi tải thông tin lịch hẹn');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin đặt lịch</h2>
                <p className="text-gray-500 mb-6">Lịch hẹn không tồn tại hoặc bạn không có quyền truy cập.</p>
                <Link to="/" className="btn-primary">
                    <Home size={18} /> Về trang chủ
                </Link>
            </div>
        );
    }

    const { patientInfo, doctorId, timeSlot, date, paymentMethod, paymentStatus, reason } = appointment;
    const clinic = doctorId?.clinicId;

    return (
        <main className="bg-gray-50 min-h-screen py-12">
            <div className="container-custom max-w-3xl">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Header Thành công */}
                    <div className="bg-emerald-500 p-8 text-center text-white">
                        <CheckCircle size={64} className="mx-auto mb-4 text-white opacity-90" />
                        <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
                        <p className="text-emerald-50 text-sm">
                            Lịch hẹn của bạn đã được xác nhận. Vui lòng đến đúng giờ.
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Box Bác sĩ & Thời gian */}
                        <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <CalendarDays size={18} className="text-blue-600" />
                                Thông tin lịch khám
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white overflow-hidden border border-blue-100 flex-shrink-0 flex items-center justify-center">
                                        {doctorId?.image ? (
                                            <img src={doctorId.image} alt={doctorId.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{doctorId?.name}</div>
                                        <div className="text-sm text-blue-700 font-medium">{doctorId?.specialtyId?.name}</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-blue-100">
                                        <Clock size={16} className="text-blue-500" />
                                        <span className="font-semibold">{timeSlot}</span>
                                        <span className="text-gray-400">|</span>
                                        <span>{date}</span>
                                    </div>
                                </div>
                                {clinic && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-blue-100 mt-2">
                                        <MapPin size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            <strong className="text-gray-800">{clinic.name}</strong> - {clinic.address}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chi tiết đặt lịch */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bệnh nhân */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <User size={18} className="text-primary-500" />
                                    Bệnh nhân
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Họ tên</span>
                                        <span className="font-medium text-gray-900">{patientInfo?.fullName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Số điện thoại</span>
                                        <span className="font-medium text-gray-900">{patientInfo?.phone}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium text-gray-900">{patientInfo?.email || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Thanh toán */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <CreditCard size={18} className="text-primary-500" />
                                    Thanh toán
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Phương thức</span>
                                        <span className="font-medium text-gray-900">{PAYMENT_LABELS[paymentMethod]?.label || paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Trạng thái</span>
                                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            {paymentStatus === 'paid' ? 'Đã thanh toán' : 'Thành công'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500">Phí khám</span>
                                        <span className="font-bold text-orange-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctorId?.price || 200000)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {reason && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Lý do khám:</h3>
                                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 italic border border-gray-100">
                                    "{reason}"
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center border-t border-gray-100 pt-6">
                            <Link to="/ho-so/lich-kham" className="btn-primary justify-center">
                                Xem lịch của tôi <ChevronRight size={18} />
                            </Link>
                            <Link to="/" className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <Home size={18} /> Trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
