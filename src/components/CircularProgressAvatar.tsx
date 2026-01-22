import React from "react";

interface CircularProgressAvatarProps {
  score: number;
  imageUrl?: string | null;
  initials: string;
  size?: number;
  onClick?: () => void;
  isEditable?: boolean;
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
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return "#10b981"; // emerald-500
    if (score >= 50) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size + 20 }} // Extra space for text below
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Progress Circle SVG */}
        <svg
          width={size}
          height={size}
          className="absolute top-0 left-0 transform -rotate-90 z-10 pointer-events-none"
        >
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb" // gray-200
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Avatar Image/Initials */}
        <button
          type="button"
          onClick={onClick}
          disabled={!onClick}
          className={`absolute top-0 left-0 w-full h-full rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-inner z-20 ${
            isEditable ? "cursor-pointer hover:opacity-90" : "cursor-default"
          }`}
          style={{ padding: strokeWidth + 2 }} // Indent slightly to fit inside ring
          title={isEditable ? "Change profile picture" : undefined}
        >
          <div className="w-full h-full rounded-full overflow-hidden relative">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold text-3xl">
                {initials}
              </span>
            )}

            {/* Edit Overlay (optional hint) */}
            {isEditable && (
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
            )}
          </div>
        </button>
      </div>

      {/* Percentage Label */}
      <div
        className="absolute -bottom-2 bg-white px-2 py-0.5 font-bold text-sm"
        style={{ color: getColor() }}
      >
        {score}%
      </div>
    </div>
  );
};

export default CircularProgressAvatar;
