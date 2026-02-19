import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 30, text: "text-xl" },
  lg: { icon: 36, text: "text-2xl" },
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
        {/* Background */}
        <rect x="2" y="2" width="32" height="32" rx="8" fill="#E50914" />

        {/* Film perforations — left */}
        <rect
          x="5"
          y="7"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />
        <rect
          x="5"
          y="13"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />
        <rect
          x="5"
          y="19"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />
        <rect
          x="5"
          y="25"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />

        {/* Film perforations — right */}
        <rect
          x="28.5"
          y="7"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />
        <rect
          x="28.5"
          y="13"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />
        <rect
          x="28.5"
          y="19"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />
        <rect
          x="28.5"
          y="25"
          width="2.5"
          height="2.5"
          rx="0.5"
          fill="rgba(0,0,0,0.3)"
        />

        {/* Play triangle */}
        <path d="M14 11L24 18L14 25V11Z" fill="white" />
      </svg>
      <span className={`${text} font-black tracking-tight text-white`}>
        Miny<span className="text-primary">Cine</span>
      </span>
    </Link>
  );
};
