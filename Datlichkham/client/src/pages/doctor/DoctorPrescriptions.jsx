import { useState, useEffect } from 'react';
import { Table, Tag, Modal, Button, message } from 'antd';
import { FileText, Eye, Download, Search, Loader2 } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import dayjs from 'dayjs';

export default function DoctorPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    
    // View detail modal
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/prescriptions/doctor/my');
            setPrescriptions(res.data.data);
        } catch (error) {
            message.error('Lỗi tải danh sách đơn thuốc');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const filtered = prescriptions.filter(p => 
        p.patientId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.diagnosis?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleDownloadPDF = async (id) => {
        try {
            const response = await apiClient.get(`/api/prescriptions/${id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `don-thuoc-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            message.error('Không thể tải PDF');
        }
    };

    const columns = [
        {
            title: 'Mã HĐ',
            dataIndex: '_id',
            key: '_id',
            render: (id) => <span className="text-xs text-gray-400 font-mono">{id.substring(id.length - 6).toUpperCase()}</span>
        },
        {
            title: 'Bệnh nhân',
            dataIndex: ['patientId', 'fullName'],
            key: 'patient',
            render: (name, record) => (
                <div>
                    <div className="font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-500">{record.patientId?.phone || 'Chưa cập nhật'}</div>
                </div>
            )
        },
        {
            title: 'Ngày kê đơn',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <div>
                    <div className="font-medium">{dayjs(date).format('DD/MM/YYYY')}</div>
                    <div className="text-xs text-gray-500">{dayjs(date).format('HH:mm')}</div>
                </div>
            )
        },
        {
            title: 'Chẩn đoán',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
            render: (text) => <span className="line-clamp-2" title={text}>{text}</span>
        },
        {
            title: 'Số thuốc',
            dataIndex: 'medicines',
            key: 'medicinesCount',
            render: (meds) => (
                <Tag color="blue" className="rounded-full px-3">{meds.length} loại</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            setSelectedPrescription(record);
                            setIsModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors tooltip"
                        title="Xem chi tiết"
                    >
                        <Eye size={16} />
                    </button>
                    <button 
                        onClick={() => handleDownloadPDF(record._id)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors tooltip"
                        title="Tải bản in PDF"
                    >
                        <Download size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="text-teal-600" /> Đơn thuốc đã gửi
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý lịch sử kê đơn của bạn cho bệnh nhân.</p>
                </div>
                
                <div className="relative w-full sm:w-64">
                    <input 
                        type="text" 
                        placeholder="Tìm bệnh nhân, chẩn đoán..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns} 
                    dataSource={filtered} 
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            {/* Modal Chi tiết đơn thuốc */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-900 border-b pb-3">
                        <FileText className="text-teal-600" /> Chi Tiết Đơn Thuốc
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                {selectedPrescription && (
                    <div className="mt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Bệnh nhân</p>
                                <p className="font-semibold text-gray-900">{selectedPrescription.patientId?.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                                <p className="font-semibold text-gray-900">{selectedPrescription.patientId?.birthDate || 'N/A'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Chẩn đoán</p>
                                <p className="font-medium text-red-600">{selectedPrescription.diagnosis}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Danh sách thuốc</h3>
                            <div className="space-y-3">
                                {selectedPrescription.medicines.map((med, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <p className="font-bold text-gray-900">{med.medicineId?.name}</p>
                                                <p className="font-semibold bg-gray-200 px-2 rounded text-gray-700">SL: {med.quantity} {med.medicineId?.unit}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1"><strong>Liều dùng:</strong> {med.dosage}, {med.frequency}</p>
                                            {med.note && <p className="text-sm text-gray-500 mt-0.5 italic">* Lời dặn: {med.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedPrescription.advice && (
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <p className="text-xs text-amber-700 font-bold mb-1 uppercase tracking-wide">Lời dặn của bác sĩ</p>
                                <p className="text-amber-900 font-medium">{selectedPrescription.advice}</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end pt-4 border-t">
                            <Button 
                                type="primary" 
                                icon={<Download size={16} />} 
                                onClick={() => handleDownloadPDF(selectedPrescription._id)}
                                className="bg-teal-600 hover:bg-teal-700 h-10 px-6 rounded-xl font-semibold flex items-center"
                            >
                                Tải Bản In PDF
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
