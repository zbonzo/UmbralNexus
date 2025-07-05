import React from 'react';
import { Button } from './ui/button';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  error, 
  onRetry, 
  onGoBack,
  showRetry = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent"></div>
      
      <div className="relative z-10 text-center max-w-md mx-auto p-6">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-600/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 text-red-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h2>
        
        <p className="text-slate-300 mb-8 leading-relaxed">
          {error}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onGoBack && (
            <Button 
              variant="outline" 
              onClick={onGoBack}
              className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              Go Back
            </Button>
          )}
          
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};