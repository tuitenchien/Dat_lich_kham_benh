import { useState, useEffect, useCallback } from 'react';
import { Form, Select, DatePicker, Button, message, Spin, Table, Tag, Popconfirm, Badge } from 'antd';
import { CalendarDays, Clock, Save, Trash2, Users, RefreshCw } from 'lucide-react';
import { requestGetDoctors } from '../../config/DoctorRequest';
import { requestGetSchedules, requestGetAllSchedules, requestCreateSchedules, requestDeleteSchedule } from '../../config/ScheduleRequest';
import dayjs from 'dayjs';

const TIME_SLOTS = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:30 - 14:30',
    '14:30 - 15:30',
    '15:30 - 16:30',
    '16:30 - 17:30',
];

export default function SchedulesManager() {
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();

    const [doctors, setDoctors] = useState([]);
    const [saving, setSaving] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState([]);

    // Table state
    const [tableData, setTableData] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    const doctorId = Form.useWatch('doctorId', form);
    const date = Form.useWatch('date', form);

    // Fetch doctors
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await requestGetDoctors();
                setDoctors(res.metadata || []);
            } catch {
                message.error('Lỗi tải danh sách Bác sĩ');
            }
        };
        fetch();
    }, []);

    // Auto-load existing slots when doctor+date changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (!doctorId || !date) {
                setSelectedSlots([]);
                return;
            }
            setFetchingSlots(true);
            try {
                const res = await requestGetSchedules({ doctorId, date: date.format('DD/MM/YYYY') });
                setSelectedSlots((res.metadata || []).map((s) => s.timeSlot));
            } catch {
                message.error('Lỗi tải lịch hiện có');
            } finally {
                setFetchingSlots(false);
            }
        };
        fetchSlots();
    }, [doctorId, date]);

    // Fetch table data
    const fetchTableData = useCallback(async (filters = {}) => {
        setTableLoading(true);
        try {
            const res = await requestGetAllSchedules(filters);
            setTableData(res.metadata || []);
        } catch {
            message.error('Lỗi tải danh sách lịch');
        } finally {
            setTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    const handleSlotToggle = (slot) => {
        setSelectedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
    };

    const handleSave = async () => {
        if (!doctorId || !date) {
            message.warning('Vui lòng chọn Bác sĩ và Ngày!');
            return;
        }
        setSaving(true);
        try {
            await requestCreateSchedules({ doctorId, date: date.format('DD/MM/YYYY'), timeSlots: selectedSlots });
            message.success('Lưu lịch thành công!');
            // Refresh table
            const filterValues = filterForm.getFieldsValue();
            const params = {};
            if (filterValues.filterDoctorId) params.doctorId = filterValues.filterDoctorId;
            if (filterValues.filterDate) params.date = filterValues.filterDate.format('DD/MM/YYYY');
            fetchTableData(params);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu lịch');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteSchedule(id);
            message.success('Đã xóa khung giờ');
            setTableData((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    const handleFilter = () => {
        const values = filterForm.getFieldsValue();
        const params = {};
        if (values.filterDoctorId) params.doctorId = values.filterDoctorId;
        if (values.filterDate) params.date = values.filterDate.format('DD/MM/YYYY');
        fetchTableData(params);
    };

    const handleResetFilter = () => {
        filterForm.resetFields();
        fetchTableData();
    };

    const columns = [
        {
            title: 'STT',
            width: 55,
            render: (_, __, index) => <span className="text-gray-500 text-sm">{index + 1}</span>,
        },
        {
            title: 'Bác sĩ',
            key: 'doctor',
            render: (_, r) => <div className="font-semibold text-gray-800 text-sm">{r.doctorId?.name || '---'}</div>,
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date) => <span className="font-medium text-gray-700">{date}</span>,
        },
        {
            title: 'Khung giờ',
            dataIndex: 'timeSlot',
            key: 'timeSlot',
            render: (slot) => (
                <Tag color="blue" className="font-semibold text-sm px-3 py-1 rounded-lg">
                    {slot}
                </Tag>
            ),
        },
        {
            title: 'Lượt đặt',
            key: 'bookings',
            render: (_, r) => (
                <div className="flex items-center gap-2">
                    <Users size={15} className="text-gray-400" />
                    <span className="font-bold text-gray-800">{r.currentBookings}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">{r.maxBookings}</span>
                    {r.currentBookings >= r.maxBookings && <Badge status="error" text="Đầy" className="text-xs" />}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, r) => {
                if (r.currentBookings >= r.maxBookings) return <Tag color="red">Đã đầy</Tag>;
                if (r.currentBookings > 0) return <Tag color="orange">Còn chỗ</Tag>;
                return <Tag color="green">Trống</Tag>;
            },
        },
        {
            title: '',
            key: 'action',
            width: 80,
            render: (_, r) => (
                <Popconfirm
                    title="Xóa khung giờ này?"
                    description={
                        r.currentBookings > 0
                            ? `Đã có ${r.currentBookings} lượt đặt, không thể xóa!`
                            : 'Hành động này không thể hoàn tác.'
                    }
                    onConfirm={() => handleDelete(r._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, disabled: r.currentBookings > 0 }}
                >
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                    </button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Lịch làm việc</h1>
                <p className="text-gray-500 text-sm mt-1">Thiết lập khung giờ rảnh và xem toàn bộ lịch hiện có</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* ── Cột Trái: Form Thiết lập lịch ── */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <CalendarDays size={20} className="text-primary-600" />
                            Thiết lập Lịch
                        </h2>

                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="doctorId"
                                label={<span className="font-medium text-gray-700">Bác sĩ</span>}
                                rules={[{ required: true, message: 'Chọn bác sĩ' }]}
                            >
                                <Select
                                    size="large"
                                    placeholder="-- Chọn bác sĩ --"
                                    showSearch
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={doctors.map((d) => ({ value: d._id, label: d.name }))}
                                />
                            </Form.Item>

                            <Form.Item
                                name="date"
                                label={<span className="font-medium text-gray-700">Ngày làm việc</span>}
                                rules={[{ required: true, message: 'Chọn ngày' }]}
                            >
                                <DatePicker
                                    size="large"
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    disabledDate={(c) => c && c < dayjs().startOf('day')}
                                />
                            </Form.Item>
                        </Form>

                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={16} className="text-primary-600" />
                                <span className="font-semibold text-gray-700 text-sm">Khung giờ rảnh</span>
                            </div>

                            {!doctorId || !date ? (
                                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 text-center">
                                    <p className="text-gray-400 text-sm">Chọn Bác sĩ và Ngày để chỉnh khung giờ</p>
                                </div>
                            ) : fetchingSlots ? (
                                <div className="py-6 text-center">
                                    <Spin />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5">
                                    {TIME_SLOTS.map((slot) => {
                                        const isOn = selectedSlots.includes(slot);
                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => handleSlotToggle(slot)}
                                                className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                                                    isOn
                                                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {doctorId && date && !fetchingSlots && (
                            <Button
                                type="primary"
                                size="large"
                                className="w-full mt-6 h-11 rounded-xl flex items-center justify-center gap-2"
                                onClick={handleSave}
                                loading={saving}
                            >
                                <Save size={16} />
                                Lưu lịch ({selectedSlots.length} khung giờ)
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Cột Phải: Bảng quản lý ── */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-800">Danh sách Lịch đã tạo</h2>
                            <button
                                onClick={() => fetchTableData()}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                            >
                                <RefreshCw size={15} />
                                Làm mới
                            </button>
                        </div>

                        {/* Filter bar */}
                        <Form
                            form={filterForm}
                            layout="inline"
                            className="flex flex-wrap gap-3 mb-5 pb-5 border-b border-gray-100"
                        >
                            <Form.Item name="filterDoctorId" className="!mb-0 flex-1 min-w-[160px]">
                                <Select
                                    allowClear
                                    placeholder="Lọc theo bác sĩ"
                                    showSearch
                                    optionFilterProp="label"
                                    options={doctors.map((d) => ({ value: d._id, label: d.name }))}
                                />
                            </Form.Item>
                            <Form.Item name="filterDate" className="!mb-0">
                                <DatePicker format="DD/MM/YYYY" placeholder="Lọc theo ngày" allowClear />
                            </Form.Item>
                            <div className="flex gap-2">
                                <Button type="primary" onClick={handleFilter}>
                                    Lọc
                                </Button>
                                <Button onClick={handleResetFilter}>Xóa</Button>
                            </div>
                        </Form>

                        <Table
                            columns={columns}
                            dataSource={tableData}
                            rowKey="_id"
                            loading={tableLoading}
                            size="middle"
                            pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} khung giờ` }}
                            locale={{ emptyText: 'Chưa có lịch nào được tạo' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
