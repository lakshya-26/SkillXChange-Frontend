import React from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { BrainCircuit } from "lucide-react";
import SkillSelector from "./SkillSelector";

interface Step2Props {
  updateFormData: (data: object) => void;
  prevStep: () => void;
  formData: any;
}

const Step2_SkillsToLearn: React.FC<Step2Props> = ({
  updateFormData,
  prevStep,
  formData,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { skillsToLearn: formData.skillsToLearn || [] },
  });

  const onSubmit = (data: { skillsToLearn: string[] }) => {
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
          <div className="inline-block p-3 bg-green-100 rounded-full mb-2">
            <BrainCircuit className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            What do you want to learn?
          </h2>
          <p className="text-gray-500">
            Select at least 3 skills to get started.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="skillsToLearn"
            control={control}
            rules={{
              validate: (value) =>
                value.length >= 3 || "Please select at least 3 skills.",
            }}
            render={({ field }) => (
              <SkillSelector
                selectedSkills={field.value}
                onSkillChange={field.onChange}
                skillType="learn"
              />
            )}
          />
          {errors.skillsToLearn && (
            <p className="text-center text-red-500 text-sm">
              {errors.skillsToLearn.message as string}
            </p>
          )}
          <div className="flex justify-between pt-4">
            <Button onClick={prevStep} variant="secondary">
              Back
            </Button>
            <Button type="submit">Next: Skills to Teach</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Step2_SkillsToLearn;
