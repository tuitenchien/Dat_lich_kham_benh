import { useState, useEffect } from "react";
import { Table, Button, Modal, Select, Tag, message, Space, Popconfirm, Input, Form } from "antd";
import { FileText, Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiClient } from "../../config/axiosClient";
import dayjs from "dayjs";

export default function ArticlesManager() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/articles');
            if (res.data.metadata?.articles) {
                setArticles(res.data.metadata.articles);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách bài viết!");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ status: 'draft' });
        setIsModalVisible(true);
    };

    const handleEdit = async (record) => {
        setEditingId(record._id);
        
        try {
            // Lấy chi tiết để có content đầy đủ nếu API list không trả về
            const res = await apiClient.get(`/api/articles/admin/${record._id}`);
            if (res.data.metadata) {
                const data = res.data.metadata;
                form.setFieldsValue({
                    title: data.title,
                    content: data.content,
                    thumbnail: data.thumbnail,
                    status: data.status,
                    tags: data.tags ? data.tags.join(', ') : ''
                });
                setIsModalVisible(true);
            }
        } catch (error) {
            message.error("Lỗi khi tải chi tiết bài viết!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/api/articles/${id}`);
            message.success("Đã xóa bài viết thành công!");
            fetchArticles();
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể xóa bài viết này!");
        }
    };

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : []
            };

            if (editingId) {
                await apiClient.put(`/api/articles/${editingId}`, payload);
                message.success("Cập nhật bài viết thành công!");
            } else {
                await apiClient.post('/api/articles', payload);
                message.success("Tạo bài viết mới thành công!");
            }
            setIsModalVisible(false);
            fetchArticles();
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lưu bài viết!");
        }
    };

    const filteredArticles = articles.filter((article) => {
        const matchTitle = article.title?.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus = statusFilter === "all" ? true : article.status === statusFilter;
        return matchTitle && matchStatus;
    });

    const columns = [
        {
            title: "Bài viết",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {record.thumbnail ? (
                            <img src={record.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FileText size={20} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 line-clamp-2 max-w-md">{text}</p>
                        <p className="text-xs text-gray-500 mt-1">Tác giả: <span className="font-medium">{record.authorId?.fullName || 'N/A'}</span></p>
                    </div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "published" ? "success" : "default"} className="rounded-full px-3">
                    {status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </Tag>
            ),
        },
        {
            title: "Lượt xem",
            dataIndex: "views",
            key: "views",
            render: (views) => (
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <Eye size={14} className="text-gray-400" />
                    {views || 0}
                </span>
            ),
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: "Thao tác",
            key: "action",
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        className="text-blue-500 hover:bg-blue-50"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(record)}
                    />
                    
                    <Popconfirm
                        title="Xóa bài viết này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        okButtonProps={{ danger: true }}
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<Trash2 size={16} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài viết Y khoa</h1>
                    <p className="text-sm text-gray-500 mt-1">Viết và xuất bản các kiến thức y tế, tin tức phòng khám.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold"
                >
                    <Plus size={18} />
                    <span>Viết bài mới</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4 flex-1">
                    <Input
                        placeholder="Tìm kiếm theo tiêu đề..."
                        prefix={<Search size={16} className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-sm rounded-xl"
                    />
                    <Select
                        defaultValue="all"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        className="w-40"
                    >
                        <Select.Option value="all">Tất cả trạng thái</Select.Option>
                        <Select.Option value="published">Đã xuất bản</Select.Option>
                        <Select.Option value="draft">Bản nháp</Select.Option>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredArticles}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </div>
            
            {/* Modal Viết Bài */}
            <Modal
                title={<div className="text-xl font-bold">{editingId ? 'Sửa Bài Viết' : 'Viết Bài Mới'}</div>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className="mt-6 space-y-4"
                >
                    <Form.Item
                        name="title"
                        label={<span className="font-semibold text-gray-700">Tiêu đề bài viết</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Ví dụ: Dấu hiệu nhận biết bệnh Sốt Xuất Huyết..." className="rounded-xl py-2" />
                    </Form.Item>

                    <Form.Item
                        name="thumbnail"
                        label={<span className="font-semibold text-gray-700">Ảnh bìa (URL)</span>}
                    >
                        <Input placeholder="https://example.com/image.jpg" className="rounded-xl py-2" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="tags"
                            label={<span className="font-semibold text-gray-700">Tags (Ngăn cách bằng dấu phẩy)</span>}
                        >
                            <Input placeholder="Sức khỏe, Nhi khoa, Cẩm nang..." className="rounded-xl py-2" />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label={<span className="font-semibold text-gray-700">Trạng thái</span>}
                            rules={[{ required: true }]}
                        >
                            <Select className="h-10">
                                <Select.Option value="draft">Lưu Bản nháp</Select.Option>
                                <Select.Option value="published">Xuất bản ngay</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="content"
                        label={<span className="font-semibold text-gray-700">Nội dung</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <ReactQuill 
                            theme="snow" 
                            className="bg-white rounded-lg"
                            style={{ height: '300px', marginBottom: '40px' }}
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button onClick={() => setIsModalVisible(false)} className="rounded-xl font-medium h-10 px-6">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" className="rounded-xl font-medium h-10 px-6 bg-primary-600 hover:bg-primary-700">
                            {editingId ? 'Cập nhật' : 'Đăng bài'}
                        </Button>
                    </div>
                </Form>
            </Modal>
            
            <style>{`
                .custom-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                }
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: #f8fafc;
                }
            `}</style>
        </div>
    );
}
