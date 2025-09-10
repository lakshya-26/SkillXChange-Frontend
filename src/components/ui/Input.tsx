import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<any> | React.ComponentType;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon: Icon, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full py-3 rounded-lg border
              transition-all duration-200
              ${Icon ? "pl-10" : "px-4"}
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
