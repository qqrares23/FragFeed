import { Feed } from "../components/Feed";

const HomePage = () => {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            <span className="inline-block animate-wave-text" style={{ animationDelay: '0ms' }}>W</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '100ms' }}>e</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '200ms' }}>l</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '300ms' }}>c</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '400ms' }}>o</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '500ms' }}>m</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '600ms' }}>e</span>
            <span className="inline-block animate-wave-text mx-2" style={{ animationDelay: '700ms' }}> </span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '800ms' }}>t</span>
            <span className="inline-block animate-wave-text" style={{ animationDelay: '900ms' }}>o</span>
            <span className="inline-block animate-wave-text mx-2" style={{ animationDelay: '1000ms' }}> </span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1100ms' }}>F</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1200ms' }}>r</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1300ms' }}>a</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1400ms' }}>g</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1500ms' }}>F</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1600ms' }}>e</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1700ms' }}>e</span>
            <span className="inline-block animate-wave-text bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent" style={{ animationDelay: '1800ms' }}>d</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '2000ms' }}>
            Discover, share, and connect with communities around the world. 
            Your voice matters here.
          </p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '2500ms' }}>
          <Feed />
        </div>
      </div>
    </div>
  );
};

export default HomePage;