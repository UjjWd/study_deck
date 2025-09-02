import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FancyLogoutButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate(); // <-- navigation hook

 const handleLogout = () => {
  setIsClicked(true);
  localStorage.removeItem("token");

  setTimeout(() => {
    console.log("Logged out!");
    window.location.reload(); // 🔄 force re-check and redirect
  }, 800);
};


  return (
    <button
      onClick={handleLogout}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isClicked}
      className={`
        group relative overflow-hidden
        px-6 py-3 rounded-xl
        bg-gradient-to-r from-red-500 to-pink-600
        hover:from-red-600 hover:to-pink-700
        text-white font-medium text-sm
        transition-all duration-300 ease-out
        transform hover:scale-105 hover:shadow-lg
        active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed
        border border-red-400/20
        shadow-md hover:shadow-red-500/25
        ${isClicked ? 'animate-pulse' : ''}
      `}
    >
      <div className={`
        absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700
        transform transition-transform duration-300 ease-out
        ${isHovered ? 'translate-x-0' : 'translate-x-full'}
      `} />

      <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />

      <div className="relative flex items-center justify-center gap-2">
        <LogOut 
          size={16} 
          className={`
            transition-all duration-300 ease-out
            ${isClicked ? 'rotate-180' : 'rotate-0'}
            ${isHovered ? 'translate-x-1' : 'translate-x-0'}
          `} 
        />
        <span className={`
          transition-all duration-300 ease-out
          ${isHovered ? 'translate-x-1' : 'translate-x-0'}
        `}>
          {isClicked ? 'Logging out...' : 'Logout'}
        </span>
      </div>

      {isClicked && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </button>
  );
};

export default FancyLogoutButton;
