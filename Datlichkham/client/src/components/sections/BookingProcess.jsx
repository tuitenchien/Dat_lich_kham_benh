import { Search, CalendarCheck, CreditCard, Stethoscope } from 'lucide-react'

const STEPS = [
  {
    step: 1,
    icon: <Search size={28} />,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    title: 'Tìm bác sĩ',
    desc: 'Tìm kiếm bác sĩ hoặc chuyên khoa phù hợp',
  },
  {
    step: 2,
    icon: <CalendarCheck size={28} />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'Chọn lịch khám',
    desc: 'Chọn ngày giờ phù hợp với lịch trình của bạn',
  },
  {
    step: 3,
    icon: <CreditCard size={28} />,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    title: 'Thanh toán',
    desc: 'Thanh toán online an toàn & bảo mật',
  },
  {
    step: 4,
    icon: <Stethoscope size={28} />,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Khám bệnh',
    desc: 'Đến khám hoặc khám online dễ dàng',
  },
]

export default function BookingProcess() {
  return (
    <section className="py-14 bg-white">
      <div className="container-custom">
        {/* Header */}
        <h2 className="section-title mb-10">Quy trình đặt lịch khám</h2>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((s, idx) => (
            <div key={s.step} className="relative flex flex-col items-center text-center group">
              {/* Connector arrow (desktop only, not last item) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-[38px] left-[calc(50%+44px)] right-[calc(-50%+44px)] z-0">
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 h-0.5 bg-gray-200 rounded-full" />
                    ))}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M0 5h8M5 1l4 4-4 4" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon circle */}
              <div className={`relative z-10 w-20 h-20 rounded-2xl ${s.bg} border-2 ${s.border} flex items-center justify-center ${s.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {s.icon}
                {/* Step number badge */}
                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 ${s.border} flex items-center justify-center text-[11px] font-bold ${s.color}`}>
                  {s.step}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-[15px] mb-1.5">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[160px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
