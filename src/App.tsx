import { InteractiveGridPattern } from './components/InteractiveGridPattern';
import EventRegistrationForm from './components/EventRegistrationForm';

function App() {
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
        
        {/* Right side - Empty for grid pattern background (60% width) */}
        <div className="w-3/5"></div>
      </div>
    </div>
  );
}

export default App;
