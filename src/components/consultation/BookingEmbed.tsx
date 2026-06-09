// src/components/consultation/BookingEmbed.tsx
'use client'
import Cal, { getCalApi } from "@calcom/embed-react"
import { useEffect } from "react"

export default function BookingEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi()
      cal("ui", { 
        styles: { branding: { brandColor: "#2E5CA9" } },
        hideEventTypeDetails: false,
        layout: "month_view"
      })
    })()
  }, [])

  return (
    <div className="w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-darkBlue/10 border border-brand-lightBlue/5">
      <Cal
        calLink={process.env.NEXT_PUBLIC_CAL_USERNAME || "dokita-eleyin"}
        style={{ width: "100%", height: "100%", minHeight: "700px" }}
        config={{ layout: 'month_view' }}
      />
    </div>
  )
}

