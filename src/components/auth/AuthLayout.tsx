import { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-10"
        style={{
          backgroundImage: 'url("/images/auth-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
          zIndex: 0,
        }}
      />
      
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo className="scale-110" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} RentalSpace. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
