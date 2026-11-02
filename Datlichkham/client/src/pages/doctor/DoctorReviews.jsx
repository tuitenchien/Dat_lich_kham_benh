import { useState, useEffect } from 'react';
import { Table, Tag, Modal, Rate, message } from 'antd';
import { Star, MessageSquare, Loader2, User } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import dayjs from 'dayjs';

export default function DoctorReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 5:0, 4:0, 3:0, 2:0, 1:0 } });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/reviews/doctor-reviews/my');
            const data = res.data.metadata || [];
            setReviews(data);

            // Calculate stats
            if (data.length > 0) {
                const total = data.length;
                const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
                const average = sum / total;
                const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
                data.forEach(r => { if(dist[r.rating] !== undefined) dist[r.rating]++; });
                
                setStats({
                    total,
                    average: average.toFixed(1),
                    distribution: dist
                });
            }
        } catch (error) {
            message.error('Lỗi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const columns = [
        {
            title: 'Bệnh nhân',
            dataIndex: 'patientId',
            key: 'patient',
            render: (patient) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {patient?.avatar ? <img src={patient.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-400" />}
                    </div>
                    <span className="font-medium text-gray-900">{patient?.fullName || 'Ẩn danh'}</span>
                </div>
            )
        },
        {
            title: 'Ngày đánh giá',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => <span className="text-gray-500 text-sm">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
        },
        {
            title: 'Mức độ hài lòng',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-500">{rating}.0</span>
                    <Rate disabled value={rating} style={{ fontSize: 14 }} className="text-amber-400" />
                </div>
            )
        },
        {
            title: 'Nhận xét',
            dataIndex: 'comment',
            key: 'comment',
            render: (text) => (
                <div className="max-w-md">
                    {text ? <span className="text-gray-700 italic">"{text}"</span> : <span className="text-gray-400 text-sm">(Không có nhận xét)</span>}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" /> Đánh Giá Của Bệnh Nhân
                </h1>
                <p className="text-gray-500 mt-1">Xem phản hồi và mức độ hài lòng của bệnh nhân sau khi khám.</p>
            </div>

            {/* Overview Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center md:border-r border-gray-100 pr-8">
                    <h2 className="text-5xl font-bold text-gray-900 mb-2">{stats.average}</h2>
                    <Rate disabled value={parseFloat(stats.average)} allowHalf className="text-amber-400 text-xl mb-1" />
                    <p className="text-sm text-gray-500">Dựa trên {stats.total} đánh giá</p>
                </div>
                
                <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.distribution[star];
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <span className="w-12 text-gray-600 font-medium">{star} sao</span>
                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-400 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="w-8 text-right text-gray-500">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns} 
                    dataSource={reviews} 
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
}
