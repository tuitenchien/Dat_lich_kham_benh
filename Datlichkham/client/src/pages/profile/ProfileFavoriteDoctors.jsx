import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { Heart, Loader2, Stethoscope, MapPin, Star } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import Context from '../../store/Context';

function DoctorFavoriteCard({ doctor, onRemove }) {
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        setRemoving(true);
        try {
            await apiClient.delete(`/api/users/favorite-doctor/${doctor._id}`);
            onRemove(doctor._id);
            message.success('Đã xóa khỏi danh sách yêu thích');
        } catch {
            message.error('Lỗi khi xóa');
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {doctor.image
                    ? <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    : <Stethoscope size={28} className="text-gray-300" />}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{doctor.name}</h3>
                <p className="text-primary-600 text-xs font-medium">{doctor.specialtyId?.name}</p>
                {doctor.clinicId?.name && (
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                        <MapPin size={11} /> {doctor.clinicId.name}
                    </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-500">5.0</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
                <Link to={`/bac-si/${doctor._id}`}>
                    <button className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors w-full">
                        Đặt lịch
                    </button>
                </Link>
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="text-xs text-red-500 border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 rounded-xl font-semibold transition-colors"
                >
                    {removing ? '...' : 'Bỏ thích'}
                </button>
            </div>
        </div>
    );
}

export default function ProfileFavoriteDoctors() {
    const { dataUser } = useContext(Context);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                // Dùng danh sách favoriteDoctor từ user profile
                const res = await apiClient.get('/api/users/favorite-doctors');
                setDoctors(res.data?.metadata || []);
            } catch {
                // Fallback: nếu chưa có API, hiển thị rỗng
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemove = id => setDoctors(prev => prev.filter(d => d._id !== id));

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                    <Heart size={22} className="text-red-500 fill-red-100" />
                    Bác sĩ yêu thích
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Danh sách bác sĩ bạn đã đánh dấu yêu thích — dễ dàng đặt lịch lần sau
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary-500" size={36} />
                </div>
            ) : doctors.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                    <Heart size={52} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-700 mb-2">Chưa có bác sĩ yêu thích</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Vào trang chi tiết bác sĩ và nhấn ❤️ để thêm vào danh sách yêu thích
                    </p>
                    <Link to="/">
                        <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm">
                            Khám phá bác sĩ
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {doctors.map(doc => (
                        <DoctorFavoriteCard key={doc._id} doctor={doc} onRemove={handleRemove} />
                    ))}
                </div>
            )}
        </div>
    );
}
