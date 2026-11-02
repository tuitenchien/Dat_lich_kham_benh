import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm, Upload } from 'antd';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, UploadCloud, MapPin } from 'lucide-react';
import { requestGetClinics, requestCreateClinic, requestUpdateClinic, requestDeleteClinic, requestUploadClinicImage } from '../../config/ClinicRequest';

export default function ClinicsManager() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();

    const fetchClinics = async () => {
        setLoading(true);
        try {
            const res = await requestGetClinics();
            setClinics(res.metadata || []);
        } catch (error) {
            message.error('Không thể tải danh sách cơ sở y tế');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClinics();
    }, []);

    const showModal = (record = null) => {
        if (record) {
            setEditingId(record._id);
            form.setFieldsValue({
                name: record.name,
                address: record.address,
                introduction: record.introduction,
                professionalStrengths: record.professionalStrengths,
                equipment: record.equipment,
                examinationProcess: record.examinationProcess,
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
            const res = await requestUploadClinicImage(formData);
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
        const payload = { ...values, image: imageUrl };

        try {
            if (editingId) {
                await requestUpdateClinic(editingId, payload);
                message.success('Cập nhật cơ sở y tế thành công');
            } else {
                await requestCreateClinic(payload);
                message.success('Thêm cơ sở y tế mới thành công');
            }
            setIsModalVisible(false);
            fetchClinics();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteClinic(id);
            message.success('Xóa cơ sở y tế thành công');
            fetchClinics();
        } catch (error) {
            message.error('Không thể xóa cơ sở y tế');
        }
    };

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: 'image',
            key: 'image',
            width: 120,
            render: (image) => (
                <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                    {image ? (
                        <img src={image} alt="Clinic" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            title: 'Tên cơ sở y tế',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: 300,
            render: (text) => (
                <div className="flex items-start gap-1.5 text-gray-600 text-sm">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
                    <span className="line-clamp-2" title={text}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
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
            width: 120,
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
                        title="Xóa cơ sở y tế"
                        description="Bạn có chắc chắn muốn xóa cơ sở này không?"
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Cơ sở y tế</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý danh sách các phòng khám, bệnh viện trên hệ thống
                    </p>
                </div>
                <button onClick={() => showModal()} className="btn-primary flex items-center shadow-md hover:shadow-lg">
                    <Plus size={18} /> Thêm cơ sở y tế
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Table
                    columns={columns}
                    dataSource={clinics}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </div>

            <Modal
                title={
                    <span className="text-xl font-bold text-gray-800">
                        {editingId ? 'Cập nhật cơ sở y tế' : 'Thêm cơ sở y tế mới'}
                    </span>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item
                            name="name"
                            label={<span className="font-medium text-gray-700">Tên cơ sở y tế</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên cơ sở y tế' }]}
                            className="md:col-span-2"
                        >
                            <Input
                                placeholder="Ví dụ: Bệnh viện Đa khoa Quốc tế..."
                                size="large"
                                className="rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label={<span className="font-medium text-gray-700">Địa chỉ chi tiết</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                            className="md:col-span-2"
                        >
                            <Input
                                placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP.HCM..."
                                size="large"
                                className="rounded-xl"
                                prefix={<MapPin size={16} className="text-gray-400 mr-1" />}
                            />
                        </Form.Item>

                        <Form.Item
                            name="introduction"
                            label={<span className="font-medium text-gray-700">Giới thiệu (Tổng quan)</span>}
                            className="md:col-span-2"
                        >
                            <Input.TextArea
                                placeholder="Thông tin tổng quan về phòng khám..."
                                rows={4}
                                className="rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item
                            name="professionalStrengths"
                            label={<span className="font-medium text-gray-700">Thế mạnh chuyên môn</span>}
                            className="md:col-span-2"
                        >
                            <Input.TextArea
                                placeholder="Điểm mạnh, chuyên khoa sâu, đội ngũ bác sĩ..."
                                rows={4}
                                className="rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item
                            name="equipment"
                            label={<span className="font-medium text-gray-700">Trang thiết bị</span>}
                            className="md:col-span-2"
                        >
                            <Input.TextArea
                                placeholder="Cơ sở vật chất, máy móc, trang thiết bị nổi bật..."
                                rows={4}
                                className="rounded-xl"
                            />
                        </Form.Item>

                        <Form.Item
                            name="examinationProcess"
                            label={<span className="font-medium text-gray-700">Quy trình khám</span>}
                            className="md:col-span-2"
                        >
                            <Input.TextArea
                                placeholder="Quy trình đi khám, thủ tục, thời gian làm việc..."
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
                                        alt="clinic"
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
                            label={<span className="font-medium text-gray-700">Trạng thái</span>}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ẩn" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
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
