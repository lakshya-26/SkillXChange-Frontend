import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [userEmail, setUserEmail] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const handleSendOtp = async (data: { email: string }) => {
    console.log('Requesting OTP for:', data.email);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setUserEmail(data.email);
    setStep('otp');
  };

  const handleVerifyOtp = async (data: { otp: string }) => {
    console.log('Verifying OTP:', data.otp);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setStep('reset');
  };

  const handleResetPassword = async (data: object) => {
    console.log('Resetting password for:', userEmail, data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    navigate('/login');
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <motion.div key="email" exit={{ opacity: 0, x: -50 }}>
            <form onSubmit={handleSubmit(handleSendOtp as any)} className="space-y-6">
              <Input
                icon={AtSign}
                type="email"
                placeholder="Your registered email"
                {...register('email', { required: 'Email is required' })}
                error={errors.email?.message as string}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          </motion.div>
        );
      case 'otp':
        return (
          <motion.div key="otp" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
             <p className="text-center text-gray-600 mb-4 text-sm">
                An OTP has been sent to <strong>{userEmail}</strong>.
            </p>
            <form onSubmit={handleSubmit(handleVerifyOtp as any)} className="space-y-6">
              <Input
                icon={KeyRound}
                type="text"
                placeholder="Enter 6-digit OTP"
                {...register('otp', { required: 'OTP is required', minLength: 6, maxLength: 6 })}
                error={errors.otp?.message as string}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                 {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          </motion.div>
        );
      case 'reset':
        return (
          <motion.div key="reset" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
              <Input
                icon={Lock}
                type="password"
                placeholder="New Password"
                {...register('password', { required: 'New password is required', minLength: 8 })}
                error={errors.password?.message as string}
              />
              <Input
                icon={Lock}
                type="password"
                placeholder="Confirm New Password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message as string}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Reset Password'}
              </Button>
            </form>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot Your Password?</h2>
            <p className="mt-2 text-gray-600">No worries! We'll help you reset it.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>

            <p className="mt-8 text-center text-sm text-gray-600">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Login
                </Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
