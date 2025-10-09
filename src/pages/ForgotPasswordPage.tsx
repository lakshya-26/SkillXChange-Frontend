import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AtSign, MailCheck, ArrowLeft } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { authService } from "../services/auth.service";

type FormInputs = {
  email: string;
};

const ForgotPasswordPage: React.FC = () => {
  const [linkSent, setLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    setErrorMessage(null);
    try {
      await authService.forgotPassword(data.email);
      setLinkSent(true);
    } catch (error: any) {
      setErrorMessage(
        error.message || "Failed to send reset link. Please try again."
      );
      setLinkSent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-gray-600">
            {linkSent
              ? "Check your inbox for the next steps."
              : "No worries! Enter your email and we'll send you a reset link."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[250px] flex flex-col justify-center">
          {linkSent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <MailCheck
                className="mx-auto h-16 w-16 text-green-500"
                strokeWidth={1.5}
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">
                Reset Link Sent!
              </h3>
              <p className="mt-2 text-gray-600">
                A password reset link has been sent to your email address.
                Please check your inbox and follow the instructions.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <Input
                icon={AtSign}
                type="email"
                placeholder="Your registered email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email?.message}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </motion.form>
          )}
          {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-600">
              {errorMessage}
            </p>
          )}
          <p className="mt-8 text-center text-sm text-gray-600">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
