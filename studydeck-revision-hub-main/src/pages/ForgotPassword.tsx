import { useState } from "react";
import { ArrowLeft, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Mock toast hook since we don't have the actual implementation
import { Button } from "react-day-picker";

// Mock Button component


// Mock Link component
const Link = ({ to, children, className }) => (
  <a href={to} className={className}>
    {children}
  </a>
);

// Step 1: Email Input Component
const ForgotPasswordEmail = ({ onNext }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    
    // First check if email exists
    const checkResponse = await fetch("http://localhost:5000/api/auth/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const checkData = await checkResponse.json();

    if (!checkResponse.ok) {
      
      toast({
        title: "User doesnt exist",
        description: "Please enter a valid email address or signup first",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });

      onNext(email);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-8 lg:p-12">
      <div className="mb-8">
        <Link to="/login" className="text-gray-600 hover:text-gray-800 transition-colors flex items-center mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Login
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-600">Enter your email address and we'll send you a verification code</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Mail className="text-gray-400 mr-3" size={20} />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
              required
            />
            {email && isValidEmail(email) && (
              <span className="text-green-500 ml-2">✓</span>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValidEmail(email) || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Verification Code →"}
        </Button>
      </div>
    </div>
  );
};

// Step 2: OTP Verification Component
const OTPVerification = ({ email, onNext, onBack }) => {
  const { toast } = useToast();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.querySelector<HTMLInputElement>(`input[data-index="${index + 1}"]`);
      if (nextInput) {
        const inputElement = nextInput as HTMLInputElement;
        inputElement.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.querySelector<HTMLInputElement>(`input[data-index="${index - 1}"]`);
      if (prevInput) {
        const inputElement = prevInput as HTMLInputElement;
        inputElement.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6 || otp.some(digit => digit === "")) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: otpString
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      // On success, call onNext with the reset token from the API response
      onNext(data.token);
      toast({
        title: "OTP Verified",
        description: "You can now reset your password",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      toast({
        title: "OTP Resent",
        description: "Please check your email for the new verification code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to send OTP");
      }

      setHasSentOtp(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive"
      });
    }
  };

  const isOtpComplete = otp.every(digit => digit !== "") && otp.join("").length === 6;

  return (
    <div className="w-full lg:w-1/2 p-8 lg:p-12">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 transition-colors flex items-center mb-6"
          type="button"
        >
          <button
            onClick={sendOtp}
            disabled={hasSentOtp}
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            {hasSentOtp ? "Resend code" : "Send code"}
          </button>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
        <p className="text-gray-600">
          {!hasSentOtp ? "We'll send you a 6-digit verification code" : "We've sent a 6-digit verification code to"} <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              data-index={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isOtpComplete || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify Code →"}
        </Button>

        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">{hasSentOtp ? "Didn't receive the code?" : "Send verification code"}</p>
          <button
            onClick={sendOtp}
            disabled={resendLoading}
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            {hasSentOtp ? "Resend code" : "Send code"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 3: New Password Component
interface NewPasswordProps {
  email: string;
  resetToken: string;
  onComplete: () => void;
}

const NewPassword = ({ email, resetToken, onComplete }: NewPasswordProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPasswordValid = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /\d/.test(password)
    };

    return Object.values(requirements).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid(formData.password)) {
      toast({
        title: "Invalid Password",
        description: "Password must meet all requirements",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          resetToken,
          newPassword: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to reset password");
      }

      toast({
        title: "Password Reset Successfully",
        description: "You can now login with your new password",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isPasswordValid(formData.password) &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8 &&
    /[A-Z]/.test(formData.password) &&
    /[a-z]/.test(formData.password) &&
    /[!@#$%^&*(),.?\":{}|<>]/.test(formData.password) &&
    /\d/.test(formData.password);

  return (
    <div className="w-full lg:w-1/2 p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Password</h1>
        <p className="text-gray-600">Enter your new password to complete the reset process</p>
      </div>

      <div className="space-y-6">
        {/* New Password Field */}
        <div className="relative">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Lock className="text-gray-400 mr-3" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 ml-2 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <span className={`${formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.password.length >= 8 ? '✓' : '✗'} At least 8 characters
                </span>
              </div>
              <div className="flex items-center">
                <span className={`${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                  {/[A-Z]/.test(formData.password) ? '✓' : '✗'} At least one uppercase letter
                </span>
              </div>
              <div className="flex items-center">
                <span className={`${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                  {/[a-z]/.test(formData.password) ? '✓' : '✗'} At least one lowercase letter
                </span>
              </div>
              <div className="flex items-center">
                <span className={`${/[!@#$%^&*(),.?\":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                  {/[!@#$%^&*(),.?\":{}|<>]/.test(formData.password) ? '✓' : '✗'} At least one special character
                </span>
              </div>
              <div className="flex items-center">
                <span className={`${/\d/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                  {/\d/.test(formData.password) ? '✓' : '✗'} At least one number
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Lock className="text-gray-400 mr-3" size={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 ml-2 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formData.confirmPassword && (
            <div className="mt-2 text-sm">
              <span className={`${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.password === formData.confirmPassword ? '✓' : '✗'} Passwords match
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Resetting..." : "Reset Password →"}
        </Button>
      </div>
    </div>
  );
};

// Main Forgot Password Component
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleEmailNext = (userEmail) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleOtpNext = (token) => {
    setResetToken(token);
    setStep(3);
  };

  const handleComplete = () => {
    // Simulate redirect to login page
    alert("Password reset complete! Redirecting to login page...");
    setStep(1); // Reset for demo purposes
    setEmail("");
    setResetToken("");
  };

  const getCurrentStepComponent = () => {
    switch (step) {
      case 1:
        return <ForgotPasswordEmail onNext={handleEmailNext} />;
      case 2:
        return (
          <OTPVerification
            email={email}
            onNext={handleOtpNext}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <NewPassword
            email={email}
            resetToken={resetToken}
            onComplete={handleComplete}
          />
        );
      default:
        return <ForgotPasswordEmail onNext={handleEmailNext} />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Side - Dynamic Form */}
        {getCurrentStepComponent()}

        {/* Right Side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 rounded-full bg-white"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white"></div>
          </div>

          {/* Floating Icons */}
          <div className="absolute top-20 right-16 bg-white rounded-full p-4 shadow-lg">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="absolute top-40 right-32 bg-white rounded-full p-3 shadow-lg">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <div className="absolute bottom-40 right-20 bg-white rounded-full p-4 shadow-lg">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>

          {/* Content Cards */}
          <div className="flex flex-col justify-center items-center w-full p-12 space-y-6">
            {/* Security Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 w-80 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-500 text-sm font-medium">Secure Reset</span>
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">Your Account is Safe</div>
              <div className="text-sm text-gray-600 mb-4">
                We use advanced security measures to protect your password reset process
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Encrypted communication</span>
              </div>
            </div>

            {/* Step Progress Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 w-80 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                  <div className={`w-8 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    3
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">
                {step === 1 && "Enter Email"}
                {step === 2 && "Verify OTP"}
                {step === 3 && "New Password"}
              </div>
              <div className="text-sm text-gray-600">
                {step === 1 && "We'll send you a verification code"}
                {step === 2 && "Check your email for the 6-digit code"}
                {step === 3 && "Create a strong new password"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;