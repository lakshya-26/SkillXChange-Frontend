import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "transparent";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  to?: string;
  state?: { background?: any };
  type?: "button" | "submit" | "reset";
  baseClassRequired?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  to,
  state,
  type = "button",
  baseClassRequired = true,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 focus:ring-blue-500",
    ghost:
      "text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    transparent:
      "bg-transparent text-gray-700 hover:text-gray-900 focus:ring-gray-500",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const combinedClasses = `${baseClassRequired ? baseClasses : ""} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} state={state} className={combinedClasses}>
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className="flex items-center justify-center w-full h-full"
        >
          {children}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
};

export default Button;
