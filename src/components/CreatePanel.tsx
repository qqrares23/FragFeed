import { useState } from "react";
import { Plus, Users, PenTool } from "lucide-react";
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

  const handleCreatePost = () => {
    if (currentSubreddit) {
      navigate(`/r/${currentSubreddit}/submit`);
      onClose();
    }
  };

  const handleCreateCommunity = () => {
    setIsCommunityModalOpen(true);
  };

  const handleCommunityModalClose = () => {
    setIsCommunityModalOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold">Create Something</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">Share your thoughts with the world</p>
        </div>
        
        {/* Options */}
        <div className="space-y-2 p-6">
          {currentSubreddit && (
            <button 
              onClick={handleCreatePost} 
              className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-slate-900">
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
            className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-900">
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
        <div className="px-6 pb-6">
          <div className="text-xs text-slate-500 text-center">
            Express yourself and connect with others
          </div>
        </div>
      </div>
      
      {/* Community Modal */}
      <CreateCommunityModal
        isOpen={isCommunityModalOpen}
        onClose={handleCommunityModalClose}
      />
    </>
  );
};

export default CreatePanel;