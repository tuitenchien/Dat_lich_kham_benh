import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestGetSpecialties } from '../../config/SpecialtyRequest';
import { Loader2, HeartPulse } from 'lucide-react';

export default function Specialties() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await requestGetSpecialties();
                setSpecialties(res.metadata?.slice(0, 8) || []); // Lấy 8 chuyên khoa đầu tiên
            } catch (error) {
                console.error("Failed to fetch specialties", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSpecialties();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-[#f8faff]">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <section className="py-14 bg-[#f8faff]">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="section-title">Chuyên khoa phổ biến</h2>
                    <Link to="/chuyen-khoa" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        Xem tất cả →
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {specialties.map((sp) => (
                        <Link
                            key={sp._id}
                            to={`/chuyen-khoa/${sp._id}`}
                            className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                {sp.image ? (
                                    <img src={sp.image} alt={sp.name} className="w-full h-full object-cover" />
                                ) : (
                                    <HeartPulse size={30} />
                                )}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
                                {sp.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
