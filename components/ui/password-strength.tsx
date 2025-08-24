'use client';

import { validatePassword } from '@/lib/utils/validation';
import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const validation = useMemo(() => validatePassword(password), [password]);

  if (!password) return null;

  const strengthScore = [
    validation.hasMinLength,
    validation.hasUppercase,
    validation.hasLowercase,
    validation.hasNumber,
    validation.hasSpecialChar
  ].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (strengthScore === 5) return 'Very Strong';
    if (strengthScore >= 4) return 'Strong';
    if (strengthScore >= 3) return 'Medium';
    if (strengthScore >= 2) return 'Fair';
    return 'Weak';
  };

  const getStrengthColor = () => {
    if (strengthScore === 5) return 'text-green-600';
    if (strengthScore >= 4) return 'text-green-500';
    if (strengthScore >= 3) return 'text-yellow-600';
    if (strengthScore >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (strengthScore === 5) return 'bg-green-500';
    if (strengthScore >= 4) return 'bg-green-400';
    if (strengthScore >= 3) return 'bg-yellow-500';
    if (strengthScore >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-3 p-3 bg-gray-50 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <span className={`text-xs font-medium ${getStrengthColor()}`}>
          {getStrengthLabel()}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${strengthScore * 20}%` }}
        ></div>
      </div>
      
      {/* Requirements list */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${validation.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={`text-xs ${validation.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${validation.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={`text-xs ${validation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
            1 uppercase letter (A-Z)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${validation.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={`text-xs ${validation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
            1 lowercase letter (a-z)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${validation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={`text-xs ${validation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            1 number (0-9)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${validation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className={`text-xs ${validation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
            1 special character (!@#$%^&*)
          </span>
        </div>
      </div>
    </div>
  );
}
