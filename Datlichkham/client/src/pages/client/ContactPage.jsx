import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { apiClient } from "../../config/axiosClient";

export default function ContactPage() {
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await apiClient.post('/api/contacts', {
                fullName: values.name,
                email: values.email,
                phone: values.phone,
                subject: values.subject,
                message: values.message
            });
            message.success("Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất!");
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <Phone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Đường dây nóng</h3>
                        <p className="text-gray-500 mb-4">Hỗ trợ khẩn cấp và đặt lịch</p>
                        <p className="text-2xl font-bold text-primary-600">1900 1234</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                        <p className="text-gray-500 mb-4">Góp ý và hợp tác</p>
                        <p className="text-lg font-bold text-gray-900">hotro@medicare.vn</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Trụ sở chính</h3>
                        <p className="text-gray-500 mb-4">Giao dịch trực tiếp</p>
                        <p className="text-lg font-bold text-gray-900">123 Nguyễn Văn Linh, Đà Nẵng</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Map Section */}
                        <div className="h-[400px] lg:h-auto bg-gray-200">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x314219c792252a13%3A0x1df0cb4b86727e06!2zxJDDoCBO4bq1bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1716270000000!5m2!1svi!2s" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Bản đồ"
                            ></iframe>
                        </div>

                        {/* Form Section */}
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        name="name"
                                        label={<span className="font-medium text-gray-700">Họ và tên</span>}
                                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                        className="mb-0"
                                    >
                                        <Input size="large" placeholder="Nhập họ và tên của bạn" className="rounded-xl py-2" />
                                    </Form.Item>

                                    <Form.Item
                                        name="phone"
                                        label={<span className="font-medium text-gray-700">Số điện thoại</span>}
                                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                        className="mb-0"
                                    >
                                        <Input size="large" placeholder="Nhập số điện thoại" className="rounded-xl py-2" />
                                    </Form.Item>
                                </div>

                                <Form.Item
                                    name="email"
                                    label={<span className="font-medium text-gray-700">Email</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' }
                                    ]}
                                    className="mb-0"
                                >
                                    <Input size="large" placeholder="Nhập địa chỉ email" className="rounded-xl py-2" />
                                </Form.Item>

                                <Form.Item
                                    name="subject"
                                    label={<span className="font-medium text-gray-700">Chủ đề</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
                                    className="mb-0"
                                >
                                    <Input size="large" placeholder="Ví dụ: Tư vấn khám bệnh" className="rounded-xl py-2" />
                                </Form.Item>

                                <Form.Item
                                    name="message"
                                    label={<span className="font-medium text-gray-700">Nội dung tin nhắn</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
                                    className="mb-0"
                                >
                                    <Input.TextArea 
                                        rows={5} 
                                        placeholder="Nhập yêu cầu hoặc câu hỏi của bạn..." 
                                        className="rounded-xl py-3"
                                    />
                                </Form.Item>

                                <Form.Item className="mb-0 pt-4">
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        size="large"
                                        loading={loading}
                                        className="w-full h-12 rounded-xl text-base font-semibold bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2"
                                    >
                                        Gửi tin nhắn {!loading && <Send size={18} />}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
