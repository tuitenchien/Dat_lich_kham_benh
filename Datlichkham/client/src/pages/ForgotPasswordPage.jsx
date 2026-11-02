import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { Mail, Lock, Eye, EyeOff, Heart, ArrowLeft, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { requestForgotPassword, requestResetPassword } from '../config/UserRequest';

// ─── OTP Input (reuse pattern) ───────────────────────────────────────────────
function OtpInput({ value, onChange }) {
    const refs = Array.from({ length: 6 }, () => useRef(null));
    const handleChange = (i, e) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1);
        const arr = value.split('');
        arr[i] = char;
        onChange(arr.join(''));
        if (char && i < 5) refs[i + 1].current?.focus();
    };
    const handleKey = (i, e) => {
        if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus();
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
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                        value[i] ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50 focus:border-primary-400'
                    }`}
                />
            ))}
        </div>
    );
}

const STEPS = [
    { label: 'Nhập email' },
    { label: 'Nhập OTP' },
    { label: 'Mật khẩu mới' },
];

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(v => v - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // Step 1: gửi OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) { setErrors({ email: 'Vui lòng nhập email' }); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: 'Email không hợp lệ' }); return; }
        setErrors({});
        setLoading(true);
        try {
            await requestForgotPassword({ email });
            message.success('Mã OTP đã được gửi đến email của bạn!');
            setStep(2);
            setCountdown(60);
        } catch (err) {
            message.error(err?.response?.data?.message || 'Email không tồn tại');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: xác nhận OTP
    const handleVerifyOtp = () => {
        if (otp.length < 6) { message.warning('Vui lòng nhập đủ 6 chữ số OTP'); return; }
        setStep(3);
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        try {
            await requestForgotPassword({ email });
            message.success('Đã gửi lại OTP!');
            setCountdown(60);
            setOtp('');
        } catch { message.error('Gửi lại thất bại'); }
    };

    // Step 3: đặt mật khẩu mới
    const handleResetPassword = async (e) => {
        e.preventDefault();
        const e2 = {};
        if (!passwords.newPassword || passwords.newPassword.length < 6) e2.newPassword = 'Mật khẩu tối thiểu 6 ký tự';
        if (passwords.newPassword !== passwords.confirmPassword) e2.confirmPassword = 'Mật khẩu xác nhận không khớp';
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setErrors({});
        setLoading(true);
        try {
            await requestResetPassword({ otp, newPassword: passwords.newPassword });
            message.success('Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (err) {
            message.error(err?.response?.data?.message || 'Thất bại, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-[#0f2554] flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
                <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />

                <Link to="/" className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Heart size={18} className="text-white fill-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl leading-none">MediCare<span className="text-cyan-300">+</span></p>
                        <p className="text-blue-200 text-xs">Smart Healthcare</p>
                    </div>
                </Link>

                <div className="relative z-10">
                    {/* Step indicator */}
                    <div className="flex flex-col gap-4 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                                    step > i + 1 ? 'bg-emerald-400 text-white' : step === i + 1 ? 'bg-white text-primary-600' : 'bg-white/20 text-white/50'
                                }`}>
                                    {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                                </div>
                                <span className={`text-sm font-medium ${step >= i + 1 ? 'text-white' : 'text-white/50'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                        Quên mật<br />khẩu?
                    </h2>
                    <p className="text-blue-200 text-base leading-relaxed max-w-sm">
                        Đừng lo! Chúng tôi sẽ gửi mã xác thực đến email của bạn để khôi phục mật khẩu an toàn.
                    </p>
                </div>

                <p className="relative z-10 text-blue-300 text-xs">© 2024 MediCare+. Tất cả quyền được bảo lưu.</p>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center">
                            <Heart size={16} className="text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-primary-700">MediCare<span className="text-cyan-500">+</span></span>
                    </div>

                    {/* ── STEP 1: Nhập email ── */}
                    {step === 1 && (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Quên mật khẩu</h1>
                            <p className="text-gray-500 text-sm mb-8">
                                Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để xác thực.
                            </p>
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-60">
                                    {loading
                                        ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round"/></svg> Đang gửi...</span>
                                        : <span className="flex items-center gap-2">Gửi mã OTP <ArrowRight size={16} /></span>
                                    }
                                </button>
                            </form>
                            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-6">
                                <ArrowLeft size={14} /> Quay lại đăng nhập
                            </Link>
                        </>
                    )}

                    {/* ── STEP 2: Nhập OTP ── */}
                    {step === 2 && (
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center mx-auto mb-6">
                                <Mail size={32} className="text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Nhập mã OTP</h1>
                            <p className="text-gray-500 text-sm mb-1">Mã đã được gửi đến</p>
                            <p className="text-primary-600 font-semibold text-sm mb-8">{email}</p>
                            <OtpInput value={otp} onChange={setOtp} />
                            <div className="mt-6 mb-6">
                                {countdown > 0
                                    ? <p className="text-gray-500 text-sm">Gửi lại sau <span className="font-bold text-primary-600">{countdown}s</span></p>
                                    : <button onClick={handleResend} className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline mx-auto"><RefreshCw size={14} /> Gửi lại OTP</button>
                                }
                            </div>
                            <button onClick={handleVerifyOtp} disabled={otp.length < 6} className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-50 mb-4">
                                <span className="flex items-center gap-2">Tiếp tục <ArrowRight size={16} /></span>
                            </button>
                            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto">
                                <ArrowLeft size={14} /> Quay lại
                            </button>
                        </div>
                    )}

                    {/* ── STEP 3: Mật khẩu mới ── */}
                    {step === 3 && (
                        <>
                            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <Lock size={32} className="text-emerald-500" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Đặt mật khẩu mới</h1>
                            <p className="text-gray-500 text-sm mb-8 text-center">Nhập mật khẩu mới cho tài khoản của bạn</p>
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                </div>
                                <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-60">
                                    {loading
                                        ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round"/></svg> Đang cập nhật...</span>
                                        : <span className="flex items-center gap-2"><CheckCircle size={16} /> Xác nhận</span>
                                    }
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
