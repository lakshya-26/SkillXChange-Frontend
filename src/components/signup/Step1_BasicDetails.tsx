import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { User, AtSign, Briefcase, Lock, Zap } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface Step1Props {
  updateFormData: (data: object) => void;
  formData: any;
}

const Step1_BasicDetails: React.FC<Step1Props> = ({
  updateFormData,
  formData,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: formData });

  const password = watch("password");

  const onSubmit = (data: object) => {
    updateFormData(data);
  };

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
        <div className="inline-block p-3 bg-blue-100 rounded-full mb-2">
          <Zap className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Let's Start with the Basics
        </h2>
        <p className="text-gray-500">Create your SkillXChange account.</p>
      </motion.div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div variants={itemVariants}>
          <Input
            icon={User}
            placeholder="Full Name"
            {...register("name", { required: "Full Name is required" })}
            error={errors.name?.message as string}
          />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            icon={User}
            placeholder="Username"
            {...register("username", { required: "Username is required" })}
            error={errors.username?.message as string}
          />
          <Input
            icon={Briefcase}
            placeholder="Profession"
            {...register("profession", { required: "Profession is required" })}
            error={errors.profession?.message as string}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Input
            icon={AtSign}
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message as string}
          />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={errors.password?.message as string}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message as string}
          />
        </motion.div>
        <motion.div variants={itemVariants} className="pt-4">
          <Button type="submit" className="w-full" size="lg">
            Next: Choose Skills to Learn
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Step1_BasicDetails;
