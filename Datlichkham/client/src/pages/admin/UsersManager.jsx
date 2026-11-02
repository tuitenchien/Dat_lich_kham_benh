import { useState, useEffect } from "react";
import { Table, Button, Modal, Select, Tag, message, Space, Popconfirm, Avatar, Input } from "antd";
import { User, Lock, Unlock, Trash2, Search, Settings } from "lucide-react";
import { apiClient } from "../../config/axiosClient";
import dayjs from "dayjs";

export default function UsersManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/users/admin/users');
            if (res.data.metadata) {
                setUsers(res.data.metadata);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await apiClient.put(`/api/users/admin/users/${id}`, { isActive: !currentStatus });
            message.success(`Đã ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/api/users/admin/users/${id}`);
            message.success("Đã xóa người dùng thành công!");
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể xóa người dùng này!");
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchNameOrEmail = 
            user.fullName?.toLowerCase().includes(searchText.toLowerCase()) || 
            user.email?.toLowerCase().includes(searchText.toLowerCase());
            
        const matchRole = roleFilter === "all" ? true : user.role === roleFilter;
        
        return matchNameOrEmail && matchRole;
    });

    const columns = [
        {
            title: "Người dùng",
            dataIndex: "fullName",
            key: "fullName",
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar src={record.avatar} icon={<User size={16} />} className="bg-primary-100 text-primary-600" />
                    <div>
                        <p className="font-medium text-gray-900">{text || 'Chưa cập nhật'}</p>
                        <p className="text-xs text-gray-500">{record.email}</p>
                    </div>
                </div>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            render: (text) => text || <span className="text-gray-400 italic">Trống</span>,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const color = role === 'admin' ? 'red' : role === 'doctor' ? 'cyan' : 'blue';
                return <Tag color={color}>{role.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
                <Tag color={isActive ? "success" : "error"} className="rounded-full px-3">
                    {isActive ? "Hoạt động" : "Bị khóa"}
                </Tag>
            ),
        },
        {
            title: "Ngày tham gia",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: "Thao tác",
            key: "action",
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    {record.role !== 'admin' && (
                        <>
                            <Popconfirm
                                title={record.isActive ? "Bạn muốn khóa tài khoản này?" : "Bạn muốn mở khóa tài khoản này?"}
                                onConfirm={() => handleToggleActive(record._id, record.isActive)}
                                okText="Đồng ý"
                                cancelText="Hủy"
                            >
                                <Button 
                                    type="text" 
                                    className={record.isActive ? "text-orange-500 hover:bg-orange-50" : "text-emerald-500 hover:bg-emerald-50"}
                                    icon={record.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                >
                                    {record.isActive ? "Khóa" : "Mở khóa"}
                                </Button>
                            </Popconfirm>
                            
                            <Popconfirm
                                title="Xóa tài khoản này?"
                                description="Hành động này có thể ảnh hưởng đến các dữ liệu liên quan."
                                onConfirm={() => handleDelete(record._id)}
                                okText="Xóa"
                                okButtonProps={{ danger: true }}
                                cancelText="Hủy"
                            >
                                <Button type="text" danger icon={<Trash2 size={16} />} />
                            </Popconfirm>
                        </>
                    )}
                    {record.role === 'admin' && (
                        <span className="text-xs text-gray-400 italic">Không thể thao tác</span>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản, phân quyền và trạng thái hoạt động.</p>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4 flex-1">
                    <Input
                        placeholder="Tìm theo tên hoặc email..."
                        prefix={<Search size={16} className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-sm rounded-xl"
                    />
                    <Select
                        defaultValue="all"
                        value={roleFilter}
                        onChange={setRoleFilter}
                        className="w-40"
                    >
                        <Select.Option value="all">Tất cả vai trò</Select.Option>
                        <Select.Option value="patient">Bệnh nhân</Select.Option>
                        <Select.Option value="doctor">Bác sĩ</Select.Option>
                        <Select.Option value="admin">Admin</Select.Option>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-table"
                />
            </div>
            
            <style>{`
                .custom-table .ant-table-thead > tr > th {
                    background-color: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
