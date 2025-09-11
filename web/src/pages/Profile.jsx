import React, { useEffect, useState } from 'react'

export default function Profile(){
  const [checkins, setCheckins] = useState(0)
  const [coupon, setCoupon] = useState(null)

  function simulateCheckin(){
    setCheckins(n => {
      const x = n+1
      if (x>=3 && !coupon) setCoupon('CUPON-IBG-10')
      return x
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold">Tu perfil</h2>
      <div className="mt-3 grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4">
          <div className="font-medium">Sellos de barrio</div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {['Centro Musical','Belén','La Pola'].map((b,i)=> (
              <div key={i} className={`border rounded p-3 text-center ${i<checkins?'bg-emerald-50 border-emerald-300':''}`}>{b}</div>
            ))}
          </div>
          <button className="mt-3 text-sm underline" onClick={simulateCheckin}>Simular check‑in</button>
        </div>
        <div className="bg-white rounded-xl p-4">
          <div className="font-medium">Beneficios</div>
          {coupon ? (
            <div className="mt-2 p-3 border rounded bg-yellow-50">Cupón disponible: <b>{coupon}</b></div>
          ) : (
            <div className="mt-2 text-sm text-gray-600">Completa 3 check‑ins para desbloquear un cupón.</div>
          )}
        </div>
      </div>
    </div>
  )
}
