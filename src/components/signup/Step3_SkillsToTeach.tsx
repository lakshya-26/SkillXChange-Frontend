import React from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { Award } from "lucide-react";
import SkillSelector from "./SkillSelector";

interface Step3Props {
  updateFormData: (data: object) => void;
  prevStep: () => void;
  formData: any;
}

const Step3_SkillsToTeach: React.FC<Step3Props> = ({
  updateFormData,
  prevStep,
  formData,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { skillsToTeach: formData.skillsToTeach || [] },
  });

  const onSubmit = (data: { skillsToTeach: string[] }) => {
    updateFormData(data);
  };

  return (
    <div className="w-full overflow-hidden">
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 40, mass: 1 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-yellow-100 rounded-full mb-2">
          <Award className="h-6 w-6 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          What skills can you share?
        </h2>
        <p className="text-gray-500">
          Select at least 1 skill you're confident in teaching.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="skillsToTeach"
          control={control}
          rules={{
            validate: (value) =>
              value.length >= 1 || "Please select at least 1 skill.",
          }}
          render={({ field }) => (
            <SkillSelector
              selectedSkills={field.value}
              onSkillChange={field.onChange}
              skillType="teach"
            />
          )}
        />
        {errors.skillsToTeach && (
          <p className="text-center text-red-500 text-sm">
            {errors.skillsToTeach.message as string}
          </p>
        )}
        <div className="flex justify-between pt-4">
          <Button onClick={prevStep} variant="secondary">
            Back
          </Button>
          <Button type="submit">Next: Additional Info</Button>
        </div>
      </form>
    </motion.div>
    </div>
  );
};

export default Step3_SkillsToTeach;
