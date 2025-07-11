import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaPlus, FaTrash, FaEdit, FaGripVertical } from "react-icons/fa";
import { Id } from "../../convex/_generated/dataModel";

interface GuidelinesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subredditId: Id<"subreddit">;
  subredditName: string;
  currentGuidelines: string[];
}

const GuidelinesEditModal = ({ 
  isOpen, 
  onClose, 
  subredditId, 
  subredditName, 
  currentGuidelines 
}: GuidelinesEditModalProps) => {
  const [guidelines, setGuidelines] = useState<string[]>(currentGuidelines || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateGuidelines = useMutation(api.subreddit.updateGuidelines);

  if (!isOpen) return null;

  const addGuideline = () => {
    if (guidelines.length < 10) {
      setGuidelines([...guidelines, ""]);
    }
  };

  const removeGuideline = (index: number) => {
    setGuidelines(guidelines.filter((_, i) => i !== index));
  };

  const updateGuideline = (index: number, value: string) => {
    const newGuidelines = [...guidelines];
    newGuidelines[index] = value;
    setGuidelines(newGuidelines);
  };

  const moveGuideline = (fromIndex: number, toIndex: number) => {
    const newGuidelines = [...guidelines];
    const [movedItem] = newGuidelines.splice(fromIndex, 1);
    newGuidelines.splice(toIndex, 0, movedItem);
    setGuidelines(newGuidelines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Filter out empty guidelines
      const filteredGuidelines = guidelines.filter(g => g.trim().length > 0);
      
      await updateGuidelines({
        subredditId,
        guidelines: filteredGuidelines,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.data?.message || "Failed to update guidelines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setGuidelines(currentGuidelines || []);
      setError("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaEdit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Guidelines</h2>
                <p className="text-white/80">Manage r/{subredditName} community rules</p>
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

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Community Guidelines</h3>
                <span className="text-sm text-slate-500">{guidelines.length}/10 rules</span>
              </div>
              
              <p className="text-sm text-slate-600">
                Set clear expectations for your community members. Guidelines help maintain a positive environment.
              </p>

              {/* Guidelines List */}
              <div className="space-y-3">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaGripVertical className="w-4 h-4 cursor-move" />
                      <span className="text-sm font-medium">{index + 1}.</span>
                    </div>
                    
                    <input
                      type="text"
                      value={guideline}
                      onChange={(e) => updateGuideline(index, e.target.value)}
                      placeholder="Enter a community guideline..."
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      maxLength={200}
                      disabled={isLoading}
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeGuideline(index)}
                      disabled={isLoading}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Remove guideline"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {guidelines.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FaEdit className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No guidelines yet</p>
                    <p className="text-sm mt-1">Add your first community guideline below</p>
                  </div>
                )}
              </div>

              {/* Add Guideline Button */}
              {guidelines.length < 10 && (
                <button
                  type="button"
                  onClick={addGuideline}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Guideline
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-6">
              <div className="flex gap-4">
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
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Guidelines'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesEditModal;