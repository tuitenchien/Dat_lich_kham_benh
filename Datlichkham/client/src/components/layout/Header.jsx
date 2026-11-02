import { useState, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Drawer, Dropdown } from 'antd'
import { Search, Calendar, Menu, X, Phone, User, LogOut, UserCircle, MessageSquare } from 'lucide-react'
import Cookies from 'js-cookie'
import Context from '../../store/Context'
import { useSocket } from '../../context/SocketContext'
import NotificationBell from './NotificationBell'

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Bác sĩ', href: '/bac-si' },
  { label: 'Cơ sở y tế', href: '/co-so-y-te' },
  { label: 'Chuyên khoa', href: '/chuyen-khoa' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Liên hệ', href: '/lien-he' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  
  // Context & Auth
  const { dataUser } = useContext(Context)
  const { unreadCount, pendingCount } = useSocket() || {}
  const isLoggedIn = !!Cookies.get('logged')

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  const handleLogout = () => {
    Cookies.remove('logged')
    Cookies.remove('tokenResetPassword')
    window.location.href = '/' // Tải lại trang và về trang chủ
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: <Link to="/ho-so">Hồ sơ cá nhân</Link>,
    },
    {
      key: 'appointments',
      icon: <Calendar size={16} />,
      label: <Link to="/ho-so/lich-kham">Lịch khám của tôi</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center shadow-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="white"
                    opacity="0.9"
                  />
                  <path d="M7 12h2l1.5-3L13 15l1.5-3H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-primary-700 tracking-tight">
                  MediCare<span className="text-cyan-500">+</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider">
                  Smart Healthcare
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`header-nav-link ${isActive(link.href) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Actions ── */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Search icon */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                aria-label="Tìm kiếm"
              >
                <Search size={18} />
              </button>

              {isLoggedIn ? (
                <>
                  <NotificationBell />
                  {/* Message badge */}
                  <Link to="/ho-so/tin-nhan" className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <MessageSquare size={18} />
                    {(unreadCount > 0 || pendingCount > 0) && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                        {(unreadCount + pendingCount) > 9 ? '9+' : (unreadCount + pendingCount)}
                      </span>
                    )}
                  </Link>
                  <Link to="/bac-si">
                    <button className="btn-primary">
                      <Calendar size={16} />
                      Đặt lịch
                    </button>
                  </Link>
                  
                  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                    <button className="flex items-center gap-2 hover:bg-gray-50 py-1 pl-1 pr-3 rounded-full border border-gray-200 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase">
                        {dataUser?.fullName ? dataUser.fullName.charAt(0) : <UserCircle size={18} />}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                        {dataUser?.fullName || 'Người dùng'}
                      </span>
                    </button>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register">
                    <button className="btn-primary">
                      Đăng ký
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* ── Search Bar (expandable) ── */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              searchOpen ? 'max-h-16 pb-3' : 'max-h-0'
            }`}
          >
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm bác sĩ, chuyên khoa, bệnh viện..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-gray-50 transition-all"
                autoFocus={searchOpen}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Spacer ── */}
      <div className="h-[68px]" />

      {/* ── Mobile Drawer ── */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        width={280}
        styles={{
          body: { padding: 0 },
          header: { display: 'none' },
        }}
      >
        <div className="flex flex-col h-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-cyan-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="white"
                  />
                  <path d="M7 12h2l1.5-3L13 15l1.5-3H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-primary-700">
                MediCare<span className="text-cyan-500">+</span>
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 bg-gray-50"
              />
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium mb-1 transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Auth & Actions */}
          <div className="px-5 pb-6 space-y-3 border-t border-gray-100 pt-4">
            {isLoggedIn ? (
              <>
                <Link to="/ho-so" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <User size={18} />
                  <span className="text-sm font-medium">Hồ sơ ({dataUser?.fullName || 'Người dùng'})</span>
                </Link>
                <Link to="/bac-si" onClick={() => setMobileOpen(false)}>
                  <button className="btn-primary w-full justify-center">
                    <Calendar size={15} />
                    Đặt lịch ngay
                  </button>
                </Link>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full py-2.5 mb-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    Đăng nhập
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <button className="btn-primary w-full justify-center">
                    Đăng ký
                  </button>
                </Link>
              </>
            )}
            
            <a
              href="tel:19001234"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors pt-4"
            >
              <Phone size={14} />
              Hotline: 1900 1234
            </a>
          </div>
        </div>
      </Drawer>
    </>
  )
}

