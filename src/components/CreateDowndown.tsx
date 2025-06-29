import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import CreateCommunityModal from "./CreateCommunityModal";

interface CreateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateDropdown = ({ isOpen, onClose }: CreateDropdownProps) => {
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
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FaPlus className="w-4 h-4 text-primary-600" />
            Create
          </h3>
        </div>
        
        <div className="p-2">
          {currentSubreddit && (
            <button 
              onClick={handleCreatePost}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <FaPlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Post</p>
                <p className="text-sm text-slate-500">Share to r/{currentSubreddit}</p>
              </div>
            </button>
          )}
          
          <button 
            onClick={handleCreateCommunity}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <FaPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Community</p>
              <p className="text-sm text-slate-500">Create a new community</p>
            </div>
          </button>
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

export default CreateDropdown;