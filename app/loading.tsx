export default function Loading() {
  return (
    <div className="printer-loader">
      <div className="brand">
        <div className="brand-mark">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="5" width="13" height="8" rx="2" stroke="white" strokeWidth="1.5" />
            <rect x="3" y="1" width="9" height="6" rx="1.5" stroke="white" strokeWidth="1.5" />
            <line x1="4.5" y1="9" x2="10.5" y2="9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="4.5" y1="11.2" x2="8" y2="11.2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="brand-name">
          Print<span>Eve</span>
        </div>
      </div>

      <div className="scene">
        <div className="paper-outer">
          <div className="paper">
            <div className="pl pl-1" />
            <div className="pl pl-2" />
            <div className="pl pl-3" />
            <div className="pl pl-4" />
            <div className="pl pl-5" />
            <div className="pl pl-6" />
          </div>
        </div>

        <svg className="printer-svg" viewBox="0 0 96 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="24" y="2" width="48" height="24" rx="6" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.8" />
          <line x1="32" y1="9" x2="64" y2="9" stroke="#e5e7eb" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="32" y1="14" x2="56" y2="14" stroke="#e5e7eb" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="4" y="20" width="88" height="38" rx="9" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.8" />
          <rect x="28" y="19" width="40" height="6" rx="3" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
          <rect className="slot-glow" x="28" y="19" width="40" height="6" rx="3" fill="#22c55e" opacity="0.15" />
          <rect className="slot-glow" x="33" y="20.5" width="30" height="3" rx="1.5" fill="#22c55e" opacity="0.45" />
          <rect x="26" y="50" width="44" height="5" rx="2.5" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.4" />
          <circle className="led" cx="78" cy="35" r="3.5" fill="#22c55e" />
          <line x1="10" y1="30" x2="10" y2="50" stroke="#f3f4f6" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="15" y1="30" x2="15" y2="50" stroke="#f3f4f6" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="20" y1="30" x2="20" y2="50" stroke="#f3f4f6" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="status-wrap">
        <div className="msg">Preparing your print…</div>
        <div className="msg">Warming up the printer…</div>
        <div className="msg">Your print is on its way…</div>
        <div className="msg">Applying finishing touches…</div>
        <div className="msg">Almost ready…</div>
        <div className="msg">Printing with care…</div>
        <div className="msg">Generating sharp details…</div>
        <div className="msg">Finalizing your order…</div>
      </div>

      <div className="dots">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  )
}
