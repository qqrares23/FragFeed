import { Feed } from "../components/Feed";
import TwitchSidebar from "../components/TwitchSidebar";
import GamingSidebar from "../components/GamingSidebar";

const HomePage = () => {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            <span className="inline-block animate-wave-text" style={{ animationDelay: '0ms' }}>W</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '100ms' }}>e</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '200ms' }}>l</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '300ms' }}>c</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '400ms' }}>o</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '500ms' }}>m</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '600ms' }}>e</span>
            <span className="inline-block animate-wave-text mx-1 sm:mx-2" style={{ animationDelay: '700ms' }}> </span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '800ms' }}>t</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '900ms' }}>o</span>
            <span className="inline-block animate-wave-text mx-1 sm:mx-2" style={{ animationDelay: '1000ms' }}> </span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1100ms' }}>F</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1200ms' }}>r</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1300ms' }}>a</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1400ms' }}>g</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1500ms' }}>F</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1600ms' }}>e</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1700ms' }}>e</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1800ms' }}>d</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-up px-4" style={{ animationDelay: '2000ms' }}>
            Discover, share, and connect with communities around the world. 
            Your voice matters here.
          </p>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Mobile Feed */}
          <div className="animate-fade-in-up" style={{ animationDelay: '2200ms' }}>
            <Feed />
          </div>
          
          {/* Mobile Sidebars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '2400ms' }}>
            <div className="space-y-4">
              <GamingSidebar />
            </div>
            <div className="space-y-4">
              <TwitchSidebar />
            </div>
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-8">
          {/* Left Sidebar - Gaming */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '2200ms' }}>
            <div className="sticky top-24 space-y-4">
              <GamingSidebar />
            </div>
          </div>
          
          {/* Main Feed */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '2500ms' }}>
            <Feed />
          </div>
          
          {/* Right Sidebar - Twitch */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '2800ms' }}>
            <div className="sticky top-24 space-y-4">
              <TwitchSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;