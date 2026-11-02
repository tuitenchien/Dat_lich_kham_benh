import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { Eye, EyeOff, Mail, Lock, User, Phone, Heart, ArrowRight, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { requestRegister, requestSendOtp, requestVerifyOtp } from '../config/UserRequest';


// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}
const STRENGTH_LABELS = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
    const refs = Array.from({ length: 6 }, () => useRef(null));

    const handleKey = (i, e) => {
        if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus();
    };

    const handleChange = (i, e) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1);
        const arr = value.split('');
        arr[i] = char;
        onChange(arr.join(''));
        if (char && i < 5) refs[i + 1].current?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(pasted.padEnd(6, ''));
        refs[Math.min(pasted.length, 5)].current?.focus();
        e.preventDefault();
    };

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKey(i, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                        value[i]
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 bg-gray-50 focus:border-primary-400'
                    }`}
                />
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(() => {
        return sessionStorage.getItem('register_step') ? parseInt(sessionStorage.getItem('register_step')) : 1;
    }); // 1 = form, 2 = OTP
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState(() => {
        const savedEmail = sessionStorage.getItem('register_email');
        return {
            fullName: '',
            email: savedEmail || '',
            phone: '',
            password: '',
            confirmPassword: '',
            agreed: false,
        };
    });

    const strength = getStrength(form.password);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((v) => v - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
        if (!form.email) e.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
        if (form.phone && !/^(\+84|0)\d{9,10}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ';
        if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
        else if (form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
        if (!form.agreed) e.agreed = 'Bạn cần đồng ý với điều khoản';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Bước 1: Đăng ký → gửi OTP
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            // Server tự động gửi OTP sau khi tạo tài khoản
            await requestRegister({ fullName: form.fullName, email: form.email, password: form.password });
            message.success('Mã OTP đã được gửi đến email của bạn!');
            
            // Lưu vào sessionStorage để tránh mất khi F5
            sessionStorage.setItem('register_step', '2');
            sessionStorage.setItem('register_email', form.email);
            
            setStep(2);
            setCountdown(60);
        } catch (err) {
            const errorMsg = err?.response?.data?.message;
            if (errorMsg === 'Email đã tồn tại') {
                message.error('Email này đã được đăng ký. Nếu bạn chưa xác thực, vui lòng sang trang Đăng nhập để nhận lại mã OTP.');
            } else {
                message.error(errorMsg || 'Đăng ký thất bại, vui lòng thử lại');
            }
        } finally {
            setLoading(false);
        }
    };



    // Bước 2: Xác thực OTP
    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            message.warning('Vui lòng nhập đủ 6 chữ số OTP');
            return;
        }
        setLoading(true);
        try {
            await requestVerifyOtp({ email: form.email, otp });
            message.success('Xác thực tài khoản thành công!');
            
            // Xóa session storage sau khi thành công
            sessionStorage.removeItem('register_step');
            sessionStorage.removeItem('register_email');
            
            navigate('/login');
        } catch (err) {
            message.error(err?.response?.data?.message || 'Mã OTP không chính xác');
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        try {
            await requestSendOtp({ email: form.email });
            message.success('Đã gửi lại mã OTP!');
            setCountdown(60);
            setOtp('');
        } catch {
            message.error('Gửi lại OTP thất bại');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-[#0f2554] flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
                <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Heart size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl leading-none">MediCare<span className="text-cyan-300">+</span></p>
                        <p className="text-blue-200 text-xs">Smart Healthcare</p>
                    </div>
                </div>

                <div className="relative z-10">
                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-8">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                    step >= s ? 'bg-white text-primary-600' : 'bg-white/20 text-white/50'
                                }`}>
                                    {step > s ? <CheckCircle size={16} /> : s}
                                </div>
                                <span className={`text-xs font-medium ${step >= s ? 'text-white' : 'text-white/50'}`}>
                                    {s === 1 ? 'Thông tin' : 'Xác thực OTP'}
                                </span>
                                {s < 2 && <div className="w-8 h-0.5 bg-white/20 rounded-full mx-1" />}
                            </div>
                        ))}
                    </div>

                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                        {step === 1 ? 'Tạo tài khoản\nmới ngay!' : 'Xác thực\nemail của bạn!'}
                    </h2>
                    <p className="text-blue-200 text-base leading-relaxed max-w-sm">
                        {step === 1
                            ? 'Đăng ký để đặt lịch khám bệnh, nhận thông báo và quản lý hồ sơ sức khỏe cá nhân.'
                            : `Chúng tôi đã gửi mã OTP 6 chữ số đến email ${form.email}. Hãy kiểm tra hộp thư đến của bạn.`
                        }
                    </p>
                </div>

                <p className="relative z-10 text-blue-300 text-xs">© 2024 MediCare+. Tất cả quyền được bảo lưu.</p>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center">
                            <Heart size={16} className="text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-primary-700">MediCare<span className="text-cyan-500">+</span></span>
                    </div>

                    {/* ── STEP 1: FORM ── */}
                    {step === 1 && (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Đăng ký</h1>
                            <p className="text-gray-500 text-sm mb-7">
                                Đã có tài khoản?{' '}
                                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Đăng nhập</Link>
                            </p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                {/* Họ tên */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            value={form.fullName}
                                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại <span className="text-gray-400 font-normal">(tuỳ chọn)</span></label>
                                    <div className="relative">
                                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            placeholder="0912 345 678"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {form.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : strength <= 3 ? 'text-yellow-600' : 'text-emerald-500'}`}>
                                                {STRENGTH_LABELS[strength]}
                                            </p>
                                        </div>
                                    )}
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu"
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                            className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                </div>

                                {/* Terms */}
                                <div>
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.agreed}
                                            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
                                            className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Tôi đồng ý với{' '}
                                            <Link to="#" className="text-primary-600 hover:underline font-medium">Điều khoản sử dụng</Link>
                                            {' '}và{' '}
                                            <Link to="#" className="text-primary-600 hover:underline font-medium">Chính sách bảo mật</Link>
                                        </span>
                                    </label>
                                    {errors.agreed && <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round"/></svg>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">Tiếp tục <ArrowRight size={16} /></span>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {step === 2 && (
                        <div className="text-center">
                            {/* Icon */}
                            <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center mx-auto mb-6">
                                <Mail size={32} className="text-primary-600" />
                            </div>

                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Xác thực email</h1>
                            <p className="text-gray-500 text-sm mb-2">
                                Chúng tôi đã gửi mã OTP đến
                            </p>
                            <p className="text-primary-600 font-semibold text-sm mb-8">{form.email}</p>

                            <OtpInput value={otp} onChange={setOtp} />

                            {/* Countdown */}
                            <div className="mt-6 mb-6">
                                {countdown > 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Gửi lại OTP sau{' '}
                                        <span className="font-bold text-primary-600">{countdown}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline mx-auto"
                                    >
                                        <RefreshCw size={14} /> Gửi lại mã OTP
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length < 6}
                                className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round"/></svg>
                                        Đang xác thực...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2"><CheckCircle size={16} /> Xác nhận</span>
                                )}
                            </button>

                            <button
                                onClick={() => { 
                                    setStep(1); 
                                    setOtp(''); 
                                    sessionStorage.removeItem('register_step');
                                    sessionStorage.removeItem('register_email');
                                }}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto"
                            >
                                <ArrowLeft size={14} /> Quay lại
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
