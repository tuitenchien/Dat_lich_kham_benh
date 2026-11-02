import { useState, useEffect } from 'react';
import { DatePicker, message, Spin, Checkbox, Button } from 'antd';
import { CalendarDays, Lock, Unlock, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import dayjs from 'dayjs';

const TIME_SLOTS = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00",
    "18:00 - 19:00", "19:00 - 20:00"
];

export default function DoctorSchedules() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSlots, setActiveSlots] = useState([]);

    const fetchSchedules = async (date) => {
        if (!date) return;
        setLoading(true);
        try {
            const dateStr = date.format('DD/MM/YYYY');
            const res = await apiClient.get(`/api/schedules/doctor/my?date=${dateStr}`);
            const schedules = res.data.metadata || [];
            setActiveSlots(schedules.map(s => s.timeSlot));
        } catch (error) {
            message.error('Lỗi tải lịch khám');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules(selectedDate);
    }, [selectedDate]);

    const handleSave = async () => {
        if (!selectedDate) return;
        setSaving(true);
        try {
            const payload = {
                date: selectedDate.format('DD/MM/YYYY'),
                timeSlots: activeSlots
            };
            await apiClient.post('/api/schedules/doctor/bulk-create', payload);
            message.success('Đã cập nhật lịch làm việc!');
            fetchSchedules(selectedDate);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu lịch làm việc');
        } finally {
            setSaving(false);
        }
    };

    const toggleSlot = (slot) => {
        if (activeSlots.includes(slot)) {
            setActiveSlots(activeSlots.filter(s => s !== slot));
        } else {
            setActiveSlots([...activeSlots, slot]);
        }
    };

    const lockFullDay = () => {
        setActiveSlots([]);
    };

    const unlockFullDay = () => {
        setActiveSlots(TIME_SLOTS);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="text-primary-600" /> Quản Lý Lịch Làm Việc & Ngày Nghỉ
                </h1>
                <p className="text-gray-500 mt-1">Chủ động thiết lập các khung giờ nhận bệnh nhân hoặc khóa lịch những ngày bạn bận/nghỉ phép.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Chọn ngày */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn ngày muốn cấu hình</label>
                        <DatePicker 
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="w-full h-12 rounded-xl text-lg"
                            format="DD/MM/YYYY"
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                            allowClear={false}
                        />
                        
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                            <p className="text-xs text-gray-500 font-medium">CÔNG CỤ NHANH</p>
                            <button 
                                onClick={lockFullDay}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-semibold transition-colors border border-red-100"
                            >
                                <Lock size={16} /> Nghỉ phép cả ngày (Khóa toàn bộ)
                            </button>
                            <button 
                                onClick={unlockFullDay}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-3 rounded-xl font-semibold transition-colors border border-emerald-100"
                            >
                                <Unlock size={16} /> Mở toàn bộ khung giờ
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <h4 className="font-bold text-amber-800 text-sm mb-2">Lưu ý quan trọng:</h4>
                        <ul className="text-xs text-amber-700 space-y-2 list-disc pl-4">
                            <li>Bạn không thể "Khóa" hoặc "Bỏ chọn" những khung giờ <strong>đã có bệnh nhân đặt lịch</strong>.</li>
                            <li>Bệnh nhân chỉ thấy những khung giờ màu Xanh được bạn mở trên hệ thống.</li>
                        </ul>
                    </div>
                </div>

                {/* Cột phải: Chọn khung giờ */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Các khung giờ mở khám ngày {selectedDate?.format('DD/MM/YYYY')}
                            </h2>
                            <div className="flex gap-4 text-xs font-medium">
                                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary-100 border border-primary-500"></div> Đang mở</span>
                                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></div> Đang khóa</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary-500" size={32} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 content-start">
                                {TIME_SLOTS.map(slot => {
                                    const isActive = activeSlots.includes(slot);
                                    return (
                                        <div 
                                            key={slot}
                                            onClick={() => toggleSlot(slot)}
                                            className={`
                                                cursor-pointer border-2 rounded-xl p-3 flex items-center justify-between transition-all select-none
                                                ${isActive 
                                                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <span className="font-bold text-sm tracking-wide">{slot}</span>
                                            {isActive && <CheckCircle2 size={18} className="text-primary-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <Button 
                                type="primary" 
                                size="large"
                                onClick={handleSave} 
                                loading={saving}
                                className="bg-primary-600 hover:bg-primary-700 h-12 px-8 rounded-xl font-bold text-sm flex items-center"
                            >
                                Lưu Lịch Làm Việc
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
