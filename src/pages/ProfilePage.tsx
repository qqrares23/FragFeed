import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile: {username}
          </h1>
          <p className="text-gray-600">
            Profile page for user {username}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;