import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm, Upload, Select, InputNumber } from 'antd';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, UploadCloud, Stethoscope } from 'lucide-react';
import { requestGetAllUsers } from '../../config/UserRequest';
import { requestGetDoctors, requestCreateDoctor, requestUpdateDoctor, requestDeleteDoctor, requestUploadDoctorImage } from '../../config/DoctorRequest';
import { requestGetClinics } from '../../config/ClinicRequest';
import { requestGetSpecialties } from '../../config/SpecialtyRequest';

export default function DoctorsManager() {
    const [doctors, setDoctors] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [users, setUsers] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resDocs, resClinics, resSpecs, resUsers] = await Promise.all([
                requestGetDoctors(),
                requestGetClinics(),
                requestGetSpecialties(),
                requestGetAllUsers()
            ]);
            setDoctors(resDocs.metadata || []);
            setClinics(resClinics.metadata || []);
            setSpecialties(resSpecs.metadata || []);
            setUsers(resUsers.metadata || []);
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchDoctorsOnly = async () => {
        try {
            const res = await requestGetDoctors();
            setDoctors(res.metadata || []);
        } catch (error) {
            message.error('Không thể tải danh sách bác sĩ');
        }
    };

    const showModal = (record = null) => {
        if (record) {
            setEditingId(record._id);
            form.setFieldsValue({
                userId: record.userId?._id,
                name: record.name,
                position: record.position,
                clinicId: record.clinicId?._id,
                specialtyId: record.specialtyId?._id,
                price: record.price,
                introduction: record.introduction,
                image: record.image,
                isActive: record.isActive,
            });
            setImageUrl(record.image);
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ isActive: true, price: 300000 });
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
            const res = await requestUploadDoctorImage(formData);
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
                await requestUpdateDoctor(editingId, payload);
                message.success('Cập nhật thông tin bác sĩ thành công');
            } else {
                await requestCreateDoctor(payload);
                message.success('Thêm bác sĩ mới thành công');
            }
            setIsModalVisible(false);
            fetchDoctorsOnly();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteDoctor(id);
            message.success('Xóa bác sĩ thành công');
            fetchDoctorsOnly();
        } catch (error) {
            message.error('Không thể xóa bác sĩ');
        }
    };

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image) => (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                    {image ? (
                        <img src={image} alt="Doctor" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            title: 'Bác sĩ',
            key: 'name_pos',
            render: (_, record) => (
                <div>
                    <div className="font-semibold text-gray-800">{record.name}</div>
                    <div className="text-xs text-blue-600 mt-0.5">{record.position}</div>
                </div>
            )
        },
        {
            title: 'Nơi công tác',
            key: 'clinic_spec',
            render: (_, record) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-700">{record.clinicId?.name || 'Không xác định'}</div>
                    <div className="text-gray-500 mt-0.5">{record.specialtyId?.name || 'Không xác định'}</div>
                </div>
            )
        },
        {
            title: 'Tài khoản liên kết',
            key: 'user_account',
            render: (_, record) => (
                <div className="text-sm text-gray-600">
                    {record.userId?.email || 'Chưa liên kết'}
                </div>
            )
        },
        {
            title: 'Giá khám',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (price) => (
                <span className="font-semibold text-orange-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)}
                </span>
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
                        title="Xóa bác sĩ"
                        description="Bạn có chắc chắn muốn xóa bác sĩ này không?"
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Bác sĩ</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý danh sách y bác sĩ, chuyên gia y tế trên hệ thống
                    </p>
                </div>
                <button onClick={() => showModal()} className="btn-primary flex items-center shadow-md hover:shadow-lg">
                    <Plus size={18} /> Thêm bác sĩ
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Table
                    columns={columns}
                    dataSource={doctors}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </div>

            <Modal
                title={
                    <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Stethoscope className="text-primary-600" size={24} />
                        {editingId ? 'Cập nhật thông tin Bác sĩ' : 'Thêm Bác sĩ mới'}
                    </span>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div className="md:col-span-2 flex gap-6 items-end mb-4">
                            <Form.Item name="image" label={<span className="font-medium text-gray-700">Ảnh chân dung</span>} className="mb-0">
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
                                            alt="doctor"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
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
                            
                            <div className="flex-1 space-y-4">
                                <Form.Item
                                    name="name"
                                    label={<span className="font-medium text-gray-700">Họ và tên Bác sĩ</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ' }]}
                                    className="mb-0"
                                >
                                    <Input placeholder="Ví dụ: Nguyễn Văn A..." size="large" className="rounded-xl" />
                                </Form.Item>

                                <Form.Item
                                    name="position"
                                    label={<span className="font-medium text-gray-700">Chức danh / Học vị</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}
                                    className="mb-0"
                                >
                                    <Input placeholder="Ví dụ: Giáo sư, Tiến sĩ, Bác sĩ CKI..." size="large" className="rounded-xl" />
                                </Form.Item>
                            </div>
                        </div>

                        <Form.Item
                            name="userId"
                            label={<span className="font-medium text-gray-700">Tài khoản liên kết</span>}
                            rules={[{ required: true, message: 'Vui lòng chọn tài khoản liên kết' }]}
                            className="md:col-span-2"
                        >
                            <Select
                                size="large"
                                placeholder="Chọn tài khoản User để cấp quyền Bác sĩ"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={users.map(u => ({ value: u._id, label: `${u.email} - ${u.fullName}` }))}
                            />
                        </Form.Item>

                        <Form.Item
                            name="clinicId"
                            label={<span className="font-medium text-gray-700">Cơ sở y tế công tác</span>}
                            rules={[{ required: true, message: 'Vui lòng chọn cơ sở y tế' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Chọn bệnh viện/phòng khám"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={clinics.map(c => ({ value: c._id, label: c.name }))}
                            />
                        </Form.Item>

                        <Form.Item
                            name="specialtyId"
                            label={<span className="font-medium text-gray-700">Chuyên khoa</span>}
                            rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Chọn chuyên khoa khám"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={specialties.map(s => ({ value: s._id, label: s.name }))}
                            />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label={<span className="font-medium text-gray-700">Giá khám (VNĐ)</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập giá khám' }]}
                        >
                            <InputNumber
                                size="large"
                                className="w-full rounded-xl"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                                step={50000}
                            />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label={<span className="font-medium text-gray-700">Trạng thái</span>}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ẩn" />
                        </Form.Item>

                        <Form.Item
                            name="introduction"
                            label={<span className="font-medium text-gray-700">Thông tin giới thiệu</span>}
                            className="md:col-span-2"
                        >
                            <Input.TextArea
                                placeholder="Giới thiệu về quá trình đào tạo, kinh nghiệm công tác của bác sĩ..."
                                rows={6}
                                className="rounded-xl"
                            />
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
