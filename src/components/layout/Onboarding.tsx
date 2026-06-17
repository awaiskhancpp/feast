'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import PinLoginLayout from '../pin_login/PinLoginLayout'

const reviews = [
  {
    type: 'Customer',
    name: 'Robert Howard',
    rating: 5,
    img: '/onboarding/img1.png',
    text: 'Ethan is perfect for remote work with its cozy ambiance, and friendly staff. Plus, the great food makes it even more enjoyable.',
  },
  {
    type: 'Customer',
    name: 'Ronald Richards',
    rating: 5,
    img: '/onboarding/img2.png',
    text: 'The quality of the food matches its stunning presentation, ensuring a memorable dining experience every time.',
  },
  {
    type: 'Customer',
    name: 'Dianne Russell',
    rating: 5,
    img: '/onboarding/img3.png',
    text: "It's the perfect place to enjoy a diverse and tasty culinary experience, with new and exciting flavors to discover each visit.",
  },
  {
    type: 'Customer',
    name: 'Robert Howard',
    rating: 5,
    img: '/onboarding/img1.png',
    text: 'Ethan is perfect for remote work with its cozy ambiance, and friendly staff. Plus, the great food makes it even more enjoyable.',
  },
]

export default function OnBoarding() {
  const [current, setCurrent] = useState(0)

  // Restart the 4s timer whenever current changes (covers both auto + manual click)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [current])

  return (
    <section className="grid grid-cols-12 min-h-screen">
      {/* ── Left panel — carousel, lg and up only ── */}
      <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative overflow-hidden">
        {/* All images stacked; only the active one is visible */}
        {reviews.map((r, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image src={r.img} alt={r.name} fill className="object-cover" />
          </div>
        ))}

        {/* Gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-10">
          {/* Text blocks — cross-fade with a subtle upward float */}
          <div className="relative lg:h-[250px] xl:h-[200px]">
            {reviews.map((r, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  i === current
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                <h3 className="text-white font-semibold text-3xl leading-snug">{r.text}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/90 text-sm font-medium">
                    {r.name} — {r.type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: r.rating }).map((_, m) => (
                      <Image key={m} src="/icons/starIcon.svg" alt="star" width={16} height={16} />
                    ))}
                    <span className="text-white text-sm ml-1">{r.rating}.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex items-center gap-2 ">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-white w-7' : 'bg-gray-400 w-2.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — pin login: full width until lg, then 5/12 ── */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex justify-center items-center px-4 py-10">
        <PinLoginLayout />
      </div>
    </section>
  )
}
