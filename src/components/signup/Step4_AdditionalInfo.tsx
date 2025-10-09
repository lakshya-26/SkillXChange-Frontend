import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { MapPin, Phone, Github, Info, Linkedin, Instagram, Twitter } from "lucide-react";

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
              icon={Instagram}
              placeholder="Instagram username"
              {...register("instagram")}
            />
            <Input
              icon={Twitter}
              placeholder="X (Twitter) handle"
              {...register("twitter")}
            />
            <Input
              icon={Github}
              placeholder="GitHub username"
              {...register("github")}
            />
            <Input
              icon={Linkedin}
              placeholder="Linkedin username"
              {...register("linkedin")}
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
