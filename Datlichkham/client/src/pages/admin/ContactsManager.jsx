import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message, Popconfirm, Select, Input, Tooltip, Modal, Descriptions } from 'antd';
import { MessageSquare, CheckCircle, Mail, Phone, User, Calendar, Search } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import dayjs from 'dayjs';

export default function ContactsManager() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchContacts = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: pagination.pageSize };
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const res = await apiClient.get('/api/contacts', { params });
            const { contacts, total } = res.data.metadata;
            
            setContacts(contacts);
            setPagination(prev => ({ ...prev, current: page, total }));
        } catch (error) {
            message.error('Lỗi khi tải danh sách liên hệ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(1);
    }, [statusFilter]);

    const handleTableChange = (newPagination) => {
        fetchContacts(newPagination.current);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await apiClient.put(`/api/contacts/${id}/status`, { status });
            message.success('Cập nhật trạng thái thành công');
            fetchContacts(pagination.current);
            if (selectedContact && selectedContact._id === id) {
                setSelectedContact({ ...selectedContact, status });
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const showContactDetails = (record) => {
        setSelectedContact(record);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Khách hàng',
            key: 'fullName',
            render: (_, record) => (
                <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <User size={14} className="text-gray-400" /> {record.fullName}
                    </div>
                    <div className="text-xs text-gray-500 flex flex-col mt-1 space-y-1">
                        <span className="flex items-center gap-1"><Mail size={12}/> {record.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12}/> {record.phone}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Chủ đề',
            dataIndex: 'subject',
            key: 'subject',
            render: (text) => <span className="font-medium text-gray-700">{text}</span>
        },
        {
            title: 'Thời gian gửi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar size={14} />
                    {dayjs(date).format('DD/MM/YYYY HH:mm')}
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'resolved' ? 'green' : 'orange'} className="rounded-full px-3 py-1 border-0 font-medium">
                    {status === 'resolved' ? 'Đã xử lý' : 'Chờ xử lý'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            type="text" 
                            icon={<MessageSquare size={18} />} 
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => showContactDetails(record)}
                        />
                    </Tooltip>
                    
                    {record.status === 'pending' && (
                        <Popconfirm
                            title="Xác nhận đã xử lý?"
                            description="Đánh dấu liên hệ này là đã xử lý xong?"
                            onConfirm={() => handleUpdateStatus(record._id, 'resolved')}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Tooltip title="Đánh dấu hoàn tất">
                                <Button 
                                    type="text" 
                                    icon={<CheckCircle size={18} />} 
                                    className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-500" />
                        Quản lý Liên hệ
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý phản hồi và yêu cầu từ người dùng</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-40"
                        options={[
                            { value: 'all', label: 'Tất cả trạng thái' },
                            { value: 'pending', label: 'Chờ xử lý' },
                            { value: 'resolved', label: 'Đã xử lý' },
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns} 
                    dataSource={contacts} 
                    rowKey="_id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    className="custom-table"
                />
            </div>

            {/* Chi tiết liên hệ */}
            <Modal
                title={<div className="text-lg font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={20} className="text-blue-500" /> Chi tiết liên hệ</div>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={
                    selectedContact?.status === 'pending' ? [
                        <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>,
                        <Button 
                            key="resolve" 
                            type="primary" 
                            className="bg-green-500 hover:bg-green-600 border-green-500"
                            onClick={() => {
                                handleUpdateStatus(selectedContact._id, 'resolved');
                                setIsModalVisible(false);
                            }}
                        >
                            Đánh dấu đã xử lý
                        </Button>
                    ] : [
                        <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>Đóng</Button>
                    ]
                }
                width={600}
                centered
            >
                {selectedContact && (
                    <div className="mt-4">
                        <Descriptions column={1} bordered size="small" labelStyle={{ width: '130px', fontWeight: 'bold' }}>
                            <Descriptions.Item label="Họ và tên">{selectedContact.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedContact.phone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedContact.email}</Descriptions.Item>
                            <Descriptions.Item label="Thời gian gửi">{dayjs(selectedContact.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedContact.status === 'resolved' ? 'green' : 'orange'}>
                                    {selectedContact.status === 'resolved' ? 'Đã xử lý' : 'Chờ xử lý'}
                                </Tag>
                                {selectedContact.resolvedAt && (
                                    <span className="text-xs text-gray-500">
                                        (Lúc {dayjs(selectedContact.resolvedAt).format('HH:mm DD/MM/YYYY')})
                                    </span>
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-bold text-gray-900 mb-2 border-b pb-2">Nội dung tin nhắn:</h4>
                            <div className="font-semibold text-blue-800 mb-2">Chủ đề: {selectedContact.subject}</div>
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedContact.message}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
