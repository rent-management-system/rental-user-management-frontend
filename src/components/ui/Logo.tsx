export const Logo = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
        R
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
        RentalSpace
      </span>
    </div>
  );
};
