// components/StarLoader.jsx
export default function Loading() {
  return (
    <div className="loader-wrap">
      <svg className="star" viewBox="-160 -160 320 320" xmlns="http://www.w3.org/2000/svg" >
        <defs>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="shardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa"/>
            <stop offset="50%" stopColor="#6d28d9"/>
            <stop offset="100%" stopColor="#4c1d95"/>
          </linearGradient>
        </defs>
        <g className="rotor">
          {[0, 72, 144, 216, 288].map((deg) => (
            <g key={deg} className="shard" style={{ transform: `rotate(${deg}deg)` }}>
              <path className="shape" d="M 0,-25 L 14,-95 L 0,-140 L -14,-95 Z"/>
            </g>
          ))}
        </g>
      </svg>
      <style jsx>{`
        .loader-wrap { display: flex; align-items: center; justify-content: center; background: #000; }
        .star { width: 300px; height: 300px; overflow: visible; filter: url(#glow); }
        .rotor { transform-origin: 0 0; animation: spin 5.58s linear infinite; }
        .shard { transform-origin: 0 0; }
        .shape { fill: url(#shardGrad); stroke: #c4b5fd; stroke-width: 3; stroke-linejoin: round; animation: scatter 2.4s ease-in-out infinite; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes scatter {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          35%, 60% { transform: translateY(-45px) scale(0.92); opacity: 0.85; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}