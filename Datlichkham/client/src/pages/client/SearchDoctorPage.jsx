import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, MapPin, Star, Filter, Calendar } from "lucide-react";
import { Select, Rate, Tag } from "antd";
import { apiClient } from "../../config/axiosClient";

export default function SearchDoctorPage() {
    const [searchParams] = useSearchParams();
    const initialSpecialty = searchParams.get('specialty') || undefined;
    const initialClinic = searchParams.get('clinic') || undefined;
    const initialSearch = searchParams.get('search') || "";

    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [clinics, setClinics] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState(initialSearch);
    const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
    const [selectedClinic, setSelectedClinic] = useState(initialClinic);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSpecialty, selectedClinic]);

    const fetchFilters = async () => {
        try {
            const [specRes, clinicRes] = await Promise.all([
                apiClient.get('/api/specialties'),
                apiClient.get('/api/clinics')
            ]);
            if (specRes.data.metadata) setSpecialties(specRes.data.metadata);
            if (clinicRes.data.metadata) setClinics(clinicRes.data.metadata);
        } catch (error) {
            console.error("Lỗi tải bộ lọc", error);
        }
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            let url = '/api/doctors?';
            if (selectedSpecialty) url += `specialtyId=${selectedSpecialty}&`;
            if (selectedClinic) url += `clinicId=${selectedClinic}&`;
            
            const res = await apiClient.get(url);
            if (res.data.metadata) {
                setDoctors(res.data.metadata);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách bác sĩ", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => 
        doc.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Tìm kiếm Bác sĩ</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Tìm kiếm và đặt lịch khám với các chuyên gia y tế hàng đầu tại mạng lưới của chúng tôi.
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10 sticky top-20 z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm theo tên bác sĩ..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-5 py-3 pl-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        
                        <div className="flex-1">
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn chuyên khoa"
                                className="w-full h-[50px] custom-select"
                                value={selectedSpecialty}
                                onChange={setSelectedSpecialty}
                                optionFilterProp="children"
                            >
                                {specialties.map(spec => (
                                    <Select.Option key={spec._id} value={spec._id}>{spec.name}</Select.Option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className="flex-1">
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn cơ sở y tế"
                                className="w-full h-[50px] custom-select"
                                value={selectedClinic}
                                onChange={setSelectedClinic}
                                optionFilterProp="children"
                            >
                                {clinics.map(clinic => (
                                    <Select.Option key={clinic._id} value={clinic._id}>{clinic.name}</Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-6 animate-pulse">
                                <div className="w-32 h-32 bg-gray-200 rounded-2xl"></div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="space-y-6">
                        {filteredDoctors.map(doctor => (
                            <div key={doctor._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row gap-6">
                                {/* Avatar */}
                                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 flex justify-center items-center">
                                    {doctor.image ? (
                                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">👨‍⚕️</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                                    {doctor.name}
                                                </h3>
                                                <p className="text-primary-600 font-semibold mb-3">
                                                    {doctor.specialtyId?.name || 'Đang cập nhật'}
                                                </p>
                                            </div>
                                            <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-lg text-yellow-600 font-bold text-sm">
                                                <Star size={14} className="fill-current mr-1" />
                                                4.9 (120+)
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mt-4 text-gray-600 text-sm">
                                            <p className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span className="font-medium text-gray-900">{doctor.clinicId?.name || 'Phòng khám chuyên khoa'}</span>
                                            </p>
                                            <p className="flex items-start gap-2 text-gray-500 line-clamp-2 mt-1">
                                                {doctor.description || 'Bác sĩ có nhiều năm kinh nghiệm trong việc khám và điều trị bệnh nhân.'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-50">
                                        <div className="text-sm">
                                            Giá khám: <span className="text-lg font-bold text-primary-600 ml-1">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.price || 300000)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                            <Link 
                                                to={`/bac-si/${doctor._id}`}
                                                className="flex-1 sm:flex-none text-center px-6 py-2.5 rounded-xl border-2 border-primary-100 text-primary-600 font-semibold hover:bg-primary-50 hover:border-primary-200 transition-colors"
                                            >
                                                Xem chi tiết
                                            </Link>
                                            <Link 
                                                to={`/bac-si/${doctor._id}?booking=true`}
                                                className="flex-1 sm:flex-none text-center px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md hover:shadow-lg shadow-primary-200 transition-all"
                                            >
                                                Đặt lịch ngay
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Filter size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Không tìm thấy bác sĩ phù hợp</h3>
                        <p className="text-gray-500 mt-2">Vui lòng thay đổi tiêu chí tìm kiếm hoặc xóa bớt bộ lọc.</p>
                        <button 
                            onClick={() => {
                                setSearchText("");
                                setSelectedSpecialty(undefined);
                                setSelectedClinic(undefined);
                            }}
                            className="mt-6 text-primary-600 font-medium hover:underline"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .custom-select .ant-select-selector {
                    border-radius: 1rem !important;
                    height: 50px !important;
                    align-items: center;
                    border: 1px solid #e5e7eb !important;
                    background-color: #f9fafb !important;
                }
                .custom-select:hover .ant-select-selector {
                    border-color: #0ea5e9 !important;
                }
                .custom-select.ant-select-focused .ant-select-selector {
                    border-color: #0ea5e9 !important;
                    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2) !important;
                }
            `}</style>
        </div>
    );
}
