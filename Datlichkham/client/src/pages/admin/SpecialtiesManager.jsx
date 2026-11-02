import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm, Upload } from 'antd';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { requestGetSpecialties, requestCreateSpecialty, requestUpdateSpecialty, requestDeleteSpecialty, requestUploadSpecialtyImage } from '../../config/SpecialtyRequest';

export default function SpecialtiesManager() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();

    const fetchSpecialties = async () => {
        setLoading(true);
        try {
            const res = await requestGetSpecialties();
            setSpecialties(res.metadata || []);
        } catch (error) {
            message.error('Không thể tải danh sách chuyên khoa');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const showModal = (record = null) => {
        if (record) {
            setEditingId(record._id);
            form.setFieldsValue({
                name: record.name,
                description: record.description,
                image: record.image,
                isActive: record.isActive,
            });
            setImageUrl(record.image);
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ isActive: true });
            setImageUrl('');
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingId(null);
        setImageUrl('');
    };

    const customUpload = async ({ file, onSuccess, onError }) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await requestUploadSpecialtyImage(formData);
            const url = res.metadata.url;
            setImageUrl(url);
            form.setFieldsValue({ image: url });
            onSuccess(res, file);
            message.success('Tải ảnh lên thành công');
        } catch (error) {
            onError(error);
            message.error('Tải ảnh lên thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleFinish = async (values) => {
        // Ghi đè trường image bằng imageUrl (chuỗi URL hợp lệ) để tránh lỗi Cast to string từ Antd Upload
        const payload = { ...values, image: imageUrl };

        try {
            if (editingId) {
                await requestUpdateSpecialty(editingId, payload);
                message.success('Cập nhật chuyên khoa thành công');
            } else {
                await requestCreateSpecialty(payload);
                message.success('Thêm chuyên khoa mới thành công');
            }
            setIsModalVisible(false);
            fetchSpecialties();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteSpecialty(id);
            message.success('Xóa chuyên khoa thành công');
            fetchSpecialties();
        } catch (error) {
            message.error('Không thể xóa chuyên khoa');
        }
    };

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: 'image',
            key: 'image',
            width: 200,
            render: (image) => (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                    {image ? (
                        <img src={image} alt="Specialty" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            title: 'Tên chuyên khoa',
            dataIndex: 'name',
            key: 'name',
            width: 400,
            render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 400,
            render: (text) => (
                <span className="text-gray-500 text-sm line-clamp-2" title={text}>
                    {text || 'Chưa có mô tả'}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 220,
            render: (isActive) => (
                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                >
                    {isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                </span>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <button
                        onClick={() => showModal(record)}
                        className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Edit2 size={16} />
                    </button>
                    <Popconfirm
                        title="Xóa chuyên khoa"
                        description="Bạn có chắc chắn muốn xóa chuyên khoa này không?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <button className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors" title="Xóa">
                            <Trash2 size={16} />
                        </button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Chuyên khoa</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý danh sách các chuyên khoa khám bệnh trên hệ thống
                    </p>
                </div>
                <button onClick={() => showModal()} className="btn-primary flex items-center shadow-md hover:shadow-lg">
                    <Plus size={18} /> Thêm chuyên khoa
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Table
                    columns={columns}
                    dataSource={specialties}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </div>

            <Modal
                title={
                    <span className="text-xl font-bold text-gray-800">
                        {editingId ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa mới'}
                    </span>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
                    <Form.Item
                        name="name"
                        label={<span className="font-medium text-gray-700">Tên chuyên khoa</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên chuyên khoa' }]}
                    >
                        <Input
                            placeholder="Ví dụ: Khoa Tim mạch, Khoa Răng Hàm Mặt..."
                            size="large"
                            className="rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={<span className="font-medium text-gray-700">Mô tả chi tiết</span>}
                    >
                        <Input.TextArea
                            placeholder="Mô tả các dịch vụ, đặc điểm của chuyên khoa..."
                            rows={4}
                            className="rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item name="image" label={<span className="font-medium text-gray-700">Ảnh đại diện</span>}>
                        <Upload
                            name="image"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            customRequest={customUpload}
                            accept="image/*"
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="specialty"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            ) : (
                                <div>
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-primary-500 mx-auto" />
                                    ) : (
                                        <UploadCloud className="text-gray-400 mx-auto" />
                                    )}
                                    <div style={{ marginTop: 8 }} className="text-gray-500 text-sm">
                                        Tải ảnh lên
                                    </div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label={<span className="font-medium text-gray-700">Trạng thái hiển thị</span>}
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                        <Button
                            size="large"
                            onClick={handleCancel}
                            className="rounded-xl border-gray-300 font-medium text-gray-600"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            htmlType="submit"
                            className="rounded-xl bg-primary-600 hover:bg-primary-700 font-medium px-8 shadow-md"
                        >
                            {editingId ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style>{`
                .custom-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    border-bottom: 1px solid #f1f5f9;
                }
                .custom-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #f8fafc;
                }
                .custom-table .ant-table-tbody > tr:hover > td {
                    background-color: #f8fafc;
                }
            `}</style>
        </div>
    );
}
