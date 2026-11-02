import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Phone, Building2 } from "lucide-react";
import { apiClient } from "../../config/axiosClient";

export default function ClinicsPage() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const res = await apiClient.get('/api/clinics');
            if (res.data.metadata) {
                setClinics(res.data.metadata);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách cơ sở y tế", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClinics = clinics.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Danh sách Cơ sở Y tế</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Hệ thống các bệnh viện, phòng khám uy tín đối tác của chúng tôi.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="relative w-full max-w-lg">
                        <input
                            type="text"
                            placeholder="Tìm kiếm cơ sở y tế theo tên hoặc địa chỉ..."
                            className="w-full bg-white border border-gray-200 text-gray-900 px-5 py-4 pl-12 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredClinics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredClinics.map((clinic) => (
                            <Link 
                                to={`/co-so-y-te/${clinic._id}`} 
                                key={clinic._id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                            >
                                <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {clinic.image ? (
                                        <img 
                                            src={clinic.image} 
                                            alt={clinic.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Building2 size={48} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                        {clinic.name}
                                    </h3>
                                    
                                    <div className="space-y-2 mt-auto">
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{clinic.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Không tìm thấy cơ sở y tế nào</h3>
                        <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
