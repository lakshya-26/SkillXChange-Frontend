import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, AlertTriangle, CheckCircle } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

type FormInputs = {
  password?: string;
  confirmPassword?: string;
};

type ApiStatus = {
  type: "success" | "error";
  message: string;
};

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setApiStatus({
        type: "error",
        message: "Invalid or missing reset token. Please request a new link.",
      });
    }
  }, [token]);

  const onSubmit = async (data: FormInputs) => {
    console.log("Resetting password with token:", token, data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const apiOutcome = "success";

    if (apiOutcome === "success") {
      setApiStatus({
        type: "success",
        message: "Password reset successfully!",
      });
    } else if (apiOutcome === "token_expired") {
      setApiStatus({
        type: "error",
        message: "Reset token has expired or is invalid.",
      });
    } else {
      setApiStatus({ type: "error", message: "User not found." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set a New Password
          </h2>
          <p className="mt-2 text-gray-600">
            Choose a strong, new password for your account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[300px] flex items-center justify-center">
          {apiStatus ? (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {apiStatus.type === "success" ? (
                <CheckCircle
                  className="mx-auto h-16 w-16 text-green-500"
                  strokeWidth={1.5}
                />
              ) : (
                <AlertTriangle
                  className="mx-auto h-16 w-16 text-red-500"
                  strokeWidth={1.5}
                />
              )}
              <p
                className={`mt-4 text-lg font-medium ${
                  apiStatus.type === "success"
                    ? "text-gray-800"
                    : "text-red-700"
                }`}
              >
                {apiStatus.message}
              </p>
              {apiStatus.type === "success" && (
                <Button
                  onClick={() => navigate("/login")}
                  className="mt-6"
                  size="lg"
                >
                  Back to Login
                </Button>
              )}
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <Input
                icon={Lock}
                type="password"
                placeholder="New Password"
                {...register("password", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                error={errors.password?.message}
                disabled={!token}
              />
              <Input
                icon={Lock}
                type="password"
                placeholder="Confirm New Password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                error={errors.confirmPassword?.message}
                disabled={!token}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? "Saving..." : "Set New Password"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
