import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
