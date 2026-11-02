import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../config/axiosClient';
import {
    CalendarDays, Search, Filter, User, Clock, Phone,
    CheckCircle, BadgeCheck, XCircle, AlertCircle, Loader2,
    ChevronDown, Plus, Trash2, FileText, History, Bot, Mic, Sparkles
} from 'lucide-react';
import { message, DatePicker, Modal, Form, Input, Select, Button, Space, Timeline, Spin } from 'antd';
import dayjs from 'dayjs';

const STATUS_CONFIG = {
    all:       { label: 'Tất cả',        color: 'bg-gray-100 text-gray-700' },
    pending:   { label: 'Chờ xác nhận',  color: 'bg-amber-100 text-amber-700',    icon: AlertCircle },
    confirmed: { label: 'Đã xác nhận',   color: 'bg-blue-100 text-blue-700',      icon: CheckCircle },
    completed: { label: 'Đã khám',        color: 'bg-emerald-100 text-emerald-700',icon: BadgeCheck },
    cancelled: { label: 'Đã hủy',         color: 'bg-red-100 text-red-700',       icon: XCircle },
};

const GENDER = { male: 'Nam', female: 'Nữ', other: 'Khác' };

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    // Kê đơn
    const [medicines, setMedicines] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAppt, setCurrentAppt] = useState(null);
    const [form] = Form.useForm();

    const fetchMedicines = async () => {
        try {
            const res = await apiClient.get('/api/medicines?status=active');
            setMedicines(res.data.data);
        } catch (err) {}
    };

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (dateFilter) params.date = dateFilter.format('DD/MM/YYYY');
            const res = await apiClient.get('/api/appointments/doctor/my', { params });
            setAppointments(res.data.metadata?.appointments || []);
        } catch (err) {
            message.error('Lỗi khi tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, dateFilter]);

    useEffect(() => { 
        fetchAppointments(); 
        fetchMedicines();
    }, [fetchAppointments]);

    const [emrPatient, setEmrPatient] = useState(null);
    const [emrHistory, setEmrHistory] = useState([]);
    const [emrLoading, setEmrLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

    const openEMR = async (patient) => {
        setEmrPatient(patient);
        setEmrLoading(true);
        setAiSummary('');
        try {
            // userId of patient is appt.patientId
            const patientId = patient._id;
            const res = await apiClient.get(`/api/prescriptions/patient/${patientId}/history`);
            setEmrHistory(res.data.data);
        } catch (error) {
            message.error('Không tải được lịch sử bệnh án');
        } finally {
            setEmrLoading(false);
        }
    };

    const handleSummarizeEMR = async () => {
        if (!emrPatient) return;
        setAiSummaryLoading(true);
        try {
            const res = await apiClient.get(`/api/ai/emr/${emrPatient._id}/summarize`);
            setAiSummary(res.data.metadata.summary);
        } catch (error) {
            message.error('Lỗi khi tóm tắt bệnh án bằng AI');
        } finally {
            setAiSummaryLoading(false);
        }
    };

    // Prescription State
    const [submitting, setSubmitting] = useState(false);
    
    // Voice to Prescription
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const toggleListening = () => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            message.error("Trình duyệt không hỗ trợ nhận diện giọng nói!");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        // Cho phép nghe liên tục cho đến khi người dùng bấm dừng
        recognition.continuous = true;
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;

        let fullTranscript = '';

        recognition.onstart = () => {
            setIsListening(true);
            message.info("Đang nghe... Vui lòng đọc tên thuốc, số lượng và cách dùng. Bấm 'Đang nghe...' để kết thúc.");
        };

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                fullTranscript += event.results[i][0].transcript + ' ';
            }
        };

        recognition.onend = async () => {
            setIsListening(false);
            if (!fullTranscript.trim()) return;

            // Xử lý với AI
            try {
                message.loading({ content: 'AI đang phân tích đơn thuốc...', key: 'ai-voice' });
                const res = await apiClient.post('/api/ai/voice-prescription', { text: fullTranscript });
                const aiMedicines = res.data.metadata || [];
                
                if (aiMedicines.length > 0) {
                    const currentMeds = form.getFieldValue('medicines') || [];
                    form.setFieldsValue({ medicines: [...currentMeds, ...aiMedicines] });
                    message.success({ content: `Đã thêm ${aiMedicines.length} loại thuốc từ giọng nói!`, key: 'ai-voice' });
                } else {
                    message.warning({ content: "AI không thể nhận diện loại thuốc nào từ giọng nói của bạn.", key: 'ai-voice' });
                }
            } catch (err) {
                message.error({ content: "Lỗi khi xử lý giọng nói với AI", key: 'ai-voice' });
            }
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            if (e.error !== 'aborted') {
                message.error("Lỗi nhận diện giọng nói: " + e.error);
            }
        };

        recognition.start();
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await apiClient.put(`/api/appointments/${id}/status`, { status: newStatus });
            message.success('Cập nhật trạng thái thành công!');
            fetchAppointments();
        } catch {
            message.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = appointments.filter(a =>
        a.patientInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.patientInfo?.phone?.includes(search)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarDays size={24} className="text-teal-500" />
                    Quản lý Lịch hẹn
                </h1>
                <p className="text-gray-400 text-sm mt-1">Xem và cập nhật trạng thái lịch khám của bệnh nhân</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, số điện thoại..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                        />
                    </div>

                    {/* Date filter */}
                    <DatePicker
                        format="DD/MM/YYYY"
                        value={dateFilter}
                        onChange={setDateFilter}
                        placeholder="Lọc theo ngày"
                        allowClear
                        className="h-9"
                    />

                    {/* Status filter */}
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                                    statusFilter === key
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600'
                                }`}
                            >
                                {cfg.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Appointments list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-teal-500" size={36} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <CalendarDays size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400">Không có lịch hẹn nào phù hợp</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map(appt => {
                            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            const isExpanded = expandedId === appt._id;

                            return (
                                <div key={appt._id} className="hover:bg-gray-50/40 transition-colors">
                                    {/* Main row */}
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        {/* Avatar */}
                                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {appt.patientId?.avatar
                                                ? <img src={appt.patientId.avatar} className="w-full h-full object-cover" alt="" />
                                                : <User size={20} className="text-gray-400" />
                                            }
                                        </div>

                                        {/* Patient info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900">{appt.patientInfo?.fullName}</p>
                                            <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {appt.timeSlot} · {appt.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone size={12} /> {appt.patientInfo?.phone}
                                                </span>
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        openEMR({
                                                            _id: appt.patientId?._id || appt.patientId,
                                                            fullName: appt.patientInfo?.fullName || 'Bệnh nhân',
                                                            phone: appt.patientInfo?.phone,
                                                            gender: appt.patientInfo?.gender
                                                        }); 
                                                    }}
                                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
                                                >
                                                    <History size={12} /> Lịch sử khám
                                                </button>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                                            {StatusIcon && <StatusIcon size={13} />}
                                            {cfg.label}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {appt.status === 'pending' && (
                                                <button
                                                    disabled={updatingId === appt._id}
                                                    onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                                                    className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60 font-semibold"
                                                >
                                                    Xác nhận
                                                </button>
                                            )}
                                            {appt.status === 'confirmed' && (
                                                <button
                                                    onClick={() => {
                                                        setCurrentAppt(appt);
                                                        setIsModalOpen(true);
                                                        form.resetFields();
                                                    }}
                                                    className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-60 font-semibold flex items-center gap-1"
                                                >
                                                    <FileText size={14} /> Kê Đơn
                                                </button>
                                            )}
                                            {appt.status === 'completed' && (
                                                <a
                                                    href={`/api/prescriptions/appointment/${appt._id}/pdf`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold flex items-center gap-1"
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        try {
                                                            const res = await apiClient.get(`/api/prescriptions/appointment/${appt._id}`);
                                                            const pId = res.data.data._id;
                                                            
                                                            const response = await apiClient.get(`/api/prescriptions/${pId}/pdf`, { responseType: 'blob' });
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `don-thuoc-${pId}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        } catch (error) {
                                                            message.error('Không tìm thấy đơn thuốc');
                                                        }
                                                    }}
                                                >
                                                    <FileText size={14} /> Xem Đơn
                                                </a>
                                            )}
                                            {/* Expand toggle */}
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : appt._id)}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-teal-300 hover:text-teal-600 transition"
                                            >
                                                <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="px-6 pb-4 ml-15">
                                            <div className="bg-gray-50 rounded-xl p-4 text-sm grid grid-cols-2 sm:grid-cols-3 gap-3 border border-gray-100">
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-0.5">Giới tính</p>
                                                    <p className="font-medium text-gray-800">{GENDER[appt.patientInfo?.gender] || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-0.5">Ngày sinh</p>
                                                    <p className="font-medium text-gray-800">{appt.patientInfo?.birthDate || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-0.5">Email</p>
                                                    <p className="font-medium text-gray-800 truncate">{appt.patientInfo?.email || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-0.5">Số BHYT</p>
                                                    <p className="font-medium text-gray-800">{appt.patientInfo?.insurance || '—'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-400 text-xs mb-0.5">Lý do khám</p>
                                                    <p className="font-medium text-gray-800">{appt.reason || 'Không ghi lý do'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-0.5">Phương thức TT</p>
                                                    <p className="font-medium text-gray-800 capitalize">{appt.paymentMethod}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Count */}
            {!loading && (
                <p className="text-center text-gray-400 text-sm">
                    Hiển thị <strong className="text-gray-700">{filtered.length}</strong> lịch hẹn
                </p>
            )}

            {/* Modal Kê Đơn */}
            <Modal
                title={<div className="text-xl font-bold">Kê Đơn Thuốc & Kết Quả Khám</div>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                    onFinish={async (values) => {
                        try {
                            setUpdatingId('prescribing');
                            await apiClient.post('/api/prescriptions', {
                                appointmentId: currentAppt._id,
                                ...values
                            });
                            message.success('Đã lưu kết quả và kê đơn thành công!');
                            setIsModalOpen(false);
                            fetchAppointments();
                        } catch (error) {
                            message.error(error.response?.data?.message || 'Lỗi khi lưu đơn thuốc');
                        } finally {
                            setUpdatingId(null);
                        }
                    }}
                >
                    <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
                        Bệnh nhân: <strong>{currentAppt?.patientInfo?.fullName}</strong> - {GENDER[currentAppt?.patientInfo?.gender]}
                    </div>

                    <Form.Item
                        name="diagnosis"
                        label="Chẩn đoán bệnh"
                        rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán' }]}
                    >
                        <Input.TextArea rows={2} placeholder="Ví dụ: Viêm họng cấp tính..." />
                    </Form.Item>

                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-primary-600" /> Kê Đơn Thuốc
                        <Button 
                            type="dashed" 
                            className={`ml-auto border-dashed flex items-center gap-1.5 font-semibold transition-colors ${isListening ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 hover:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse' : 'border-teal-400 text-teal-600 bg-teal-50 hover:bg-teal-100'}`}
                            onClick={toggleListening}
                            icon={isListening ? <span className="w-2 h-2 rounded-sm bg-red-500" /> : <Mic size={16} />}
                        >
                            {isListening ? 'Bấm để Hoàn tất' : 'Kê Đơn Bằng Giọng Nói (AI)'}
                        </Button>
                    </div>
                    <Form.List name="medicines">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg mb-2 relative group border border-gray-100">
                                        <div className="flex-1 grid grid-cols-12 gap-3">
                                            <div className="col-span-5">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'medicineId']}
                                                    rules={[{ required: true, message: 'Chọn thuốc' }]}
                                                    className="mb-2"
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Tìm thuốc..."
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                        }
                                                        options={medicines.map(m => ({
                                                            label: `${m.name} (${m.unit}) - Kho: ${m.stock || 0}`,
                                                            value: m._id,
                                                            disabled: m.stock <= 0
                                                        }))}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'note']}
                                                    className="mb-0"
                                                >
                                                    <Input placeholder="Ghi chú thêm (sau ăn, trước ngủ...)" className="text-xs" />
                                                </Form.Item>
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'quantity']}
                                                    rules={[{ required: true, message: 'Nhập SL' }]}
                                                    className="mb-0"
                                                >
                                                    <Input type="number" placeholder="Số lượng" min={1} />
                                                </Form.Item>
                                            </div>

                                            <div className="col-span-2">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'dosage']}
                                                    rules={[{ required: true, message: 'Liều/lần' }]}
                                                    className="mb-0"
                                                >
                                                    <Input placeholder="Liều lượng (500mg, 1 viên...)" />
                                                </Form.Item>
                                            </div>

                                            <div className="col-span-3">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'frequency']}
                                                    rules={[{ required: true, message: 'Tần suất' }]}
                                                    className="mb-0"
                                                >
                                                    <Input placeholder="Ngày 2 lần..." />
                                                </Form.Item>
                                            </div>
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={() => remove(name)}
                                            className="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />} className="mt-2 h-10 border-gray-300 text-gray-500 hover:text-primary-600 hover:border-primary-600">
                                        Thêm thuốc
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item name="advice" label="Lời dặn dò chung (không bắt buộc)" className="mt-4">
                        <Input.TextArea rows={2} placeholder="Kiêng ăn đồ cay nóng, uống nhiều nước..." />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="bg-primary-600 hover:bg-primary-700 px-6"
                            loading={updatingId === 'prescribing'}
                        >
                            Lưu Kết Quả
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal EMR - Bệnh án điện tử */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3">
                        <History className="text-primary-600" />
                        Hồ Sơ Bệnh Án Điện Tử (EMR)
                    </div>
                }
                open={!!emrPatient}
                onCancel={() => setEmrPatient(null)}
                footer={null}
                width={700}
                centered
            >
                {emrPatient && (
                    <div className="mt-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl">
                                {emrPatient.fullName ? emrPatient.fullName.charAt(0) : 'U'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{emrPatient.fullName}</h3>
                                <p className="text-sm text-gray-600">{emrPatient.phone || 'Chưa cập nhật SĐT'} • {emrPatient.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                            </div>
                        </div>

                        {/* AI Summary Section */}
                        {emrHistory.length > 0 && (
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100 mb-6 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 text-teal-500/10">
                                    <Bot size={100} />
                                </div>
                                <div className="flex justify-between items-center mb-3 relative z-10">
                                    <h4 className="font-bold text-teal-800 flex items-center gap-2">
                                        <Sparkles size={16} className="text-yellow-500"/>
                                        AI Tóm Tắt Bệnh Án
                                    </h4>
                                    {!aiSummary && (
                                        <Button 
                                            size="small" 
                                            type="primary" 
                                            onClick={handleSummarizeEMR} 
                                            loading={aiSummaryLoading}
                                            className="bg-teal-600 hover:bg-teal-700 text-xs flex items-center gap-1"
                                        >
                                            <Bot size={14}/> Tạo Tóm Tắt
                                        </Button>
                                    )}
                                </div>
                                {aiSummaryLoading ? (
                                    <div className="flex items-center gap-2 text-teal-600 text-sm">
                                        <Loader2 className="animate-spin" size={16} /> AI đang phân tích toàn bộ lịch sử khám...
                                    </div>
                                ) : aiSummary ? (
                                    <div className="text-sm text-gray-700 leading-relaxed bg-white/60 p-3 rounded-lg border border-teal-100 relative z-10">
                                        {aiSummary}
                                    </div>
                                ) : (
                                    <p className="text-xs text-teal-600 relative z-10">Nhấn nút bên trên để trợ lý AI đọc và tóm tắt tiểu sử bệnh của bệnh nhân.</p>
                                )}
                            </div>
                        )}

                        {emrLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={30} /></div>
                        ) : emrHistory.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Bệnh nhân này chưa có lịch sử khám bệnh.</div>
                        ) : (
                            <Timeline className="mt-4 ml-2">
                                {emrHistory.map(record => (
                                    <Timeline.Item 
                                        key={record._id}
                                        color={record.appointmentId?.status === 'completed' ? 'green' : 'blue'}
                                    >
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 ml-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-wide">
                                                        {dayjs(record.createdAt).format('DD/MM/YYYY')}
                                                    </span>
                                                    <h4 className="font-bold text-gray-900 mt-1">{record.diagnosis || 'Không có chẩn đoán'}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Bác sĩ khám</p>
                                                    <p className="font-medium text-gray-800 text-sm">{record.doctorId?.name}</p>
                                                </div>
                                            </div>
                                            
                                            {record.medicines && record.medicines.length > 0 && (
                                                <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-500 mb-2">ĐƠN THUỐC ĐƯỢC KÊ:</p>
                                                    <ul className="space-y-1.5">
                                                        {record.medicines.map((med, idx) => (
                                                            <li key={idx} className="text-sm flex justify-between items-start">
                                                                <span className="font-medium text-gray-800">
                                                                    • {med.medicineId?.name}
                                                                </span>
                                                                <span className="text-gray-500 text-xs">
                                                                    SL: {med.quantity} {med.medicineId?.unit}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
