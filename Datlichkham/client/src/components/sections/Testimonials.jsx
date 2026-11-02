import { Star, Quote } from 'lucide-react'
import { useState, useEffect } from 'react'

const HARDCODED_REVIEWS = [
  {
    _id: 1,
    patientId: { fullName: 'Nguyễn Thị Hương', address: { city: 'Hà Nội' }, avatar: null },
    rating: 5,
    comment: 'Dịch vụ tuyệt vời! Đặt lịch nhanh chóng, bác sĩ tư vấn tận tâm. Tôi rất hài lòng với trải nghiệm này.',
  },
  {
    _id: 2,
    patientId: { fullName: 'Trần Văn Nam', address: { city: 'TP. Hồ Chí Minh' }, avatar: null },
    rating: 5,
    comment: 'Giao diện dễ sử dụng, nhiều bác sĩ giỏi. Tôi đã giới thiệu cho nhiều người thân và bạn bè.',
  },
  {
    _id: 3,
    patientId: { fullName: 'Lê Thị Mai', address: { city: 'Đà Nẵng' }, avatar: null },
    rating: 5,
    comment: 'Khám online rất tiện lợi, tiết kiệm thời gian mà vẫn được bác sĩ tư vấn kỹ lưỡng và chuyên nghiệp.',
  },
]

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [reviews, setReviews] = useState(HARDCODED_REVIEWS)
  const [active, setActive] = useState(0)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/reviews?limit=6`)
      .then((res) => res.json())
      .then((data) => {
        if (data.metadata && data.metadata.length > 0) {
          setReviews(data.metadata)
        }
      })
      .catch((err) => console.error('Lỗi khi tải đánh giá:', err))
  }, [])

  const prev = () => setActive((v) => (v - 1 + reviews.length) % reviews.length)
  const next = () => setActive((v) => (v + 1) % reviews.length)

  return (
    <section className="py-16 bg-[#f8faff]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="section-title text-center mb-2">Bệnh nhân nói gì về chúng tôi</h2>
          <p className="text-gray-500 text-sm">Hàng nghìn bệnh nhân đã tin tưởng và hài lòng với dịch vụ</p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Prev arrow */}
          <button
            onClick={prev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors hidden md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {reviews.map((r, idx) => {
            const patient = r.patientId || {};
            const name = patient.fullName || 'Khách ẩn danh';
            const location = patient.address?.city || 'Việt Nam';
            const avatarUrl = patient.avatar;
            const fallbackAvatar = name.substring(0, 2).toUpperCase();

            return (
              <div
                key={r._id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                  idx === active
                    ? 'border-primary-200 shadow-card scale-[1.02]'
                    : 'border-transparent hover:border-gray-100'
                }`}
              >
                {/* Quote icon */}
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <Quote size={14} className="text-primary-500" />
                </div>

                {/* Review text */}
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{r.comment || 'Tuyệt vời!'}</p>

                {/* Stars */}
                <StarRating count={r.rating} />

                {/* Author */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                      {fallbackAvatar}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{location}</p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Next arrow */}
          <button
            onClick={next}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors hidden md:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? 'w-6 h-2 bg-primary-600' : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
