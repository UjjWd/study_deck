import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Brain, BookOpen, GraduationCap, Target, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Signup = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    case: false,
    special: false
  });

  // OTP related states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordRequirements({
        length: value.length >= 8,
        number: /\d/.test(value),
        case: /[a-z]/.test(value) && /[A-Z]/.test(value),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      });
    }

    // If email is changed and was previously verified, reset verification status
    if (field === 'email' && isEmailVerified) {
      setIsEmailVerified(false);
      setShowOtpSection(false);
      setOtp("");
      setError("");
      setSuccess("");
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const isPasswordValid = () => {
    return passwordRequirements.length && 
           passwordRequirements.number && 
           passwordRequirements.case && 
           passwordRequirements.special;
  };

  const canProceed = () => {
    return formData.name.trim() !== "" &&
           isValidEmail(formData.email) &&
           isValidPhone(formData.phone) &&
           isPasswordValid() &&
           formData.password === formData.confirmPassword &&
           isEmailVerified;
  };

  // Send OTP
  const sendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setIsOtpLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:5000/api/otp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      const data = await response.json();
      
      // Start countdown timer
      setOtpTimer(60);
      setShowOtpSection(true);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${formData.email}`,
      });
      
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setIsOtpLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, code: otp })
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      const data = await response.json();
      
      setIsEmailVerified(true);
      setShowOtpSection(false);
      setError("");
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified!",
      });
      
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setOtp("");
    setError("");
    
    try {
      const response = await fetch('http://localhost:5000/api/otp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }

      const data = await response.json();
      
      setOtpTimer(60);
      toast({
        title: "OTP Sent",
        description: "New verification code sent to your email",
      });
      
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
      });
    }
  };

  // Countdown timer logic
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canProceed()) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all steps and verify your email",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\D/g, ""),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          // User already exists
          toast({
            title: "User Already Exists",
            description: "An account with this email already exists. Please try logging in.",
          });
        } else {
          throw new Error(data?.msg || "Signup failed");
        }
      } else {
        // Success
        toast({
          title: "Account Created Successfully",
          description: "Welcome to StudyDeck! You can now start learning.",
        });
        
        // Note: In a real app, avoid using localStorage in Claude artifacts
        // localStorage.setItem("token", data.token);
        // navigate("/dashboard");
        
        setSuccess("Account created successfully!");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      toast({
        title: "Signup Failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                ←
              </Link>
              <div className="text-sm text-gray-600">
                Already member? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">Enhance Your Learning with StudyDeck</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="text-gray-400 mr-3">👤</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                  required
                />
                {formData.name.trim() && (
                  <span className="text-green-500 ml-2">✓</span>
                )}
              </div>
            </div>

            {/* Email Field with Verification */}
            <div className="relative">
              <div className={`flex items-center rounded-xl px-4 py-4 border transition-all ${
                isEmailVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:bg-white'
              }`}>
                <span className={`mr-3 ${isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>📧</span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                  disabled={isEmailVerified}
                  required
                />
                {isEmailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                ) : (
                  formData.email && isValidEmail(formData.email) && (
                    <span className="text-green-500 ml-2">✓</span>
                  )
                )}
              </div>
              
              {/* Email Verification Section */}
              {!isEmailVerified && isValidEmail(formData.email) && (
                <div className="mt-4 space-y-4">
                  <Button 
                    type="button"
                    onClick={sendOtp}
                    disabled={isOtpLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    {isOtpLoading ? "Sending OTP..." : "Verify Email →"}
                  </Button>
                </div>
              )}

              {/* OTP Input Section */}
              {showOtpSection && !isEmailVerified && (
                <div className="mt-4 space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Enter the 6-digit code sent to <span className="font-medium text-blue-600">{formData.email}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-blue-200">
                    <span className="text-blue-600 mr-3">🔢</span>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 text-center text-xl tracking-wider"
                      maxLength={6}
                    />
                    {otp.length === 6 && (
                      <span className="text-green-500 ml-2">✓</span>
                    )}
                  </div>

                  <Button 
                    type="button"
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || isOtpLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    {isOtpLoading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-gray-500 text-sm">
                        Resend code in {otpTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={resendOtp}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        disabled={otpTimer > 0}
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend verification code'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="text-gray-400 mr-3">📱</span>
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                  maxLength={10}
                  required
                />
                {formData.phone && isValidPhone(formData.phone) && (
                  <span className="text-green-500 ml-2">✓</span>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="text-gray-400 mr-3">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`mr-2 ${passwordRequirements.length ? 'text-green-500' : 'text-gray-400'}`}>
                      {passwordRequirements.length ? '✓' : '•'}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`mr-2 ${passwordRequirements.number ? 'text-green-500' : 'text-gray-400'}`}>
                      {passwordRequirements.number ? '✓' : '•'}
                    </span>
                    <span>At least one number (0-9)</span>
                  </div>
                  <div className={`flex items-center ${passwordRequirements.case ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`mr-2 ${passwordRequirements.case ? 'text-green-500' : 'text-gray-400'}`}>
                      {passwordRequirements.case ? '✓' : '•'}
                    </span>
                    <span>Lowercase (a-z) and uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`mr-2 ${passwordRequirements.special ? 'text-green-500' : 'text-gray-400'}`}>
                      {passwordRequirements.special ? '✓' : '•'}
                    </span>
                    <span>At least one special character</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="text-gray-400 mr-3">🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-Type Password"
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
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <span className="text-green-500 ml-2">✓</span>
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="mt-2 text-sm text-red-600">
                  Passwords do not match
                </div>
              )}
            </div>

            {/* Sign Up Button */}
            <Button 
              type="submit"
              disabled={!canProceed() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account →"}
            </Button>

            {/* Divider */}
            {/* <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-500 text-sm">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div> */}

            {/* Google Login */}
            {/* <Button variant="outline" className="w-full py-3 rounded-xl border-gray-200">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button> */}
          </form>

          {/* Language Selector */}
          <div className="mt-8 flex items-center text-sm text-gray-600">
            <span className="w-6 h-4 bg-red-500 rounded mr-2"></span>
            <span>ENG</span>
          </div>
        </div>

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
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <div className="absolute top-40 right-32 bg-white rounded-full p-3 shadow-lg">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div className="absolute bottom-40 right-20 bg-white rounded-full p-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="absolute bottom-20 right-40 bg-white rounded-full p-3 shadow-lg">
            <Target className="w-6 h-6 text-pink-600" />
          </div>

          {/* Content Cards */}
          <div className="flex flex-col justify-center items-center w-full p-12 space-y-6">
            {/* Study Stats Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 w-80 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-500 text-sm font-medium">Study Progress</span>
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">89.7%</div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              </div>
              <div className="mt-3 flex items-center">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">87</span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm text-gray-600">Cards mastered</div>
                </div>
              </div>
            </div>

            {/* Feature Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 w-80 shadow-xl">
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Smart Learning, Better Results</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your study data helps you learn efficiently with our spaced repetition system
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-1 bg-blue-500 rounded"></div>
                <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                <div className="flex-1 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;