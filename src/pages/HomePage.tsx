import { Feed } from "../components/Feed";

const HomePage = () => {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent mb-4">
            Welcome to FragFeed
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover, share, and connect with communities around the world. 
            Your voice matters here.
          </p>
        </div>
        <Feed />
      </div>
    </div>
  );
};

export default HomePage;