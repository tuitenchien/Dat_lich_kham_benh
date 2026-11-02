import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { requestGetClinics } from '../../config/ClinicRequest';
import { ChevronLeft, ChevronRight, Loader2, Building2 } from 'lucide-react';

function ClinicCard({ clinic }) {
    return (
        <Link 
            to={`/co-so-y-te/${clinic._id}`}
            className="snap-start bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1 group flex-shrink-0 w-[280px] border border-gray-100 flex flex-col h-full"
        >
            {/* ── Photo ── */}
            <div className="relative bg-gray-100 h-[160px] flex-shrink-0 overflow-hidden flex items-center justify-center">
                {clinic.image ? (
                    <img
                        src={clinic.image}
                        alt={clinic.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <Building2 size={40} className="text-gray-300" />
                )}
            </div>

            {/* ── Info ── */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {clinic.name}
                </h3>
                <p className="text-gray-500 text-xs font-medium line-clamp-2 mt-auto">
                    {clinic.address}
                </p>
            </div>
        </Link>
    );
}

export default function TopClinics() {
    const scrollRef = useRef(null);
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const res = await requestGetClinics();
                setClinics(res.metadata?.slice(0, 10) || []); // Lấy 10 BV
            } catch (error) {
                console.error("Failed to fetch clinics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClinics();
    }, []);

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    };

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
                {/* ── Header row ── */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="section-title">Cơ sở y tế nổi bật</h2>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/co-so-y-te"
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors hidden sm:block"
                        >
                            Xem tất cả
                        </Link>
                        {/* arrow nav */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll(-1)}
                                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 shadow-sm transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => scroll(1)}
                                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 shadow-sm transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Cards row (scrollable) ── */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x items-stretch"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {clinics.map((clinic) => (
                        <ClinicCard key={clinic._id} clinic={clinic} />
                    ))}
                </div>
            </div>
        </section>
    );
}
