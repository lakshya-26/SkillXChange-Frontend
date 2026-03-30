import React from "react";

interface CircularProgressAvatarProps {
  score: number;
  imageUrl?: string | null;
  initials: string;
  size?: number;
  onClick?: () => void;
  isEditable?: boolean;
  className?: string; // Added prop
}

const CircularProgressAvatar: React.FC<CircularProgressAvatarProps> = ({
  score,
  imageUrl,
  initials,
  size = 120,
  onClick,
  isEditable = false,
}) => {
  const strokeWidth = 6;
  // Stroke is centered on this radius so the ring sits flush inside the SVG box
  const ringRadius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;

  // Inner disc: fits inside the ring’s inner edge (clean white collar)
  const innerSize = size - strokeWidth * 2;

  const getColor = () => {
    if (score >= 90) return "#10b981"; // emerald-500
    if (score >= 70) return "#3b82f6"; // blue-500
    if (score >= 50) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const accent = getColor();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 z-0 -rotate-90 pointer-events-none"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke="#cbd5e1"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`absolute left-1/2 top-1/2 z-10 box-border -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[4px] border-white bg-slate-100 shadow-sm ${
          isEditable ? "cursor-pointer hover:opacity-95" : "cursor-default"
        }`}
        style={{ width: innerSize, height: innerSize }}
        title={isEditable ? "Change profile picture" : undefined}
      >
        <div className="relative h-full w-full">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 font-bold text-white"
              style={{ fontSize: Math.round(innerSize * 0.32) }}
            >
              {initials}
            </span>
          )}
          {isEditable && (
            <div className="absolute inset-0 bg-black/10 transition-colors hover:bg-black/20" />
          )}
        </div>
      </button>
    </div>
  );
};

export default CircularProgressAvatar;
