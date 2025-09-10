import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Step1_BasicDetails from "../components/signup/Step1_BasicDetails";
import Step2_SkillsToLearn from "../components/signup/Step2_SkillsToLearn";
import Step3_SkillsToTeach from "../components/signup/Step3_SkillsToTeach";
import Step4_AdditionalInfo from "../components/signup/Step4_AdditionalInfo";
import { X } from "lucide-react";

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (data: object) => {
    setFormData((prev) => ({ ...prev, ...data }));
    nextStep();
  };

  const submitForm = async (data: object) => {
    const finalData = { ...formData, ...data };
    console.log("Submitting form data:", finalData);
    // Dummy API call
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => navigate("/")}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 pb-6">
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
    </motion.div>
  );
};

export default SignupPage;
