import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Popconfirm, Input, message, Modal, Rate, Table } from 'antd';
import { CalendarDays, Clock, MapPin, Loader2, ClipboardList, CreditCard, Star, MessageSquare, Printer, FileText, Download } from 'lucide-react';
import { requestGetMyAppointments, requestCancelAppointment } from '../../config/AppointmentRequest';
import { requestCreateReview, requestGetMyReviews } from '../../config/ReviewRequest';
import { apiClient } from '../../config/axiosClient';

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

const TABS = [
    { key: 'all',       label: 'Tất cả' },
    { key: 'pending',   label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'completed', label: 'Đã khám xong' },
    { key: 'cancelled', label: 'Đã hủy' },
];

const STAR_DESC = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc!'];

function ReviewModal({ appt, onClose, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!rating) { message.warning('Vui lòng chọn số sao'); return; }
        setSubmitting(true);
        try {
            await requestCreateReview({ appointmentId: appt._id, rating, comment });
            message.success('Cảm ơn bạn đã đánh giá!');
            onSuccess(appt._id, rating, comment);
            onClose();
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Gửi đánh giá"
            cancelText="Hủy"
            confirmLoading={submitting}
            title={
                <div className="flex items-center gap-2">
                    <Star size={18} className="text-yellow-500" />
                    <span>Đánh giá bác sĩ</span>
                </div>
            }
        >
            {/* Thông tin bác sĩ */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {appt.doctorId?.image
                        ? <img src={appt.doctorId.image} className="w-full h-full object-cover" alt="" />
                        : <span className="text-2xl flex items-center justify-center h-full">👨‍⚕️</span>
                    }
                </div>
                <div>
                    <p className="font-bold text-gray-900">{appt.doctorId?.name}</p>
                    <p className="text-xs text-primary-600">{appt.doctorId?.specialtyId?.name}</p>
                    <p className="text-xs text-gray-400">{appt.date} · {appt.timeSlot}</p>
                </div>
            </div>

            {/* Chọn sao */}
            <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-2">Bạn đánh giá chất lượng khám như thế nào?</p>
                <Rate
                    value={rating}
                    onChange={setRating}
                    style={{ fontSize: 36 }}
                />
                {rating > 0 && (
                    <p className="text-primary-600 font-semibold mt-1 text-sm">
                        {STAR_DESC[rating - 1]}
                    </p>
                )}
            </div>

            {/* Nhận xét */}
            <div>
                <p className="text-sm text-gray-600 mb-1.5 font-medium flex items-center gap-1">
                    <MessageSquare size={14} /> Nhận xét của bạn
                </p>
                <Input.TextArea
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn với bác sĩ này..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                    showCount
                />
            </div>
        </Modal>
    );
}

function PrescriptionViewModal({ apptId, onClose }) {
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                const res = await apiClient.get(`/api/prescriptions/appointment/${apptId}`);
                setPrescription(res.data.data);
            } catch (err) {
                message.error('Không tải được đơn thuốc hoặc đơn thuốc chưa được kê');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchPrescription();
    }, [apptId]);

    const handlePrint = () => {
        const printContent = document.getElementById('printable-prescription');
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload to restore React state
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await apiClient.get(`/api/prescriptions/${prescription._id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `don-thuoc-${prescription._id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            message.error('Không thể tải PDF');
        }
    };

    if (loading) return <Modal open onCancel={onClose} footer={null}><div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-600" /></div></Modal>;
    if (!prescription) return null;

    const columns = [
        { title: 'Tên thuốc', dataIndex: ['medicineId', 'name'], key: 'name', render: (text, record) => <span className="font-semibold">{text} ({record.medicineId?.unit})</span> },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'qty', width: 80, align: 'center' },
        { title: 'Liều dùng', dataIndex: 'dosage', key: 'dosage' },
        { title: 'Tần suất', dataIndex: 'frequency', key: 'frequency' },
        { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    ];

    return (
        <Modal
            open
            onCancel={onClose}
            width={800}
            footer={null}
            title={
                <div className="flex items-center justify-between pr-8">
                    <span className="text-xl font-bold text-gray-900">Chi Tiết Đơn Thuốc</span>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-white bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium">
                            <Download size={18} /> Tải PDF
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition font-medium">
                            <Printer size={18} /> In Đơn
                        </button>
                    </div>
                </div>
            }
        >
            <div id="printable-prescription" className="p-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-primary-700 uppercase">ĐƠN THUỐC ĐIỆN TỬ</h2>
                    <p className="text-gray-500">Mã đơn: #{prescription._id.toString().slice(-6).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <p><strong className="text-gray-600">Bác sĩ:</strong> {prescription.doctorId?.name}</p>
                        <p><strong className="text-gray-600">Chức vụ:</strong> {prescription.doctorId?.position}</p>
                    </div>
                    <div>
                        <p><strong className="text-gray-600">Bệnh nhân:</strong> {prescription.patientId?.fullName}</p>
                        <p><strong className="text-gray-600">Ngày khám:</strong> {new Date(prescription.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Chẩn đoán:</h3>
                    <p className="bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 font-medium">
                        {prescription.diagnosis}
                    </p>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-3">Chỉ định dùng thuốc:</h3>
                    <Table 
                        dataSource={prescription.medicines} 
                        columns={columns} 
                        rowKey="_id" 
                        pagination={false}
                        bordered
                        size="small"
                        className="print-table"
                    />
                </div>

                {prescription.advice && (
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Lời dặn của Bác sĩ:</h3>
                        <p className="text-gray-700 italic border-l-4 border-primary-400 pl-3 py-1">
                            {prescription.advice}
                        </p>
                    </div>
                )}
                
                <div className="text-right mt-10 pr-10">
                    <p className="italic text-gray-500 mb-1">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                    <p className="font-bold text-gray-800">Chữ ký Bác sĩ</p>
                    <div className="h-20"></div>
                    <p className="font-medium text-primary-700">{prescription.doctorId?.name}</p>
                </div>
            </div>
            
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-prescription, #printable-prescription * {
                        visibility: visible;
                    }
                    #printable-prescription {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                    }
                    .ant-modal-content {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </Modal>
    );
}

function AppointmentCard({ appt, reviewedMap, onCancelled, onReviewed }) {
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPrescription, setShowPrescription] = useState(false);

    const config = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
    const pay = PAYMENT_LABELS[appt.paymentMethod];
    const canCancel = appt.status === 'pending';
    const canReview = appt.status === 'completed';
    const myReview = reviewedMap[appt._id];

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await requestCancelAppointment(appt._id, cancelReason);
            message.success('Đã hủy lịch khám');
            onCancelled(appt._id);
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi hủy');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar bác sĩ */}
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {appt.doctorId?.image
                            ? <img src={appt.doctorId.image} alt="" className="w-full h-full object-cover" />
                            : <span className="text-2xl">👨‍⚕️</span>}
                    </div>

                    {/* Nội dung */}
                    <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{appt.doctorId?.name}</h3>
                                <p className="text-primary-600 text-xs font-medium">{appt.doctorId?.specialtyId?.name}</p>
                            </div>
                            <Tag color={config.color} className="font-semibold text-xs">{config.label}</Tag>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><CalendarDays size={12} />{appt.date}</span>
                            <span className="flex items-center gap-1 font-semibold text-primary-700"><Clock size={12} />{appt.timeSlot}</span>
                            {appt.doctorId?.clinicId?.name && (
                                <span className="flex items-center gap-1"><MapPin size={12} />{appt.doctorId.clinicId.name}</span>
                            )}
                            {pay && (
                                <span className="flex items-center gap-1">
                                    <CreditCard size={12} />
                                    <img src={pay.img} alt={pay.label} className="w-4 h-4 rounded object-contain" />
                                    {pay.label}
                                    {appt.paymentStatus === 'paid'
                                        ? <span className="text-green-600 font-semibold ml-1">✔ Đã TT</span>
                                        : <span className="text-orange-500 font-semibold ml-1">Chưa TT</span>}
                                </span>
                            )}
                        </div>

                        {appt.reason && (
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-1.5 line-clamp-1">
                                Lý do: {appt.reason}
                            </p>
                        )}
                        {appt.cancelReason && (
                            <p className="text-xs text-red-500 mt-1 bg-red-50 rounded-lg px-3 py-1.5">
                                Lý do hủy: {appt.cancelReason}
                            </p>
                        )}

                        {/* Hiển thị review đã có */}
                        {myReview && (
                            <div className="mt-2 flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg text-xs">
                                <div className="flex">
                                    {[1,2,3,4,5].map(s => (
                                        <Star key={s} size={12} className={s <= myReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                    ))}
                                </div>
                                <span className="text-gray-600 line-clamp-1">{myReview.comment || 'Đã đánh giá'}</span>
                            </div>
                        )}
                    </div>

                    {/* Hành động */}
                    <div className="flex-shrink-0 self-start flex flex-col gap-2">
                        <Link to={`/bac-si/${appt.doctorId?._id}`}>
                            <button className="text-xs text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-xl font-semibold transition-colors w-full">
                                Đặt lại
                            </button>
                        </Link>

                        {/* Nút đánh giá */}
                        {canReview && !myReview && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="text-xs text-yellow-600 hover:text-yellow-700 border border-yellow-300 hover:border-yellow-500 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1"
                            >
                                <Star size={12} /> Đánh giá
                            </button>
                        )}
                        
                        {/* Nút Xem Đơn Thuốc */}
                        {appt.status === 'completed' && (
                            <button
                                onClick={() => setShowPrescription(true)}
                                className="text-xs text-teal-600 hover:text-teal-700 border border-teal-300 hover:border-teal-500 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                                <FileText size={12} /> Kết quả
                            </button>
                        )}

                        {canCancel && (
                            <Popconfirm
                                title="Hủy lịch khám này?"
                                description={
                                    <Input.TextArea
                                        rows={2}
                                        placeholder="Lý do hủy (tùy chọn)"
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        className="mt-2"
                                    />
                                }
                                onConfirm={handleCancel}
                                okText="Xác nhận hủy"
                                cancelText="Không hủy"
                                okButtonProps={{ danger: true, loading: cancelling }}
                            >
                                <button className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl font-semibold transition-colors">
                                    Hủy lịch
                                </button>
                            </Popconfirm>
                        )}
                    </div>
                </div>
            </div>

            {showReviewModal && (
                <ReviewModal
                    appt={appt}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={onReviewed}
                />
            )}
            {showPrescription && (
                <PrescriptionViewModal 
                    apptId={appt._id} 
                    onClose={() => setShowPrescription(false)} 
                />
            )}
        </>
    );
}

export default function ProfileAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [reviewedMap, setReviewedMap] = useState({}); // { appointmentId: review }

    useEffect(() => {
        const loadData = async () => {
            try {
                const [apptRes, reviewRes] = await Promise.all([
                    requestGetMyAppointments(),
                    requestGetMyReviews(),
                ]);
                setAppointments(apptRes.metadata || []);
                // Tạo map { appointmentId → review }
                const map = {};
                (reviewRes.metadata || []).forEach(r => { map[r.appointmentId] = r; });
                setReviewedMap(map);
            } catch {
                message.error('Lỗi tải danh sách lịch');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleCancelled = id => setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));

    const handleReviewed = (appointmentId, rating, comment) => {
        setReviewedMap(prev => ({ ...prev, [appointmentId]: { appointmentId, rating, comment } }));
    };

    const filtered = activeTab === 'all' ? appointments : appointments.filter(a => a.status === activeTab);

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="font-bold text-gray-900 text-xl mb-5 flex items-center gap-2">
                    <CalendarDays size={22} className="text-primary-600" />
                    Quản lý lịch khám
                </h1>

                {/* Mini stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Tổng lịch', value: stats.total, bg: 'bg-gray-50', text: 'text-gray-800' },
                        { label: 'Chờ xác nhận', value: stats.pending, bg: 'bg-orange-50', text: 'text-orange-700' },
                        { label: 'Đã xác nhận', value: stats.confirmed, bg: 'bg-blue-50', text: 'text-blue-700' },
                        { label: 'Hoàn thành', value: stats.completed, bg: 'bg-green-50', text: 'text-green-700' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl p-3 ${s.bg} text-center`}>
                            <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            activeTab === tab.key
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary-500" size={36} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                    <ClipboardList size={48} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-700 mb-2">Chưa có lịch hẹn nào</h3>
                    <p className="text-gray-500 text-sm mb-6">Hãy đặt lịch khám với bác sĩ để bắt đầu!</p>
                    <Link to="/">
                        <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm">
                            Tìm bác sĩ
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(appt => (
                        <AppointmentCard
                            key={appt._id}
                            appt={appt}
                            reviewedMap={reviewedMap}
                            onCancelled={handleCancelled}
                            onReviewed={handleReviewed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
