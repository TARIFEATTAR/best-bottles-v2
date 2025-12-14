
import React from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignUpClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#f3f1ed] dark:bg-[#1E1E1E] w-full h-full md:h-auto md:max-w-[440px] p-8 md:p-12 shadow-none md:shadow-2xl rounded-none md:rounded-sm transform transition-all duration-500 scale-100 opacity-100 animate-[fadeUp_0.3s_ease-out] flex flex-col justify-center md:block">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 md:top-4 md:right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
        >
          <span className="material-symbols-outlined text-2xl md:text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-left mb-8">
            <h2 className="font-serif text-xl font-bold tracking-wider text-[#1D1D1F] dark:text-white uppercase mb-6">
                Best Bottles
            </h2>
            <h1 className="font-serif text-3xl text-[#1D1D1F] dark:text-white">
                Sign in to Best Bottles
            </h1>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Email address</label>
                <div className="relative">
                    <input 
                        type="email" 
                        className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-[#1D1D1F] dark:text-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
                    />
                </div>
            </div>

            <button className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] font-bold py-3.5 rounded-md hover:bg-black dark:hover:bg-gray-200 transition-colors">
                Next
            </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#f3f1ed] dark:bg-[#1E1E1E] text-gray-500">or</span>
            </div>
        </div>

        {/* Social Options */}
        <div className="space-y-3">
            <button className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-3 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                {/* Google Icon SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium text-[#1D1D1F] dark:text-white">Sign in with Google</span>
            </button>

            <button className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-3 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                {/* Apple Icon SVG */}
                <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.12-.48-3.11.02-1.39.75-2.43.3-3.61-.96-1.57-1.68-2.66-4.59-1.11-7.27 1.55-2.68 4.45-2.43 5.45-.48.59 1.14 1.55 1.25 2.68.04 1.13-1.21 2.53-2.15 4.34-2.14 1.09.02 1.83.55 2.45 1.34-2.09 1.54-1.74 3.76-.05 5.1-.38.83-1.36 2.76-2.52 3.92-.09.07-.17.15-.26.23-.48.45-1.05.95-1.19.85zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm font-medium text-[#1D1D1F] dark:text-white">Sign in with Apple</span>
            </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-4">
                By continuing, you agree to our <a href="#" className="underline hover:text-gray-800 dark:hover:text-gray-300">Terms of Service</a> and <a href="#" className="underline hover:text-gray-800 dark:hover:text-gray-300">Privacy Policy</a>.
            </p>
            <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                    New to Best Bottles? <button onClick={onSignUpClick} className="font-bold text-[#1D1D1F] dark:text-white hover:underline">Apply for a Wholesale Account</button>
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};
