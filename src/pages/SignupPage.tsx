import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import Step1_BasicDetails from "../components/signup/Step1_BasicDetails";
import Step2_SkillsToLearn from "../components/signup/Step2_SkillsToLearn";
import Step3_SkillsToTeach from "../components/signup/Step3_SkillsToTeach";
import Step4_AdditionalInfo from "../components/signup/Step4_AdditionalInfo";
import { authService } from "../services/auth.service";

interface SignupFormData {
  name: string;
  username: string;
  email: string;
  profession: string;
  skillsToLearn: string[];
  skillsToTeach: string[];
  address: string;
  phoneNumber?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  googleToken: string;
}

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>(
    {} as SignupFormData,
  );
  const [googleAuthStarted, setGoogleAuthStarted] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Update form data and optionally go to next step
  const updateFormData = (data: Partial<SignupFormData>, goNext = true) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (goNext) nextStep();
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const submitForm = async (data: Partial<SignupFormData>) => {
    const finalData = { ...formData, ...data };
    try {
      await authService.signup(
        finalData.name,
        finalData.username,
        finalData.email,
        finalData.profession,
        finalData.skillsToLearn,
        finalData.skillsToTeach,
        finalData.address,
        finalData.googleToken!,
        finalData.phoneNumber,
        finalData.instagram,
        finalData.twitter,
        finalData.github,
        finalData.linkedin,
      );
      console.log("Form submitted successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      if (response.access_token) {
        const res = await authService.checkGoogleUser(response.access_token);
        const data = res.data;
        if (data.exists) {
          alert(data.message || "Email already exists. Please log in.");
          navigate("/login");
        } else {
          setFormData((prev) => ({
            ...prev,
            googleToken: response.access_token,
            email: data.email,
            name: data.name || "",
          }));
          setGoogleAuthStarted(true);
        }
      }
    } catch (e: any) {
      console.error("Google Signup Error:", e);
      alert("Google Sign In Failed: " + (e.message || "Unknown error"));
    }
  };

  const loginIndex = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      console.log("Signup Google Failed");
      alert("Google Sign Up Failed");
    },
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1_BasicDetails
            key={formData.email || "step1"}
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <Step2_SkillsToLearn
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Step3_SkillsToTeach
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <Step4_AdditionalInfo
            formData={formData}
            submitForm={submitForm}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };

  if (!googleAuthStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
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
                Join the Community
              </h2>
              <p className="mt-2 text-gray-600">
                Sign in with Google to create your account.
              </p>
            </div>

            <button
              onClick={() => loginIndex()}
              className="flex items-center justify-center bg-white text-[#4285F4] border-2 border-[#4285F4] rounded shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden w-full max-w-[300px]"
            >
              <div className="p-3 h-full flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dca9jrn70/image/upload/v1768997710/google-icon-logo-svgrepo-com_xdezam.svg"
                  alt="G"
                  className="w-6 h-6"
                />
              </div>
              <div className="font-medium pr-3 font-roboto">
                Sign up with Google
              </div>
            </button>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
  // ... return main ...

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-4">
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
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl w-full relative"
        >
          <div className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">
                  Step {step} of {totalSteps}
                </h3>
                <p className="text-sm text-gray-500">
                  {Math.round(progress)}% Complete
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Step Content with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
