import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
};

export const Logo = ({ size = "lg" }: LogoProps) => {
  const { icon, text } = sizeMap[size];

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]"
      >
        {/* Popcorn bucket — bottom trapezoid */}
        <path d="M8 16L10 32H26L28 16H8Z" fill="#E50914" />
        {/* Bucket stripes */}
        <path
          d="M12 16L13.5 32"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />
        <path
          d="M18 16V32"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />
        <path
          d="M24 16L22.5 32"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />

        {/* Popcorn kernels — fluffy top */}
        <circle cx="13" cy="12" r="4.5" fill="#FFF8DC" />
        <circle cx="23" cy="12" r="4.5" fill="#FFF8DC" />
        <circle cx="18" cy="10" r="5" fill="#FFFDE7" />
        <circle cx="10" cy="14" r="3.5" fill="#FFF3CD" />
        <circle cx="26" cy="14" r="3.5" fill="#FFF3CD" />
        <circle cx="15" cy="8" r="3.5" fill="#FFFDE7" />
        <circle cx="21" cy="8" r="3.5" fill="#FFF8DC" />
        <circle cx="18" cy="14" r="4" fill="#FFFDE7" />

        {/* Bucket rim */}
        <rect x="7" y="15" width="22" height="2.5" rx="1" fill="#CC0812" />
      </svg>
      <span className={`${text} font-black tracking-tight text-white`}>
        Miny<span className="text-primary">Cine</span>
      </span>
    </Link>
  );
};
