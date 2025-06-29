import { useState } from "react";
import { FaPlus, FaUsers, FaPen, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import CreateCommunityModal from "./CreateCommunityModal";

interface CreatePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePanel = ({ isOpen, onClose }: CreatePanelProps) => {
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const subredditMatch = location.pathname.match(/^\/r\/([^/]+)/);
  const currentSubreddit = subredditMatch ? subredditMatch[1] : null;

  if (!isOpen) return null;

  const handleCreatePost = () => {
    if (currentSubreddit) {
      navigate(`/r/${currentSubreddit}/submit`);
      onClose();
    }
  };

  const handleCreateCommunity = () => {
    setIsCommunityModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaPlus className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold">Create Something</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">Share your thoughts with the world</p>
        </div>
        
        {/* Options */}
        <div className="p-4 space-y-3">
          {currentSubreddit && (
            <button 
              onClick={handleCreatePost}
              className="w-full group bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FaPen className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Create Post
                  </h4>
                  <p className="text-sm text-slate-600">
                    Share to r/{currentSubreddit}
                  </p>
                </div>
              </div>
            </button>
          )}
          
          <button 
            onClick={handleCreateCommunity}
            className="w-full group bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <FaUsers className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Create Community
                </h4>
                <p className="text-sm text-slate-600">
                  Build your own space
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="text-xs text-slate-500 text-center">
            Express yourself and connect with others
          </div>
        </div>
      </div>
      
      {isCommunityModalOpen && (
        <CreateCommunityModal
          isOpen={isCommunityModalOpen}
          onClose={() => {
            setIsCommunityModalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default CreatePanel;