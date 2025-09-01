import { InteractiveGridPattern } from './components/InteractiveGridPattern';
import EventRegistrationForm from './components/EventRegistrationForm';
import speakerImage from './assets/speaker-black.png';
import istelogo from './assets/iste-logo.png';
import { useState, useEffect } from 'react';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel every 5 minutes (300000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2);
    },10000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Grid Pattern - Tilted */}
      <div className="absolute inset-0 transform -rotate-3">
        <InteractiveGridPattern />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Form (40% width) */}
        <div className="w-2/5 relative">
          {/* Background for form area */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm border-r border-white/20"></div>
          {/* Form content */}
          <div className="relative z-10 flex items-center justify-center p-8 min-h-screen">
            <EventRegistrationForm />
          </div>
        </div>
        
        {/* Right side - Carousel Section (60% width) */}
        <div className="w-3/5 flex items-center justify-center p-8 overflow-hidden">
          <div className="relative w-full h-full">
            {/* Carousel Container */}
            <div 
              className="flex transition-transform duration-1000 ease-in-out w-full h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1: ISTE Event Information */}
              <div className="w-full flex-shrink-0 flex items-center justify-center">
                <div className="text-center">
                  {/* ISTE Logo with Glow Effect */}
                  <div className="relative mb-8">
                    {/* Glow background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl scale-150"></div>
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-125 animate-pulse"></div>
                    
                    {/* ISTE Logo */}
                    <div className="relative">
                      <img 
                        src={istelogo} 
                        alt="ISTE KJSSE Logo" 
                        className="w-80 h-80 object-contain rounded-full border-4 border-white/30 shadow-2xl mx-auto bg-white/10 p-8"
                      />
                    </div>
                  </div>
                  
                  {/* Event Text */}
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      ISTE KJSSE Presents
                    </h2>
                    <h3 className="text-5xl font-extrabold bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
                      HACKEXPOSED
                    </h3>
                    <p className="text-xl text-gray-300 max-w-md mx-auto">
                      Learn about hackathons, connect with fellow developers, and discover the world of competitive coding.
                      <br />
                      <span className="text-orange-400">Get ready to hack your way to success!</span>
                    </p>
                    <div className="flex items-center justify-center space-x-2 pt-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Mystery Speaker */}
              <div className="w-full flex-shrink-0 flex items-center justify-center">
                <div className="text-center">
                  {/* Speaker Image with Glow Effect */}
                  <div className="relative mb-8">
                    {/* Glow background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl scale-150"></div>
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-125 animate-pulse"></div>
                    
                    {/* Speaker Image */}
                    <div className="relative">
                      <img 
                        src={speakerImage} 
                        alt="Mystery Speaker" 
                        className="w-80 h-80 object-cover rounded-full border-4 border-white/30 shadow-2xl mx-auto"
                      />
                      {/* Overlay for mystery effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Speaker Text */}
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Mystery Speaker
                    </h2>
                    <p className="text-xl text-gray-300 max-w-md mx-auto">
                      Our keynote speaker will be revealed soon. 
                      <br />
                      <span className="text-blue-400">Stay tuned for the big announcement!</span>
                    </p>
                    <div className="flex items-center justify-center space-x-2 pt-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
    </div>
  );
}

export default App;
