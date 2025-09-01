import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
}

const EventRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    college: '',
    year: '',
    branch: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

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
    if (!formData.college.trim()) newErrors.college = 'College name is required';
    if (!formData.year) newErrors.year = 'Academic year is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    alert('Registration successful! 🎉');
    
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Speaker Event Registration
        </h1>
        <p className="text-white/70 text-sm">
          Join us for an exclusive speaker session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-white">
              First Name *
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
              Last Name *
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
              Email Address *
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
              Phone Number *
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
          <div className="space-y-2">
            <label htmlFor="college" className="text-sm font-medium text-white">
              College/University *
            </label>
            <input
              type="text"
              id="college"
              name="college"
              value={formData.college}
              onChange={handleInputChange}
              className={cn(
                "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                "text-white placeholder-white/50",
                errors.college ? "border-red-500" : "border-white/30"
              )}
              placeholder="College name"
            />
            {errors.college && <p className="text-red-400 text-sm">{errors.college}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium text-white">
                Academic Year *
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
                Branch/Stream *
              </label>
              <input
                type="text"
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-4 py-3 bg-white/10 border rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white",
                  "text-white placeholder-white/50",
                  errors.branch ? "border-red-500" : "border-white/30"
                )}
                placeholder="e.g., Computer Science"
              />
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

      <div className="mt-6 text-center text-white/50 text-sm">
        <p>* Required fields</p>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
