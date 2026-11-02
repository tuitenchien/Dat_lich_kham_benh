import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { requestGetDoctors } from '../../config/DoctorRequest';
import { Heart, Star, ChevronLeft, ChevronRight, Calendar, Loader2, User } from 'lucide-react';
import ReactSlick from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = ReactSlick.default || ReactSlick;

function DoctorCard({ doctor }) {
    const [liked, setLiked] = useState(false);

    return (
        <div className="h-full px-2 py-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-gray-100">
                {/* ── Photo ── */}
                <div className="relative bg-gradient-to-br from-[#eef6ff] to-[#dbeffe] h-[220px] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {doctor.image ? (
                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <User size={60} className="text-blue-200" />
                    )}

                    {/* Online badge */}
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm bg-emerald-500 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Online
                    </span>

                    {/* Favorite */}
                    <button
                        onClick={() => setLiked((v) => !v)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                        <Heart size={15} className={liked ? 'text-rose-500 fill-rose-500' : 'text-gray-400'} />
                    </button>
                </div>

                {/* ── Info ── */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1 line-clamp-2">
                        {doctor.name}
                    </h3>
                    <p className="text-primary-600 text-xs font-semibold mb-1 line-clamp-1">
                        {doctor.specialtyId?.name}
                    </p>
                    <p className="text-gray-500 text-[11px] font-medium mb-3 line-clamp-1">{doctor.clinicId?.name}</p>

                    {/* Rating + Price */}
                    <div className="flex items-center justify-between mt-auto mb-4 pt-2">
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-gray-800">5.0</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                doctor.price || 0,
                            )}
                        </span>
                    </div>

                    {/* CTA */}
                    <Link to={`/bac-si/${doctor._id}`}>
                        <button className="w-full bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 group/btn">
                            <Calendar size={14} />
                            Đặt lịch khám
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function FeaturedDoctors() {
    const scrollRef = useRef(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await requestGetDoctors();
                setDoctors(res.metadata?.slice(0, 10) || []); // Lấy 10 bác sĩ
            } catch (error) {
                console.error('Failed to fetch doctors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const next = () => {
        scrollRef.current?.slickNext();
    };
    const previous = () => {
        scrollRef.current?.slickPrev();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <section className="py-14 bg-white">
            <div className="container-custom">
                {/* ── Header row ── */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="section-title">Bác sĩ nổi bật từ xa</h2>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/bac-si"
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors hidden sm:block"
                        >
                            Xem tất cả
                        </Link>
                        {/* arrow nav */}
                        <div className="flex gap-2">
                            <button
                                onClick={previous}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={next}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Cards row (Slick Slider) ── */}
                <div className="mx-[-8px]">
                    <Slider ref={scrollRef} {...settings}>
                        {doctors.map((doc) => (
                            <div key={doc._id}>
                                <DoctorCard doctor={doc} />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}
