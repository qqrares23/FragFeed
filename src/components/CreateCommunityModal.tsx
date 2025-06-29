import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaUsers, FaPlus } from "react-icons/fa";

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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUsers className="w-6 h-6" />
                <h2 className="text-xl font-bold">Create Community</h2>
              </div>
              <button 
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="community-name" className="block text-sm font-semibold text-slate-700 mb-2">
                Community Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 font-semibold">
                  r/
                </span>
                <input
                  type="text"
                  id="community-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="community_name"
                  className="input pl-8"
                  maxLength={21}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Community names including capitalization cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="community-description" className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="community-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your community"
                className="input resize-none"
                maxLength={500}
                disabled={isLoading}
                rows={4}
              />
              <div className="text-xs text-slate-400 text-right mt-1">
                {description.length}/500
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
                <span>⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="btn btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create Community
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