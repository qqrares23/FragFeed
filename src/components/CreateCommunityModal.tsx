import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaUsers, FaPlus, FaRocket } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCommunityModal = ({
  isOpen,
  onClose,
}: CreateCommunityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createSubreddit = useMutation(api.subreddit.create);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Community name is required");
      return;
    }

    if (name.length < 3 || name.length > 21) {
      setError("Community name must be between 3 and 21 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError("Community name can only contain letters, numbers and underscores");
      return;
    }

    setIsLoading(true);
    try {
      await createSubreddit({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.data?.message || "Failed to create community");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
          {/* Decorative Header */}
          <div className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 text-white p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <IoSparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Create Community</h2>
                    <p className="text-white/80 text-sm">Build your own space</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="community-name" className="block text-sm font-semibold text-slate-700 mb-3">
                  Community Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 font-bold text-lg">
                    r/
                  </div>
                  <input
                    type="text"
                    id="community-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="awesome_community"
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-primary-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white"
                    maxLength={21}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <FaUsers className="w-3 h-3" />
                  <span>Community names cannot be changed later</span>
                </div>
              </div>

              <div>
                <label htmlFor="community-description" className="block text-sm font-semibold text-slate-700 mb-3">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="community-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's your community about? Share your vision..."
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-primary-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white resize-none"
                  maxLength={500}
                  disabled={isLoading}
                  rows={4}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-slate-400">
                    Help others understand what your community is about
                  </div>
                  <div className="text-xs text-slate-400">
                    {description.length}/500
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-6 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaRocket className="w-4 h-4" />
                    Launch Community
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateCommunityModal;