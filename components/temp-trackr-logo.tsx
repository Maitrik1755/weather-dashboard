export function TempTrackrLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Radar base circle */}
      <circle cx="20" cy="20" r="18" stroke="currentColor" className="text-primary" strokeWidth="1.5" opacity="0.3" />
      <circle cx="20" cy="20" r="12" stroke="currentColor" className="text-primary" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="20" r="6" stroke="currentColor" className="text-primary" strokeWidth="1.5" opacity="0.7" />

      {/* Radar sweep line with animation */}
      <line
        x1="20"
        y1="20"
        x2="32"
        y2="12"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 20 20"
          to="360 20 20"
          dur="3s"
          repeatCount="indefinite"
        />
      </line>

      {/* Weather tracking dots with pulse animation */}
      <circle cx="28" cy="12" r="2" fill="currentColor" className="text-blue-500">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="28" r="2" fill="currentColor" className="text-green-500">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="28" r="2" fill="currentColor" className="text-yellow-500">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Central weather station */}
      <circle cx="20" cy="20" r="3" fill="currentColor" className="text-primary" />
      <circle cx="20" cy="20" r="1.5" fill="white" />

      {/* Data streams */}
      <path
        d="M8 8 L12 12 M32 8 L28 12 M8 32 L12 28"
        stroke="currentColor"
        className="text-chart-2"
        strokeWidth="1.5"
        opacity="0.6"
        strokeDasharray="2,2"
      >
        <animate attributeName="stroke-dashoffset" values="0;4" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}
