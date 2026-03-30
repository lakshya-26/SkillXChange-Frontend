import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "transparent";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (e?: any) => void;
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
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/30 hover:shadow-primary/40 focus:ring-ring",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring border border-border",
    outline:
      "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground focus:ring-ring",
    ghost:
      "hover:bg-accent hover:text-accent-foreground text-foreground/80 focus:ring-ring",
    transparent:
      "bg-transparent text-foreground hover:text-foreground/80 focus:ring-ring",
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
