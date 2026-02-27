interface MegaTecLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MegaTecLogo({ className, size = "md" }: MegaTecLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-sm" },
    md: { icon: 36, text: "text-lg" },
    lg: { icon: 48, text: "text-2xl" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      {/* Minimalist magnifying glass with circuit globe */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Magnifying glass circle */}
        <circle
          cx="20"
          cy="20"
          r="14"
          stroke="hsl(var(--sidebar-primary))"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Inner globe/circuit hint */}
        <circle
          cx="20"
          cy="20"
          r="10"
          stroke="hsl(var(--sidebar-foreground))"
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="none"
        />
        {/* Circuit lines inside */}
        <path
          d="M14 20h4l2-3 2 6 2-3h4"
          stroke="hsl(var(--sidebar-primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Circuit dots */}
        <circle cx="14" cy="20" r="1.2" fill="hsl(var(--sidebar-primary))" />
        <circle cx="28" cy="20" r="1.2" fill="hsl(var(--sidebar-primary))" />
        <circle cx="20" cy="14" r="1" fill="hsl(var(--sidebar-foreground))" fillOpacity="0.4" />
        <circle cx="20" cy="26" r="1" fill="hsl(var(--sidebar-foreground))" fillOpacity="0.4" />
        {/* Handle */}
        <line
          x1="30.5"
          y1="30.5"
          x2="42"
          y2="42"
          stroke="hsl(var(--sidebar-primary))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Pixel scatter (top-right) */}
        <rect x="32" y="8" width="2" height="2" rx="0.5" fill="hsl(var(--sidebar-primary))" opacity="0.7" />
        <rect x="36" y="6" width="1.5" height="1.5" rx="0.3" fill="hsl(var(--sidebar-primary))" opacity="0.5" />
        <rect x="34" y="4" width="1.5" height="1.5" rx="0.3" fill="hsl(var(--sidebar-primary))" opacity="0.3" />
        <rect x="38" y="10" width="1" height="1" rx="0.2" fill="hsl(var(--sidebar-primary))" opacity="0.4" />
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-tight ${s.text}`}>
          <span className="text-sidebar-foreground">Mega</span>
          <span className="text-sidebar-primary">Tec</span>
        </span>
        <span className={`font-display font-semibold tracking-widest text-sidebar-foreground/60 ${size === "sm" ? "text-[9px]" : size === "md" ? "text-[10px]" : "text-xs"}`}>
          SEARCH
        </span>
      </div>
    </div>
  );
}
