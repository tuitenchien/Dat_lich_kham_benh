import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Activity } from "lucide-react";
import { apiClient } from "../../config/axiosClient";

export default function SpecialtiesPage() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const res = await apiClient.get('/api/specialties');
            if (res.data.metadata) {
                setSpecialties(res.data.metadata);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách chuyên khoa", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSpecialties = specialties.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Danh sách Chuyên khoa</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Khám phá các chuyên khoa y tế và tìm bác sĩ phù hợp với nhu cầu sức khỏe của bạn.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="relative w-full max-w-lg">
                        <input
                            type="text"
                            placeholder="Tìm kiếm chuyên khoa..."
                            className="w-full bg-white border border-gray-200 text-gray-900 px-5 py-4 pl-12 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredSpecialties.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredSpecialties.map((spec) => (
                            <Link 
                                to={`/bac-si?specialty=${spec._id}`} 
                                key={spec._id}
                                className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                    {spec.image ? (
                                        <img src={spec.image} alt={spec.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Activity size={32} className="text-primary-600" />
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {spec.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                    {spec.description || 'Khám và điều trị các bệnh lý liên quan.'}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Activity size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Không tìm thấy chuyên khoa nào</h3>
                        <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
