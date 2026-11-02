import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DatePicker, Modal, Input, Select, Form, message, Rate } from 'antd';
import { requestGetDoctorById } from '../../config/DoctorRequest';
import { requestGetSchedules } from '../../config/ScheduleRequest';
import { requestCreateAppointment } from '../../config/AppointmentRequest';
import { requestGetDoctorReviews } from '../../config/ReviewRequest';
import { Loader2, MapPin, CalendarDays, Star, Award, User, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import Context from '../../store/Context';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import { apiClient } from '../../config/axiosClient';

const STATUS_COLOR = {
    available: 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100 cursor-pointer',
    full:      'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60',
    selected:  'bg-primary-600 border-primary-600 text-white shadow-md',
};

const INITIAL_PATIENT_INFO = {
    fullName: '', phone: '', email: '', gender: 'male',
    birthDate: null, address: '', insurance: '',
};

export default function DoctorDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dataUser } = useContext(Context);
    const isLoggedIn = !!Cookies.get('logged');

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    // Booking state
    const [selectedDate, setSelectedDate] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingModal, setBookingModal] = useState(false);
    const [reason, setReason] = useState('');
    const [patientInfo, setPatientInfo] = useState(INITIAL_PATIENT_INFO);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [booking, setBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const [docRes, revRes] = await Promise.all([
                    requestGetDoctorById(id),
                    requestGetDoctorReviews(id),
                ]);
                setDoctor(docRes.metadata);
                setReviews(revRes.metadata || []);
            } catch {
                message.error('Không tìm thấy bác sĩ');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    // Pre-fill from logged-in user context
    useEffect(() => {
        if (dataUser) {
            setPatientInfo(prev => ({
                ...prev,
                fullName: dataUser.fullName || dataUser.name || '',
                phone:    dataUser.phone || '',
                email:    dataUser.email || '',
                gender:   dataUser.gender || 'male',
                address:  dataUser.address || '',
            }));
        }
    }, [dataUser]);

    useEffect(() => {
        if (!selectedDate || !id) { setSchedules([]); setSelectedSlot(null); return; }
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSelectedSlot(null);
            try {
                const res = await requestGetSchedules({ doctorId: id, date: selectedDate.format('DD/MM/YYYY') });
                setSchedules(res.metadata || []);
            } catch {
                message.error('Lỗi tải lịch khám');
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, id]);

    const handleConfirmBooking = async () => {
        if (!isLoggedIn) { navigate('/login'); return; }
        if (!selectedSlot) return;
        if (!patientInfo.fullName.trim() || !patientInfo.phone.trim()) {
            message.warning('Vui lòng nhập Họ tên và Số điện thoại!');
            return;
        }
        setBooking(true);
        try {
            const result = await requestCreateAppointment({
                doctorId: id,
                scheduleId: selectedSlot._id,
                date: selectedDate.format('DD/MM/YYYY'),
                timeSlot: selectedSlot.timeSlot,
                reason,
                paymentMethod,
                patientInfo: {
                    ...patientInfo,
                    birthDate: patientInfo.birthDate ? patientInfo.birthDate.format('DD/MM/YYYY') : '',
                },
            });
            // Nếu online payment và có paymentUrl → redirect
            if (result.metadata?.paymentUrl) {
                window.location.href = result.metadata.paymentUrl;
                return;
            }
            setBookingModal(false);
            setBookingSuccess(true);
            const res = await requestGetSchedules({ doctorId: id, date: selectedDate.format('DD/MM/YYYY') });
            setSchedules(res.metadata || []);
            setSelectedSlot(null);
        } catch (error) {
            message.error(error.response?.data?.message || 'Đặt lịch thất bại');
        } finally {
            setBooking(false);
        }
    };

    const updateInfo = (field, value) => setPatientInfo(prev => ({ ...prev, [field]: value }));

    if (loading) return (
        <div className="min-h-[60vh] flex justify-center items-center">
            <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
    );

    if (!doctor) return (
        <div className="min-h-[60vh] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy bác sĩ</h2>
            <Link to="/" className="text-primary-600 hover:underline mt-4">Về trang chủ</Link>
        </div>
    );

    return (
        <main className="bg-gray-50 min-h-screen pb-20">
            <div className="container-custom pt-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{doctor.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột Trái */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary-50 flex-shrink-0 mx-auto md:mx-0 flex items-center justify-center bg-gray-100">
                                {doctor.image
                                    ? <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                    : <User size={60} className="text-gray-300" />}
                            </div>
                            <div className="flex-grow text-center md:text-left flex flex-col">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                    <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-3 py-1 rounded-full text-sm font-semibold">
                                        <Award size={15} />{doctor.specialtyId?.name}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star size={15} className="text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-gray-800">{doctor.rating > 0 ? doctor.rating.toFixed(1) : 'Chưa có'}</span>
                                        <span className="text-gray-400">({doctor.reviewCount || 0} đánh giá)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin size={17} className="text-gray-400 shrink-0 mt-0.5" />
                                        <span>
                                            <span className="font-semibold text-gray-800">{doctor.clinicId?.name}</span>
                                            {doctor.clinicId?.address && <><br />{doctor.clinicId.address}</>}
                                        </span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!Cookies.get('logged')) {
                                                message.warning('Vui lòng đăng nhập để nhắn tin');
                                                navigate('/login');
                                                return;
                                            }
                                            try {
                                                await apiClient.post('/api/conversations', { doctorId: doctor._id });
                                                navigate('/ho-so/tin-nhan');
                                            } catch (err) {
                                                message.error(err.response?.data?.message || 'Không thể tạo cuộc trò chuyện');
                                            }
                                        }}
                                        className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-teal-50 text-teal-600 font-semibold text-sm rounded-xl transition-colors border border-gray-100 hover:border-teal-200"
                                    >
                                        <MessageSquare size={16} /> Nhắn tin
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu bác sĩ</h2>
                            <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                                {doctor.introduction || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
                            </div>
                        </div>

                        {/* Đánh giá bệnh nhân */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Star size={20} className="text-amber-400 fill-amber-400" />
                                    Đánh giá từ bệnh nhân
                                </h2>
                                {doctor.reviewCount > 0 && (
                                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl">
                                        <span className="text-2xl font-bold text-amber-500">{doctor.rating?.toFixed(1)}</span>
                                        <div>
                                            <Rate disabled value={doctor.rating} allowHalf style={{ fontSize: 13 }} />
                                            <p className="text-xs text-gray-400">{doctor.reviewCount} đánh giá</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare size={36} className="text-gray-200 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Chưa có đánh giá nào cho bác sĩ này</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(rv => (
                                        <div key={rv._id} className="flex gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {rv.patientId?.avatar
                                                    ? <img src={rv.patientId.avatar} className="w-full h-full object-cover" alt="" />
                                                    : <User size={16} className="text-gray-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <p className="font-semibold text-gray-900 text-sm">{rv.patientId?.fullName || 'Ẩn danh'}</p>
                                                    <span className="text-xs text-gray-400">{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                <div className="flex mt-0.5">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star key={s} size={13} className={s <= rv.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                                {rv.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rv.comment}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột Phải — Booking */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 border border-primary-100">
                            <div className="flex items-center justify-between mb-5 pb-4 border-b">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <CalendarDays size={20} className="text-primary-600" />
                                    Đặt lịch khám
                                </h3>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Giá khám</div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.price || 0)}
                                    </div>
                                </div>
                            </div>

                            {bookingSuccess ? (
                                <div className="text-center py-6">
                                    <CheckCircle size={52} className="text-emerald-500 mx-auto mb-3" />
                                    <h4 className="font-bold text-gray-800 text-lg mb-1">Đặt lịch thành công!</h4>
                                    <p className="text-gray-500 text-sm mb-5">Chúng tôi sẽ liên hệ xác nhận lịch của bạn sớm.</p>
                                    <Link to="/lich-cua-toi">
                                        <button className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
                                            Xem lịch của tôi
                                        </button>
                                    </Link>
                                    <button onClick={() => setBookingSuccess(false)} className="w-full mt-2 text-gray-500 text-sm hover:text-gray-700 py-2">
                                        Đặt thêm lịch
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn ngày khám</label>
                                        <DatePicker
                                            className="w-full" size="large" format="DD/MM/YYYY"
                                            placeholder="Chọn ngày..."
                                            disabledDate={(c) => c && c < dayjs().startOf('day')}
                                            onChange={setSelectedDate} value={selectedDate}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                            <Clock size={14} /> Chọn khung giờ
                                        </label>
                                        {!selectedDate ? (
                                            <p className="text-gray-400 text-xs text-center py-4">Hãy chọn ngày trước</p>
                                        ) : loadingSlots ? (
                                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary-500" size={24} /></div>
                                        ) : schedules.length === 0 ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                                <p className="text-amber-700 text-sm font-medium">Ngày này chưa có lịch khám</p>
                                                <p className="text-amber-600 text-xs mt-1">Vui lòng chọn ngày khác</p>
                                            </div>
                                        ) : (() => {
                                            const isSlotExpiredOrFull = (slot) => {
                                                if (slot.currentBookings >= slot.maxBookings) return true;
                                                if (selectedDate) {
                                                    const isToday = selectedDate.isSame(dayjs(), 'day');
                                                    if (isToday) {
                                                        const startTimeStr = slot.timeSlot.split('-')[0].trim();
                                                        const [hours, minutes] = startTimeStr.split(':').map(Number);
                                                        const slotTime = dayjs().hour(hours).minute(minutes).second(0).millisecond(0);
                                                        if (dayjs().isAfter(slotTime)) {
                                                            return true;
                                                        }
                                                    }
                                                }
                                                return false;
                                            };

                                            const visibleSchedules = schedules.filter(slot => !isSlotExpiredOrFull(slot));

                                            if (visibleSchedules.length === 0) {
                                                return (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                                        <p className="text-amber-700 text-sm font-medium">Hiện không còn khung giờ khám trống</p>
                                                        <p className="text-amber-600 text-xs mt-1">Vui lòng chọn ngày khác</p>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {visibleSchedules.map(slot => {
                                                        const isSelected = selectedSlot?._id === slot._id;
                                                        const styleKey = isSelected ? 'selected' : 'available';
                                                        return (
                                                            <button key={slot._id}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${STATUS_COLOR[styleKey]}`}
                                                            >
                                                                {slot.timeSlot}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <button
                                        disabled={!selectedSlot}
                                        onClick={() => { if (!isLoggedIn) { navigate('/login'); return; } setBookingModal(true); }}
                                        className={`w-full mt-5 py-3 rounded-xl font-bold text-sm transition-all ${
                                            selectedSlot
                                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {selectedSlot ? `Đặt lịch ${selectedSlot.timeSlot}` : 'Chọn khung giờ để đặt'}
                                    </button>

                                    {!isLoggedIn && (
                                        <p className="text-center text-xs text-gray-500 mt-2">
                                            Bạn cần <Link to="/login" className="text-primary-600 font-semibold">đăng nhập</Link> để đặt lịch
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal Đặt lịch với form thông tin cá nhân ── */}
            <Modal
                open={bookingModal}
                onCancel={() => setBookingModal(false)}
                onOk={handleConfirmBooking}
                okText="Xác nhận đặt lịch"
                cancelText="Hủy"
                confirmLoading={booking}
                width={600}
                title={
                    <div>
                        <div className="font-bold text-gray-800 text-lg">Thông tin đặt lịch khám</div>
                        <div className="text-sm font-normal text-gray-500 mt-0.5">
                            Vui lòng kiểm tra và điền đầy đủ thông tin bên dưới
                        </div>
                    </div>
                }
                okButtonProps={{ className: 'bg-primary-600 hover:bg-primary-700 h-9' }}
            >
                <div className="py-4 space-y-5">
                    {/* Tóm tắt lịch hẹn */}
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                            <span className="text-gray-500">Bác sĩ:</span>
                            <span className="font-semibold text-gray-800">{doctor.name}</span>
                        </div>
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                            <span className="text-gray-500">Giá khám:</span>
                            <span className="font-bold text-orange-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.price || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                            <span className="text-gray-500">Ngày:</span>
                            <span className="font-semibold">{selectedDate?.format('DD/MM/YYYY')}</span>
                        </div>
                        <div className="flex justify-between col-span-2 sm:col-span-1">
                            <span className="text-gray-500">Giờ khám:</span>
                            <span className="font-semibold text-primary-600">{selectedSlot?.timeSlot}</span>
                        </div>
                    </div>

                    {/* Form thông tin bệnh nhân */}
                    <div>
                        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <User size={16} className="text-primary-600" />
                            Thông tin bệnh nhân
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Họ tên */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    size="large"
                                    placeholder="Nguyễn Văn A"
                                    value={patientInfo.fullName}
                                    onChange={e => updateInfo('fullName', e.target.value)}
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    size="large"
                                    placeholder="0901 234 567"
                                    value={patientInfo.phone}
                                    onChange={e => updateInfo('phone', e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                                <Input
                                    size="large"
                                    placeholder="example@email.com"
                                    value={patientInfo.email}
                                    onChange={e => updateInfo('email', e.target.value)}
                                />
                            </div>

                            {/* Giới tính */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Giới tính</label>
                                <Select
                                    size="large"
                                    className="w-full"
                                    value={patientInfo.gender}
                                    onChange={v => updateInfo('gender', v)}
                                    options={[
                                        { value: 'male',   label: 'Nam' },
                                        { value: 'female', label: 'Nữ' },
                                        { value: 'other',  label: 'Khác' },
                                    ]}
                                />
                            </div>

                            {/* Ngày sinh */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh</label>
                                <DatePicker
                                    size="large"
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    placeholder="DD/MM/YYYY"
                                    value={patientInfo.birthDate}
                                    disabledDate={c => c && c > dayjs()}
                                    onChange={v => updateInfo('birthDate', v)}
                                />
                            </div>

                            {/* Địa chỉ */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Địa chỉ</label>
                                <Input
                                    size="large"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    value={patientInfo.address}
                                    onChange={e => updateInfo('address', e.target.value)}
                                />
                            </div>

                            {/* Mã BHYT */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mã thẻ BHYT (nếu có)</label>
                                <Input
                                    size="large"
                                    placeholder="VD: DN4010000XXXXXXX"
                                    value={patientInfo.insurance}
                                    onChange={e => updateInfo('insurance', e.target.value)}
                                />
                            </div>

                            {/* Lý do khám */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Lý do khám</label>
                                <Input
                                    size="large"
                                    placeholder="VD: Đau đầu, chóng mặt..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div>
                        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            💳 Phương thức thanh toán
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'cash',  label: 'Tiền mặt', img: 'https://salt.tikicdn.com/ts/upload/92/b2/78/1b3b9cda5208b323eb9ec56b84c7eb87.png', desc: 'Thanh toán tại quầy' },
                                { value: 'momo',  label: 'MoMo',     img: 'https://salt.tikicdn.com/ts/upload/ce/f6/e8/ea880ef285856f744e3ffb5d282d4b2d.jpg', desc: 'Ví điện tử MoMo' },
                                { value: 'vnpay', label: 'VNPay',    img: 'https://salt.tikicdn.com/ts/upload/77/6a/df/a35cb9c62b9215dbc6d334a77cda4327.png', desc: 'Cổng thanh toán VNPay' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setPaymentMethod(opt.value)}
                                    className={`border-2 rounded-xl p-3 text-center transition-all ${
                                        paymentMethod === opt.value
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                                        <img src={opt.img} alt={opt.label} className="w-full h-full object-contain" />
                                    </div>
                                    <div className={`text-xs font-bold ${paymentMethod === opt.value ? 'text-primary-700' : 'text-gray-700'}`}>{opt.label}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                        {paymentMethod !== 'cash' && (
                            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-700">
                                ℹ️ Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán <b>{paymentMethod === 'momo' ? 'MoMo' : 'VNPay'}</b> để hoàn tất.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </main>
    );
}
