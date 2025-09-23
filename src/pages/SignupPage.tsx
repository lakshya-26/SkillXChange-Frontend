import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Step1_BasicDetails from "../components/signup/Step1_BasicDetails";
import Step2_SkillsToLearn from "../components/signup/Step2_SkillsToLearn";
import Step3_SkillsToTeach from "../components/signup/Step3_SkillsToTeach";
import Step4_AdditionalInfo from "../components/signup/Step4_AdditionalInfo";

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (data: object) => {
    setFormData((prev) => ({ ...prev, ...data }));
    nextStep();
  };

  const submitForm = async (data: object) => {
    const finalData = { ...formData, ...data };
    console.log("Submitting form data:", finalData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted successfully!");
    navigate("/dashboard", { replace: true });
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1_BasicDetails
            key="step1"
            updateFormData={updateFormData}
            formData={formData}
          />
        );
      case 2:
        return (
          <Step2_SkillsToLearn
            key="step2"
            updateFormData={updateFormData}
            prevStep={prevStep}
            formData={formData}
          />
        );
      case 3:
        return (
          <Step3_SkillsToTeach
            key="step3"
            updateFormData={updateFormData}
            prevStep={prevStep}
            formData={formData}
          />
        );
      case 4:
        return (
          <Step4_AdditionalInfo
            key="step4"
            submitForm={submitForm}
            prevStep={prevStep}
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-4">
           <Link to="/" className="inline-block">
                <div className="flex items-center justify-center space-x-2">
                    <img src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png" alt="SkillXChange Logo" className="w-10 h-10 object-contain" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">SkillXChange</span>
                </div>
           </Link>
        </div>
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-xl w-full relative"
        >
          <div className="p-8">
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
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>
        </motion.div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
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