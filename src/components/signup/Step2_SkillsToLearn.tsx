import React from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import SkillCard from "./SkillCard";
import { BrainCircuit } from "lucide-react";

// For simplicity, defining SVG icons as components here
const ReactIcon = () => (
  <svg
    viewBox="-10.5 -9.45 21 18.9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="0" cy="0" r="2" fill="#61DAFB"></circle>
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="10" ry="4.5"></ellipse>
      <ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse>
      <ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse>
    </g>
  </svg>
);
const NodeIcon = () => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#8CC84B"
      d="M128 0a128 128 0 1 0 128 128A128 128 0 0 0 128 0zm-20.3 194.21a20.8 20.8 0 0 1-14.9-6.32l-34.62-34.6a12.72 12.72 0 0 1 0-18l17.2-17.2a12.72 12.72 0 0 1 18 0l34.6 34.6a12.73 12.73 0 0 1 0 18l-17.2 17.2a20.82 20.82 0 0 1-3.1 2.32zm92.5-92.41l-34.6 34.6a12.73 12.73 0 0 1-18 0l-17.2-17.2a12.72 12.72 0 0 1 0-18l34.62-34.6a12.72 12.72 0 0 1 18 0l17.2 17.2a12.72 12.72 0 0 1-.02 18z"
    ></path>
  </svg>
);
const PythonIcon = () => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#FFD43B"
      d="M128 0a128 128 0 0 0 0 256h37.64V128.01a37.64 37.64 0 0 0-75.28 0v81.18a46.8 46.8 0 0 1-46.8-46.8V128a128 128 0 0 0 128-128zm0 50.41a27.2 27.2 0 1 1 0 54.4a27.2 27.2 0 0 1 0-54.4z"
    ></path>
    <path
      fill="#306998"
      d="M128 256a128 128 0 0 0 0-256H90.36v127.99a37.64 37.64 0 0 0 75.28 0V46.81a46.8 46.8 0 0 1 46.8 46.8V128a128 128 0 0 0-128 128zm0-50.41a27.2 27.2 0 1 1 0-54.4a27.2 27.2 0 0 1 0 54.4z"
    ></path>
  </svg>
);
const GuitarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 20.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v13zM10 6.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2zM15 15.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill="#f97316"
    ></path>
    <path
      d="M15 19.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0-3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"
      fill="#f97316"
    ></path>
    <path
      d="M15 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-6a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"
      fill="#f97316"
    ></path>
    <path
      d="M14.5 9.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5zM14.5 12.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5z"
      fill="#f97316"
    ></path>
  </svg>
);
const CookingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9zm0 17c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill="#ef4444"
    ></path>
    <path
      d="M12 5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill="#ef4444"
    ></path>
    <path
      d="M12 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
      fill="#ef4444"
    ></path>
  </svg>
);

interface Step2Props {
  updateFormData: (data: object) => void;
  prevStep: () => void;
  formData: any;
}

const skills = [
  { name: "React", icon: <ReactIcon /> },
  { name: "Node.js", icon: <NodeIcon /> },
  { name: "Python", icon: <PythonIcon /> },
  { name: "Guitar", icon: <GuitarIcon /> },
  { name: "Cooking", icon: <CookingIcon /> },
];

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
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.name}
                  label={skill.name}
                  icon={skill.icon}
                  isSelected={field.value.includes(skill.name)}
                  onClick={() => {
                    const newValue = field.value.includes(skill.name)
                      ? field.value.filter((s: string) => s !== skill.name)
                      : [...field.value, skill.name];
                    field.onChange(newValue);
                  }}
                />
              ))}
            </div>
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
  );
};

export default Step2_SkillsToLearn;
