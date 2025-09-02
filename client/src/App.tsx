import { InteractiveGridPattern } from './components/InteractiveGridPattern';
import EventRegistrationForm from './components/EventRegistrationForm';
import speakerImage from './assets/speaker.png';
import istelogo from './assets/iste-logo.png';
import { useState, useEffect } from 'react';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Auto-rotate carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative flex">
      {/* Background Grid Pattern - Tilted */}
      <div className="absolute inset-0 transform -rotate-3">
        <InteractiveGridPattern />
      </div>
      
      {/* Registration Toggle Button - Mobile Only */}
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {isFormOpen ? 'Close Form' : 'Register Now'}
      </button>

      {/* Desktop Form Sidebar */}
      <div className="hidden md:block w-2/5 h-full bg-black/90 backdrop-blur-md border-r border-white/20 relative z-40">
        <div className="flex items-center justify-center p-8 h-full overflow-y-auto">
          <EventRegistrationForm />
        </div>
      </div>

      {/* Mobile Form Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
        isFormOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsFormOpen(false)}
        />
        
        {/* Form Container */}
        <div className={`absolute left-0 top-0 h-full w-full bg-black/90 backdrop-blur-md border-r border-white/20 transform transition-transform duration-500 ${
          isFormOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-center p-4 h-full overflow-y-auto">
            <EventRegistrationForm />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 md:p-8 w-full md:w-3/5 md:ml-auto">
        <div className="w-full h-full max-w-4xl">
          {/* Carousel Container */}
          <div 
            className="flex transition-transform duration-1000 ease-in-out w-full h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 1: ISTE Event Information */}
            <div className="w-full flex-shrink-0 flex items-center justify-center h-full">
              <div className="text-center px-4">
                {/* ISTE Logo with Glow Effect */}
                <div className="relative mb-4 md:mb-8">
                  {/* Glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl scale-150"></div>
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-125 animate-pulse"></div>
                  
                  {/* ISTE Logo */}
                  <div className="relative">
                    <img 
                      src={istelogo} 
                      alt="ISTE KJSSE Logo" 
                      className="w-48 h-48 md:w-80 md:h-80 object-contain rounded-full border-4 border-white/30 shadow-2xl mx-auto bg-white/10 p-4 md:p-8"
                    />
                  </div>
                </div>
                
                {/* Event Text */}
                <div className="space-y-2 md:space-y-4">
                  <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    ISTE KJSSE Presents
                  </h2>
                  <h3 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
                    HACKXPOSED
                  </h3>
                  <p className="text-sm md:text-xl text-gray-300 max-w-xs md:max-w-md mx-auto">
                    Learn about hackathons, connect with fellow developers, and discover the world of machine learning.
                    <br />
                    <span className="text-orange-400">Get ready to hack your way to success!</span>
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-2 md:pt-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2: Keynote Speaker */}
            <div className="w-full flex-shrink-0 flex items-center justify-center h-full">
              <div className="text-center px-4">
                {/* Speaker Image with Glow Effect */}
                <div className="relative mb-4 md:mb-8">
                  {/* Glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl scale-150"></div>
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-125 animate-pulse"></div>
                  
                  {/* Speaker Image */}
                  <div className="relative">
                    <img 
                      src={speakerImage} 
                      alt="Keynote Speaker" 
                      className="w-48 h-48 md:w-80 md:h-80 object-cover rounded-full border-4 border-white/30 shadow-2xl mx-auto"
                    />
                  </div>
                </div>
                
                {/* Speaker Text */}
                <div className="space-y-2 md:space-y-4">
                  <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Our Keynote Speaker
                  </h2>
                  <p className="text-sm md:text-xl text-gray-300 max-w-xs md:max-w-md mx-auto">
                    We're excited to introduce our amazing keynote speaker who will share insights on hackathons and machine learning.
                    <br />
                    <span className="text-blue-400">Follow them for more tech content!</span>
                  </p>
                  
                  {/* Instagram Link */}
                  <div className="pt-2 md:pt-4">
                    <a 
                      href="https://www.instagram.com/tensor._.boy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="font-semibold">@tensor._.boy</span>
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 pt-2 md:pt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {[0, 1].map((index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
