import { useState, useEffect } from 'react';
import { Select, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Flame, Users, Star, UserCheck, Building2, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';

const STATS = [
    {
        icon: <UserCheck size={28} className="text-primary-600" />,
        bg: 'bg-primary-50',
        value: '1,250+',
        label: 'Bác sĩ chuyên gia',
        sub: 'Giàu kinh nghiệm',
    },
    {
        icon: <Building2 size={28} className="text-emerald-500" />,
        bg: 'bg-emerald-50',
        value: '150+',
        label: 'Bệnh viện liên kết',
        sub: 'Uy tín hàng đầu',
    },
    {
        icon: <ShieldCheck size={28} className="text-violet-500" />,
        bg: 'bg-violet-50',
        value: '50,000+',
        label: 'Lượt khám bệnh',
        sub: 'Mỗi tháng',
    },
    {
        icon: <Star size={28} className="text-amber-400" fill="#fbbf24" />,
        bg: 'bg-amber-50',
        value: '4.9/5',
        label: 'Đánh giá người dùng',
        sub: 'Từ 10,000+ đánh giá',
    },
];

export default function HeroSection() {
    const navigate = useNavigate();
    const [searchVal, setSearchVal] = useState('');
    const [specialty, setSpecialty] = useState(null);
    const [hospital, setHospital] = useState(null);
    const [date, setDate] = useState(null);

    const [specialtiesList, setSpecialtiesList] = useState([]);
    const [clinicsList, setClinicsList] = useState([]);

    useEffect(() => {
        // Lấy danh sách chuyên khoa và cơ sở y tế
        Promise.all([apiClient.get('/api/specialties'), apiClient.get('/api/clinics')])
            .then(([specRes, clinRes]) => {
                if (specRes.data.metadata) setSpecialtiesList(specRes.data.metadata);
                if (clinRes.data.metadata) setClinicsList(clinRes.data.metadata);
            })
            .catch((err) => console.error('Error fetching filters for Hero', err));
    }, []);

    const handleSearch = () => {
        let url = '/bac-si?';
        if (searchVal) url += `search=${encodeURIComponent(searchVal)}&`;
        if (specialty) url += `specialty=${specialty}&`;
        if (hospital) url += `clinic=${hospital}&`;
        navigate(url);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#eef6ff] via-[#f0f9ff] to-[#e8f4ff] pt-10 pb-0">
            {/* decorative blobs */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-200/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-cyan-200/30 blur-3xl" />

            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[560px]">
                    {/* ─── LEFT CONTENT ─── */}
                    <div className="py-10">
                        {/* badge */}
                        <div className="inline-flex items-center gap-2 bg-white border border-primary-100 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </span>
                            <span className="text-xs font-semibold text-primary-700">Hệ thống y tế thông minh</span>
                            <span className="text-primary-400">✦</span>
                        </div>

                        {/* headline */}
                        <h1 className="text-[2.6rem] leading-tight font-extrabold text-gray-900 mb-2">
                            Đặt lịch khám bệnh
                        </h1>
                        <h1 className="text-[2.6rem] leading-tight font-extrabold text-gradient mb-5">
                            nhanh chóng &amp; thông minh
                        </h1>

                        {/* subtext */}
                        <p className="text-gray-500 text-[15px] leading-relaxed mb-7 max-w-md">
                            Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu,
                            <br />
                            kết nối bạn với các bác sĩ giỏi và bệnh viện uy tín.
                        </p>

                        {/* search bar */}
                        <div className="relative mb-4">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <input
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm bác sĩ, chuyên khoa..."
                                className="w-full pl-10 pr-4 py-3.5 text-sm bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                            />
                        </div>

                        {/* filter row */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            {/* Chuyên khoa */}
                            <div className="flex flex-col bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm cursor-pointer hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-primary-500">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                        </svg>
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">Chuyên khoa</span>
                                </div>
                                <Select
                                    showSearch
                                    placeholder="Chọn chuyên khoa"
                                    value={specialty}
                                    onChange={setSpecialty}
                                    bordered={false}
                                    className="!text-xs !text-gray-400 !p-0 w-full"
                                    size="small"
                                    options={specialtiesList.map((s) => ({ value: s._id, label: s.name }))}
                                    suffixIcon={
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#9ca3af"
                                            strokeWidth="2.5"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    }
                                    optionFilterProp="label"
                                />
                            </div>

                            {/* Ngày khám */}
                            <div className="flex flex-col bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm cursor-pointer hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-primary-500">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">Ngày khám</span>
                                </div>
                                <DatePicker
                                    placeholder="Chọn ngày khám"
                                    value={date}
                                    onChange={setDate}
                                    bordered={false}
                                    className="!text-xs !p-0 !text-gray-400 w-full"
                                    size="small"
                                    format="DD/MM/YYYY"
                                    suffixIcon={null}
                                />
                            </div>

                            {/* Bệnh viện */}
                            <div className="flex flex-col bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm cursor-pointer hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-primary-500">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">Bệnh viện</span>
                                </div>
                                <Select
                                    showSearch
                                    placeholder="Chọn bệnh viện"
                                    value={hospital}
                                    onChange={setHospital}
                                    bordered={false}
                                    className="!text-xs !text-gray-400 !p-0 w-full"
                                    size="small"
                                    options={clinicsList.map((c) => ({ value: c._id, label: c.name }))}
                                    suffixIcon={
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#9ca3af"
                                            strokeWidth="2.5"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    }
                                    optionFilterProp="label"
                                />
                            </div>
                        </div>

                        {/* CTA button */}
                        <button
                            onClick={handleSearch}
                            className="btn-primary text-base px-7 py-3 rounded-2xl mb-5 group"
                        >
                            Đặt lịch ngay
                            <span className="ml-1 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ChevronRight size={15} />
                            </span>
                        </button>

                        {/* micro stats */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Flame size={15} className="text-orange-500 flex-shrink-0" />
                                <span>
                                    <strong className="text-gray-800">12,500+</strong> lượt đặt lịch trong 24 giờ qua
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                {/* avatar stack */}
                                <div className="flex -space-x-2">
                                    {['bg-blue-400', 'bg-emerald-400', 'bg-violet-400', 'bg-pink-400'].map((c, i) => (
                                        <div
                                            key={i}
                                            className={`w-6 h-6 rounded-full ${c} border-2 border-white flex items-center justify-center`}
                                        >
                                            <Users size={10} className="text-white" />
                                        </div>
                                    ))}
                                </div>
                                <span>
                                    <strong className="text-gray-800">4.9/5</strong> từ 10,000+ bệnh nhân
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT – illustration ─── */}
                    <div className="hidden lg:flex justify-end items-end relative h-[560px]">
                        <img
                            src="/hero-banner.png"
                            alt="Bác sĩ chuyên gia MediCare+"
                            className="h-full w-auto object-contain object-bottom"
                            style={{ mixBlendMode: 'multiply' }}
                        />
                    </div>
                </div>
            </div>

            {/* ─── STATS BAR ─── */}
            <div className="relative z-10 bg-white border-t border-gray-100 mt-0">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
                        {STATS.map((s, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-6">
                                <div
                                    className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}
                                >
                                    {s.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{s.value}</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{s.label}</p>
                                    <p className="text-xs text-gray-400">{s.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
