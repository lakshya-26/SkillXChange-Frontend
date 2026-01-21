import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { authService } from "../services/auth.service";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    setError,
    formState: { errors },
  } = useForm();

  const handleGoogleSuccess = async (response: any) => {
    try {
      // response has access_token
      if (response.access_token) {
        await authService.loginWithGoogle(response.access_token);
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      if (
        error.message.includes("sign up") ||
        error.message.includes("User not found")
      ) {
        navigate("/signup");
      } else {
        setError("root", { type: "manual", message: error.message });
      }
    }
  };

  const loginIndex = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      console.log("Login Failed");
      setError("root", {
        type: "manual",
        message: "Google Login Failed",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center space-x-2">
                <img
                  src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png"
                  alt="SkillXChange Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  SkillXChange
                </span>
              </div>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back!
            </h2>
            <p className="mt-2 text-gray-600">Login with Google to continue.</p>
          </div>

          {errors.root && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm w-full text-center">
              {errors.root.message as string}
            </div>
          )}

          <button
            onClick={() => loginIndex()}
            className="flex items-center justify-center bg-white text-[#4285F4] border-2 border-[#4285F4] rounded shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden w-full max-w-[300px]"
          >
            <div className="bg-white p-3 h-full flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dca9jrn70/image/upload/v1768997710/google-icon-logo-svgrepo-com_xdezam.svg"
                alt="G"
                className="w-6 h-6"
              />
            </div>
            <div className="font-medium pr-3 font-roboto">
              Log in with Google
            </div>
          </button>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
