import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { Eye, EyeOff, Mail, Lock, Heart, ArrowRight } from 'lucide-react';
import { requestLogin, requestSendOtp, requestLoginGoogle } from '../config/UserRequest';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
        if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await requestLogin({ email: form.email, password: form.password });
            message.success('Đăng nhập thành công!');
            // Redirect theo role
            const role = res?.metadata?.role;
            if (role === 'doctor') {
                navigate('/bac-si-dashboard');
            } else if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Đăng nhập thất bại';

            // Nếu lỗi là do tài khoản chưa xác thực -> Chuyển sang màn hình xác thực OTP
            if (errorMsg.includes('chưa được xác thực')) {
                message.warning('Tài khoản chưa xác thực. Đang chuyển hướng để nhập mã OTP...');

                // Lưu vào sessionStorage để trang đăng ký tự nhảy sang bước 2
                sessionStorage.setItem('register_step', '2');
                sessionStorage.setItem('register_email', form.email);

                // Gửi lại mã OTP mới luôn
                try {
                    await requestSendOtp({ email: form.email });
                } catch (e) {}

                // Chuyển hướng
                navigate('/register');
            } else {
                message.error(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const data = {
                credential,
            };
            const res = await requestLoginGoogle(data);
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-[#0f2554] flex-col justify-between p-12 relative overflow-hidden">
                {/* decorative circles */}
                <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
                <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/5" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Heart size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl leading-none">
                            MediCare<span className="text-cyan-300">+</span>
                        </p>
                        <p className="text-blue-200 text-xs">Smart Healthcare</p>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                        Chào mừng
                        <br />
                        trở lại! 👋
                    </h2>
                    <p className="text-blue-200 text-base leading-relaxed max-w-sm">
                        Đăng nhập để đặt lịch khám bệnh, theo dõi lịch sử khám và quản lý hồ sơ sức khỏe của bạn.
                    </p>

                    {/* stats */}
                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {[
                            { value: '1,250+', label: 'Bác sĩ' },
                            { value: '150+', label: 'Bệnh viện' },
                            { value: '50K+', label: 'Bệnh nhân' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                                <p className="text-white font-bold text-xl">{s.value}</p>
                                <p className="text-blue-200 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-blue-300 text-xs">© 2024 MediCare+. Tất cả quyền được bảo lưu.</p>
            </div>

            {/* ── Right panel – Form ── */}
            <div className="flex-1 flex items-center justify-center p-6 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center">
                            <Heart size={16} className="text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-primary-700">
                            MediCare<span className="text-cyan-500">+</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Đăng nhập</h1>
                    <p className="text-gray-500 text-sm mb-8">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${
                                        errors.email
                                            ? 'border-red-400 bg-red-50'
                                            : 'border-gray-200 bg-gray-50 focus:bg-white'
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-primary-600 hover:underline font-medium"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${
                                        errors.password
                                            ? 'border-red-400 bg-red-50'
                                            : 'border-gray-200 bg-gray-50 focus:bg-white'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeDasharray="60"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    Đang đăng nhập...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Đăng nhập <ArrowRight size={16} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px' }}>
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                            <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                        </GoogleOAuthProvider>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        Bằng cách đăng nhập, bạn đồng ý với{' '}
                        <Link to="#" className="text-primary-600 hover:underline">
                            Điều khoản sử dụng
                        </Link>{' '}
                        và{' '}
                        <Link to="#" className="text-primary-600 hover:underline">
                            Chính sách bảo mật
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
