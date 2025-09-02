import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
}

const EventRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    year: '',
    branch: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is already registered
  useEffect(() => {
    const registrationData = localStorage.getItem('eventRegistration');
    if (registrationData) {
      setIsAlreadyRegistered(true);
      const { firstName, lastName } = JSON.parse(registrationData);
      setSuccessMessage(`Welcome back ${firstName} ${lastName}! You're already registered for this event. 🎉`);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.year) newErrors.year = 'Academic year is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save registration data to localStorage
        const registrationData = {
          userId: data.userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('eventRegistration', JSON.stringify(registrationData));
        
        setIsAlreadyRegistered(true);
        setSuccessMessage(`Thank you ${formData.firstName} ${formData.lastName}! Your registration was successful. Check your email for confirmation details. 🎉`);
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          year: '',
          branch: ''
        });
      } else {
        // Handle specific error cases
        if (data.error === 'Email already registered') {
          setErrors({ email: 'This email is already registered for the event' });
        } else {
          alert(`Registration failed: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-8 shadow-2xl">
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Speaker Event Registration
        </h1>
        <p className="text-white/70 text-sm">
          Join us for an exclusive speaker session
        </p>
      </div>

      {isAlreadyRegistered ? (
        <div className="text-center space-y-6">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-white text-lg font-medium mb-2">
              {successMessage}
            </p>
            <p className="text-white/70 text-sm">
              You can close this page or register someone else by clearing your registration.
            </p>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem('eventRegistration');
              setIsAlreadyRegistered(false);
              setSuccessMessage('');
            }}
            className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 bg-white/10 text-white border border-white/30 hover:bg-white/20"
          >
            Register Someone Else
          </button>
        </div>
      ) : (

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-white">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                "text-white placeholder-white/50",
                errors.firstName ? "border-red-500" : "border-white/30"
              )}
              placeholder="First name"
            />
            {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-white">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                "text-white placeholder-white/50",
                errors.lastName ? "border-red-500" : "border-white/30"
              )}
              placeholder="Last name"
            />
            {errors.lastName && <p className="text-red-400 text-sm">{errors.lastName}</p>}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                "text-white placeholder-white/50",
                errors.email ? "border-red-500" : "border-white/30"
              )}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-white">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                "text-white placeholder-white/50",
                errors.phone ? "border-red-500" : "border-white/30"
              )}
              placeholder="+91 98765 43210"
            />
            {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
          </div>
        </div>

        {/* Academic Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium text-white">
                Academic Year
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                  "text-white",
                  errors.year ? "border-red-500" : "border-white/30"
                )}
              >
                <option value="" className="bg-black text-white">Select Year</option>
                <option value="1st" className="bg-black text-white">1st Year</option>
                <option value="2nd" className="bg-black text-white">2nd Year</option>
                <option value="3rd" className="bg-black text-white">3rd Year</option>
                <option value="4th" className="bg-black text-white">4th Year</option>
                <option value="graduate" className="bg-black text-white">Graduate</option>
                <option value="postgraduate" className="bg-black text-white">Post Graduate</option>
              </select>
              {errors.year && <p className="text-red-400 text-sm">{errors.year}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="branch" className="text-sm font-medium text-white">
                Branch/Stream
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                  "text-white",
                  errors.branch ? "border-red-500" : "border-white/30"
                )}
              >
                <option value="" className="bg-black text-white">Select Branch</option>
                <option value="Artificial Intelligence & Data Science" className="bg-black text-white">Artificial Intelligence & Data Science</option>
                <option value="Computer Engineering" className="bg-black text-white">Computer Engineering</option>
                <option value="Computer & Communication Engineering" className="bg-black text-white">Computer & Communication Engineering</option>
                <option value="Computer Science & Business Systems" className="bg-black text-white">Computer Science & Business Systems</option>
                <option value="Electronics & Computer Engineering" className="bg-black text-white">Electronics & Computer Engineering</option>
                <option value="Electronics & Telecommunication Engineering" className="bg-black text-white">Electronics & Telecommunication Engineering</option>
                <option value="Electronics Engineering (VLSI Design & Technology)" className="bg-black text-white">Electronics Engineering (VLSI Design & Technology)</option>
                <option value="Information Technology" className="bg-black text-white">Information Technology</option>
                <option value="Mechanical Engineering" className="bg-black text-white">Mechanical Engineering</option>
                <option value="Robotics & Artificial Intelligence" className="bg-black text-white">Robotics & Artificial Intelligence</option>
              </select>
              {errors.branch && <p className="text-red-400 text-sm">{errors.branch}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300",
            "bg-white text-black hover:bg-white/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transform hover:scale-[1.02] active:scale-[0.98]",
            isSubmitting && "animate-pulse"
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Register Now'
          )}
        </button>
      </form>
      )}
    </div>
  );
};

export default EventRegistrationForm;
