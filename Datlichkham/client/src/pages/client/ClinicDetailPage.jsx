import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestGetClinicById } from '../../config/ClinicRequest';
import { Loader2, MapPin, Building2 } from 'lucide-react';

export default function ClinicDetailPage() {
    const { id } = useParams();
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gioi-thieu');

    // Ref cho các section để scroll
    const introRef = useRef(null);
    const strengthRef = useRef(null);
    const equipRef = useRef(null);
    const processRef = useRef(null);

    useEffect(() => {
        const fetchClinic = async () => {
            try {
                const res = await requestGetClinicById(id);
                setClinic(res.metadata);
            } catch (error) {
                console.error("Lỗi khi tải thông tin phòng khám", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClinic();
    }, [id]);

    const scrollToSection = (ref, tabName) => {
        setActiveTab(tabName);
        if (ref.current) {
            // Trừ đi height của header và sticky nav
            const offset = 140; 
            const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy Cơ sở y tế</h2>
                <Link to="/" className="text-primary-600 hover:underline mt-4">Về trang chủ</Link>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen pb-20">
            {/* ── Cover Image & Basic Info ── */}
            <div className="bg-white border-b relative">
                <div className="h-[250px] md:h-[350px] w-full bg-gray-200 relative overflow-hidden">
                    {clinic.image ? (
                        <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover blur-sm brightness-75 scale-105" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-800 to-primary-600" />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                
                <div className="container-custom relative">
                    <div className="flex flex-col md:flex-row gap-6 -mt-20 relative z-10 pb-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {clinic.image ? (
                                <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={50} className="text-gray-300" />
                            )}
                        </div>
                        <div className="flex flex-col justify-end pt-4 md:pt-20">
                            <h1 className="text-2xl md:text-3xl font-bold text-white md:text-gray-900 mb-2 drop-shadow-md md:drop-shadow-none">
                                {clinic.name}
                            </h1>
                            <div className="flex items-start gap-2 text-sm text-gray-200 md:text-gray-600">
                                <MapPin size={18} className="shrink-0 mt-0.5" />
                                <span>{clinic.address}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sticky Navigation Bar ── */}
            <div className="sticky top-[64px] md:top-[72px] z-40 bg-white border-b shadow-sm">
                <div className="container-custom">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        <button 
                            onClick={() => scrollToSection(introRef, 'gioi-thieu')}
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'gioi-thieu' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            Giới thiệu
                        </button>
                        <button 
                            onClick={() => scrollToSection(strengthRef, 'the-manh')}
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'the-manh' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            Thế mạnh chuyên môn
                        </button>
                        <button 
                            onClick={() => scrollToSection(equipRef, 'trang-thiet-bi')}
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'trang-thiet-bi' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            Trang thiết bị
                        </button>
                        <button 
                            onClick={() => scrollToSection(processRef, 'quy-trinh')}
                            className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'quy-trinh' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            Quy trình đi khám
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content Sections ── */}
            <div className="container-custom mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột chính hiển thị bài viết */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Giới thiệu */}
                    <div ref={introRef} className="bg-white rounded-2xl p-6 shadow-sm scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Giới thiệu chung</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {clinic.introduction || "Đang cập nhật..."}
                        </div>
                    </div>

                    {/* Thế mạnh */}
                    <div ref={strengthRef} className="bg-white rounded-2xl p-6 shadow-sm scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Thế mạnh chuyên môn</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {clinic.professionalStrengths || "Đang cập nhật..."}
                        </div>
                    </div>

                    {/* Trang thiết bị */}
                    <div ref={equipRef} className="bg-white rounded-2xl p-6 shadow-sm scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Trang thiết bị</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {clinic.equipment || "Đang cập nhật..."}
                        </div>
                    </div>

                    {/* Quy trình */}
                    <div ref={processRef} className="bg-white rounded-2xl p-6 shadow-sm scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Quy trình đi khám</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {clinic.examinationProcess || "Đang cập nhật..."}
                        </div>
                    </div>

                </div>

                {/* Cột Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Box Đặt lịch trống */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 shadow-lg text-white sticky top-36">
                        <h3 className="text-lg font-bold mb-2">Bạn muốn đặt lịch khám?</h3>
                        <p className="text-sm text-primary-100 mb-6">Chọn các bác sĩ giỏi đang công tác tại {clinic.name} để đặt hẹn ngay.</p>
                        <Link to="/bac-si">
                            <button className="w-full bg-white text-primary-700 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors shadow-sm">
                                Xem danh sách Bác sĩ
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
