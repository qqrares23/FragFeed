import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "../../convex/_generated/dataModel";

interface CommunityNameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subredditId: Id<"subreddit">;
  currentName: string;
}

const CommunityNameEditModal = ({
  isOpen,
  onClose,
  subredditId,
  currentName,
}: CommunityNameEditModalProps) => {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const updateName = useMutation(api.subreddit.updateName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newName.trim()) {
      setError("Community name is required");
      return;
    }

    if (newName.length < 3 || newName.length > 21) {
      setError("Community name must be between 3 and 21 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newName)) {
      setError("Community name can only contain letters, numbers and underscores");
      return;
    }

    if (newName === currentName) {
      setError("Please enter a different name");
      return;
    }

    setIsLoading(true);
    try {
      await updateName({ subredditId, newName: newName.trim() });
      onClose();
      // Refresh the page to show the new name in the URL
      window.location.href = `/r/${newName}`;
    } catch (err: any) {
      setError(err.data?.message || "Failed to update community name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewName(currentName);
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
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Community Name</h2>
              <p className="text-white/80 text-sm">Change your community's name</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 text-yellow-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Important:</p>
              <p>Changing the community name will update the URL. Old links will no longer work.</p>
            </div>
          </div>

          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="community-name" className="text-sm font-semibold text-slate-700">
              New Community Name
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 font-bold text-sm">
                r/
              </div>
              <Input
                id="community-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="awesome_community"
                className="pl-10 h-11"
                maxLength={21}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            <div className="text-xs text-slate-500">
              3-21 characters, letters, numbers and underscores only
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
              disabled={isLoading || !newName.trim() || newName === currentName}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Name
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityNameEditModal;