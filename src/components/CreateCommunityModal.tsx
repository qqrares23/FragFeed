import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Users, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white p-6">
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Community</h2>
              <p className="text-white/80 text-sm">Build your own space</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="community-name" className="text-sm font-semibold text-slate-700">
              Community Name
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 font-bold text-sm">
                fg/
              </div>
              <Input
                id="community-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="awesome_community"
                className="pl-10 h-11"
                maxLength={21}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              <span>Community names cannot be changed later</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="community-description" className="text-sm font-semibold text-slate-700">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="community-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your community about? Share your vision..."
              maxLength={500}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Help others understand what your community is about
              </span>
              <span className="text-slate-400">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;