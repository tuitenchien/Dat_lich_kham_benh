import { useState, useContext, useEffect, useRef } from 'react';
import { message, DatePicker, Select } from 'antd';
import {
    User, Phone, Mail, MapPin, Calendar, Droplets,
    Ruler, Weight, Shield, Save, Camera, Edit3, Check, X, Loader2
} from 'lucide-react';
import Context from '../../store/Context';
import { apiClient } from '../../config/axiosClient';
import dayjs from 'dayjs';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function InfoRow({ label, icon, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 text-gray-400 sm:w-44 flex-shrink-0 text-sm">
                {icon}
                <span>{label}</span>
            </div>
            <div className="flex-grow text-sm text-gray-800">{children}</div>
        </div>
    );
}

function EditableField({ label, value, onChange, type = 'text', placeholder }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 resize-none transition"
                    rows={2}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

export default function ProfileInfo() {
    const { dataUser } = useContext(Context);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        fullName: '', phone: '', gender: '', birthDay: null,
        address: { street: '', ward: '', district: '', city: '' },
        medicalInfo: { bloodType: '', height: '', weight: '', insuranceNumber: '' },
    });

    useEffect(() => {
        if (dataUser?.fullName) {
            setForm({
                fullName: dataUser.fullName || '',
                phone: dataUser.phone || '',
                gender: dataUser.gender || '',
                birthDay: dataUser.birthDay ? dayjs(dataUser.birthDay) : null,
                address: {
                    street:   dataUser.address?.street   || '',
                    ward:     dataUser.address?.ward     || '',
                    district: dataUser.address?.district || '',
                    city:     dataUser.address?.city     || '',
                },
                medicalInfo: {
                    bloodType:       dataUser.medicalInfo?.bloodType       || '',
                    height:          dataUser.medicalInfo?.height          || '',
                    weight:          dataUser.medicalInfo?.weight          || '',
                    insuranceNumber: dataUser.medicalInfo?.insuranceNumber || '',
                },
            });
        }
    }, [dataUser]);

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const updateAddress = (field, value) => setForm(f => ({ ...f, address: { ...f.address, [field]: value } }));
    const updateMedical = (field, value) => setForm(f => ({ ...f, medicalInfo: { ...f.medicalInfo, [field]: value } }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.put('/api/users/update', {
                ...form,
                birthDay: form.birthDay?.toISOString() || null,
            });
            message.success('Cập nhật thông tin thành công!');
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploadingAvatar(true);
        try {
            await apiClient.post('/api/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Cập nhật ảnh đại diện thành công!');
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi khi tải ảnh lên');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const fullAddress = [
        dataUser?.address?.street,
        dataUser?.address?.ward,
        dataUser?.address?.district,
        dataUser?.address?.city,
    ].filter(Boolean).join(', ');

    const genderLabel = { male: 'Nam', female: 'Nữ', other: 'Khác' };

    return (
        <div className="space-y-6">
            {/* ── Card avatar + tên ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {dataUser?.avatar ? (
                        <img src={dataUser.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover shadow" />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow">
                            <span className="text-white text-3xl font-bold">
                                {dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                    )}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {uploadingAvatar ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                    />
                </div>

                {/* Info */}
                <div className="flex-grow text-center sm:text-left">
                    <h1 className="text-xl font-bold text-gray-900">{dataUser?.fullName}</h1>
                    <p className="text-gray-400 text-sm">{dataUser?.email}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Hoạt động
                        </span>
                        {dataUser?.isVerified && (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                                <Check size={11} /> Đã xác thực
                            </span>
                        )}
                    </div>
                </div>

                {/* Nút chỉnh sửa */}
                <div className="flex-shrink-0">
                    {editing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditing(false)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                <X size={15} /> Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70"
                            >
                                <Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Edit3 size={15} /> Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>

            {/* ── Form / View ── */}
            {editing ? (
                /* ─ Edit Mode ─ */
                <div className="space-y-5">
                    {/* Thông tin cơ bản */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <User size={18} className="text-primary-600" />
                            Thông tin cơ bản
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditableField label="Họ và tên" value={form.fullName} onChange={v => update('fullName', v)} placeholder="Nguyễn Văn A" />
                            <EditableField label="Số điện thoại" value={form.phone} onChange={v => update('phone', v)} placeholder="0901 234 567" />
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Giới tính</label>
                                <Select
                                    className="w-full"
                                    size="large"
                                    value={form.gender || undefined}
                                    onChange={v => update('gender', v)}
                                    placeholder="Chọn giới tính"
                                    options={[
                                        { value: 'male', label: 'Nam' },
                                        { value: 'female', label: 'Nữ' },
                                        { value: 'other', label: 'Khác' },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ngày sinh</label>
                                <DatePicker
                                    className="w-full"
                                    size="large"
                                    format="DD/MM/YYYY"
                                    value={form.birthDay}
                                    onChange={v => update('birthDay', v)}
                                    disabledDate={c => c && c > dayjs()}
                                    placeholder="DD/MM/YYYY"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Địa chỉ */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <MapPin size={18} className="text-primary-600" />
                            Địa chỉ
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <EditableField label="Số nhà, tên đường" value={form.address.street} onChange={v => updateAddress('street', v)} placeholder="123 Đường Lê Lợi" />
                            </div>
                            <EditableField label="Phường / Xã" value={form.address.ward} onChange={v => updateAddress('ward', v)} placeholder="Phường Bến Nghé" />
                            <EditableField label="Quận / Huyện" value={form.address.district} onChange={v => updateAddress('district', v)} placeholder="Quận 1" />
                            <div className="sm:col-span-2">
                                <EditableField label="Tỉnh / Thành phố" value={form.address.city} onChange={v => updateAddress('city', v)} placeholder="TP. Hồ Chí Minh" />
                            </div>
                        </div>
                    </div>

                    {/* Thông tin y tế */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <Shield size={18} className="text-primary-600" />
                            Thông tin y tế
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nhóm máu</label>
                                <Select
                                    className="w-full"
                                    size="large"
                                    value={form.medicalInfo.bloodType || undefined}
                                    onChange={v => updateMedical('bloodType', v)}
                                    placeholder="Chọn nhóm máu"
                                    options={BLOOD_TYPES.map(b => ({ value: b, label: b }))}
                                />
                            </div>
                            <EditableField label="Số BHYT" value={form.medicalInfo.insuranceNumber} onChange={v => updateMedical('insuranceNumber', v)} placeholder="VD: DN4010000XXXXXXX" />
                            <EditableField label="Chiều cao (cm)" value={form.medicalInfo.height} onChange={v => updateMedical('height', v)} type="number" placeholder="170" />
                            <EditableField label="Cân nặng (kg)" value={form.medicalInfo.weight} onChange={v => updateMedical('weight', v)} type="number" placeholder="65" />
                        </div>
                    </div>
                </div>
            ) : (
                /* ─ View Mode ─ */
                <div className="space-y-5">
                    {/* Thông tin cơ bản */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={18} className="text-primary-600" />
                            Thông tin cơ bản
                        </h2>
                        <InfoRow label="Họ và tên" icon={<User size={15} />}>
                            <span className="font-semibold">{dataUser?.fullName || '—'}</span>
                        </InfoRow>
                        <InfoRow label="Email" icon={<Mail size={15} />}>
                            {dataUser?.email || '—'}
                        </InfoRow>
                        <InfoRow label="Số điện thoại" icon={<Phone size={15} />}>
                            {dataUser?.phone || <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                        <InfoRow label="Giới tính" icon={<User size={15} />}>
                            {genderLabel[dataUser?.gender] || <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                        <InfoRow label="Ngày sinh" icon={<Calendar size={15} />}>
                            {dataUser?.birthDay
                                ? dayjs(dataUser.birthDay).format('DD/MM/YYYY')
                                : <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                    </div>

                    {/* Địa chỉ */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-primary-600" />
                            Địa chỉ
                        </h2>
                        <InfoRow label="Địa chỉ" icon={<MapPin size={15} />}>
                            {fullAddress || <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                    </div>

                    {/* Thông tin y tế */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-primary-600" />
                            Thông tin y tế
                        </h2>
                        <InfoRow label="Nhóm máu" icon={<Droplets size={15} />}>
                            {dataUser?.medicalInfo?.bloodType
                                ? <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">{dataUser.medicalInfo.bloodType}</span>
                                : <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                        <InfoRow label="Chiều cao" icon={<Ruler size={15} />}>
                            {dataUser?.medicalInfo?.height ? `${dataUser.medicalInfo.height} cm` : <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                        <InfoRow label="Cân nặng" icon={<Weight size={15} />}>
                            {dataUser?.medicalInfo?.weight ? `${dataUser.medicalInfo.weight} kg` : <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                        <InfoRow label="Số BHYT" icon={<Shield size={15} />}>
                            {dataUser?.medicalInfo?.insuranceNumber || <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                        </InfoRow>
                    </div>
                </div>
            )}
        </div>
    );
}
