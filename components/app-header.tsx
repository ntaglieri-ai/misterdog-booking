import Image from "next/image"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between bg-[#87CEEB] px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/60">
          <Image
            src="/images/misterdog-logo.jpeg"
            alt="Mister Dog Pet Salon"
            width={44}
            height={44}
            className="h-full w-full object-cover"
            priority
          />
        </span>
        <div className="leading-tight">
          <div className="font-display text-[18px] font-semibold text-[#1A2E5A]">
            Mister Dog
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#1A2E5A]/70">
            Pet Salon · Desk
          </div>
        </div>
      </div>
      <div className="text-right text-[11px] font-medium leading-tight text-[#1A2E5A]">
        Avezzano
        <br />
        <span className="text-[#1A2E5A]/60">★★★★★</span>
      </div>
    </header>
  )
}
