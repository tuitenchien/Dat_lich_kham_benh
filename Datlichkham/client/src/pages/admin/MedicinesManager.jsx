import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm } from 'antd';
import { Plus, Edit, Trash2, Search, Pill } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import dayjs from 'dayjs';

export default function MedicinesManager() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/medicines', { params: { search: searchText } });
            setMedicines(res.data.data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách thuốc');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        fetchMedicines();
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            form.setFieldsValue(item);
        } else {
            form.resetFields();
            form.setFieldsValue({ status: 'active', unit: 'Viên' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            if (editingItem) {
                await apiClient.put(`/api/medicines/${editingItem._id}`, values);
                message.success('Cập nhật thuốc thành công');
            } else {
                await apiClient.post('/api/medicines', values);
                message.success('Thêm thuốc mới thành công');
            }
            setIsModalOpen(false);
            fetchMedicines();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/api/medicines/${id}`);
            message.success('Đã vô hiệu hóa thuốc');
            fetchMedicines();
        } catch (error) {
            message.error('Lỗi khi xóa thuốc');
        }
    };

    const columns = [
        {
            title: 'Tên thuốc',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-semibold text-primary-700">{text}</span>
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Cách dùng mặc định',
            dataIndex: 'usage',
            key: 'usage',
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock) => (
                <span className={`font-medium ${stock < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                    {stock}
                </span>
            )
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <span className="font-semibold text-primary-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)}
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'default'} className="px-3 py-1 rounded-full font-medium">
                    {status === 'active' ? 'Đang sử dụng' : 'Ngưng sử dụng'}
                </Tag>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <button 
                        onClick={() => handleOpenModal(record)}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    >
                        <Edit size={16} />
                    </button>
                    {record.status === 'active' && (
                        <Popconfirm
                            title="Xóa thuốc"
                            description="Bạn có chắc chắn muốn ngưng sử dụng thuốc này?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Pill className="text-primary-600" /> Quản lý Kho Thuốc
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý danh sách các loại thuốc để bác sĩ kê đơn</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Input
                        placeholder="Tìm tên thuốc..."
                        prefix={<Search size={18} className="text-gray-400" />}
                        className="w-full sm:w-64 rounded-xl py-2"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={() => fetchMedicines()}
                    />
                    <button 
                        onClick={() => fetchMedicines()}
                        className="btn-outline px-4 py-2 bg-white"
                    >
                        Tìm kiếm
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="btn-primary"
                    >
                        <Plus size={18} /> Thêm Thuốc Mới
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table 
                    columns={columns} 
                    dataSource={medicines} 
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            {/* Modal Thêm/Sửa */}
            <Modal
                title={<div className="text-xl font-bold">{editingItem ? 'Sửa thông tin thuốc' : 'Thêm thuốc mới'}</div>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-6"
                >
                    <Form.Item
                        name="name"
                        label="Tên thuốc"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
                    >
                        <Input size="large" placeholder="Ví dụ: Paracetamol 500mg" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="unit"
                            label="Đơn vị tính"
                            rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính!' }]}
                        >
                            <Select size="large" placeholder="Chọn đơn vị">
                                <Select.Option value="Viên">Viên</Select.Option>
                                <Select.Option value="Vỉ">Vỉ</Select.Option>
                                <Select.Option value="Hộp">Hộp</Select.Option>
                                <Select.Option value="Chai">Chai</Select.Option>
                                <Select.Option value="Gói">Gói</Select.Option>
                                <Select.Option value="Ống">Ống</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="stock"
                            label="Số lượng tồn kho"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                        >
                            <Input type="number" min={0} size="large" placeholder="VD: 100" />
                        </Form.Item>
                        
                        <Form.Item
                            name="price"
                            label="Giá bán (VNĐ)"
                            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                        >
                            <Input type="number" min={0} size="large" placeholder="VD: 5000" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                        >
                            <Select size="large">
                                <Select.Option value="active">Đang sử dụng</Select.Option>
                                <Select.Option value="inactive">Ngưng sử dụng</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="usage"
                        label="Cách dùng mặc định (không bắt buộc)"
                    >
                        <Input size="large" placeholder="Ví dụ: Uống sau ăn 30 phút" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="Ghi chú thêm"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả công dụng hoặc tác dụng phụ..." />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button size="large" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" size="large" className="bg-primary-600 hover:bg-primary-700">
                            {editingItem ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
