import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, ShieldCheck } from 'lucide-react'

const LINKS = {
  'Liên kết nhanh': ['Trang chủ', 'Bác sĩ', 'Chuyên khoa', 'Đặt lịch', 'Liên hệ'],
  'Dịch vụ': ['Khám bệnh online', 'Đặt lịch khám', 'Tư vấn sức khỏe', 'Xét nghiệm tại nhà', 'Gói khám sức khỏe'],
  'Hỗ trợ': ['Trung tâm trợ giúp', 'Hướng dẫn sử dụng', 'Chính sách bảo mật', 'Điều khoản sử dụng', 'Liên hệ hỗ trợ'],
}

const SOCIALS = [
  {
    href: '#',
    label: 'Facebook',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Youtube',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    href: '#',
    label: 'LinkedIn',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0f2554] text-white">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center shadow-md">
                <Heart size={16} className="text-white fill-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">MediCare<span className="text-cyan-400">+</span></span>
                <p className="text-[10px] text-blue-300 tracking-wider">Smart Healthcare</p>
              </div>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed mb-6 max-w-xs">
              Nền tảng chăm sóc sức khỏe thông minh, kết nối bạn với các bác sĩ giỏi và dịch vụ y tế chất lượng cao.
            </p>
            {/* Socials */}
            <div className="flex gap-2">
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary-500 flex items-center justify-center transition-colors duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([col, items]) => (
            <div key={col}>
              <h4 className="font-bold text-white mb-4 text-sm">{col}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-blue-300 hover:text-white text-sm transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white mb-2 text-sm">Đăng ký nhận tin</h4>
            <p className="text-blue-300 text-xs mb-4 leading-relaxed">Nhận thông tin sức khỏe và ưu đãi mới nhất</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-blue-300 focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all"
              />
              <button className="w-10 h-10 flex-shrink-0 bg-primary-600 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <a href="tel:19001234" className="flex items-center gap-2 text-blue-300 hover:text-white text-xs transition-colors">
                <Phone size={13} />
                Hotline: 1900 1234
              </a>
              <a href="mailto:support@medicare.vn" className="flex items-center gap-2 text-blue-300 hover:text-white text-xs transition-colors">
                <Mail size={13} />
                support@medicare.vn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-400 text-xs">© 2024 MediCare+. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Đã đăng ký với Bộ Y Tế</span>
            <span className="mx-3 text-white/20">|</span>
            <Phone size={13} />
            <span>Hotline: 1900 1234</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
