import React from "react";
import { motion } from "framer-motion";

interface SkillCardProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  icon,
  label,
  isSelected,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isSelected ? 1.05 : 1,
        borderColor: isSelected ? "#2563EB" : "#E5E7EB",
        backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="cursor-pointer p-4 border-2 rounded-xl text-center flex flex-col items-center justify-center space-y-2"
    >
      <div className="w-10 h-10">{icon}</div>
      <p
        className={`font-medium text-sm transition-colors ${
          isSelected ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
};

export default SkillCard;
