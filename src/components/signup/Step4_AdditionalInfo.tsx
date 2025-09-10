import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { MapPin, Phone, Github, Info } from "lucide-react";

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface Step4Props {
  submitForm: (data: object) => void;
  prevStep: () => void;
  formData: any;
}

const Step4_AdditionalInfo: React.FC<Step4Props> = ({
  submitForm,
  prevStep,
  formData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: formData });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <div className="inline-block p-3 bg-purple-100 rounded-full mb-2">
          <Info className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Almost There!</h2>
        <p className="text-gray-500">
          Provide some additional details to complete your profile.
        </p>
      </motion.div>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <motion.div variants={itemVariants}>
          <Input
            icon={MapPin}
            placeholder="Address"
            {...register("address", { required: "Address is required" })}
            error={errors.address?.message as string}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Input
            icon={Phone}
            placeholder="Phone Number (optional)"
            {...register("phoneNumber")}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Social Links (optional)
          </p>
          <div className="space-y-3">
            <Input
              icon={InstagramIcon}
              placeholder="Instagram username"
              {...register("instagram")}
            />
            <Input
              icon={XIcon}
              placeholder="X (Twitter) handle"
              {...register("twitter")}
            />
            <Input
              icon={Github}
              placeholder="GitHub username"
              {...register("github")}
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex justify-between pt-4"
        >
          <Button onClick={prevStep} variant="secondary">
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Submitting..." : "Complete Signup"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Step4_AdditionalInfo;
