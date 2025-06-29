import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaSearch, FaUserShield, FaTrash, FaCheck, FaPlus } from "react-icons/fa";
import { Id } from "../../convex/_generated/dataModel";

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subredditId: Id<"subreddit">;
  subredditName: string;
}

const ModerationModal = ({ isOpen, onClose, subredditId, subredditName }: ModerationModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set(["delete_posts", "delete_comments"]));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const members = useQuery(api.moderation.searchSubredditMembers, {
    subredditId,
    searchQuery: searchQuery.trim() || undefined,
    limit: 20
  });

  const moderators = useQuery(api.moderation.getModerators, { subredditId });
  const addModerator = useMutation(api.moderation.addModerator);
  const removeModerator = useMutation(api.moderation.removeModerator);
  const updatePermissions = useMutation(api.moderation.updateModeratorPermissions);

  const availablePermissions = [
    { id: "delete_posts", label: "Delete Posts", description: "Can delete posts in this community" },
    { id: "delete_comments", label: "Delete Comments", description: "Can delete comments in this community" },
    { id: "manage_users", label: "Manage Users", description: "Can manage community members" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedUsers(new Set());
      setSelectedPermissions(new Set(["delete_posts", "delete_comments"]));
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handlePermissionToggle = (permission: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleAddModerators = async () => {
    if (selectedUsers.size === 0) {
      setError("Please select at least one user");
      return;
    }

    if (selectedPermissions.size === 0) {
      setError("Please select at least one permission");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const promises = Array.from(selectedUsers).map(userId =>
        addModerator({
          subredditId,
          userId: userId as Id<"users">,
          permissions: Array.from(selectedPermissions)
        })
      );

      await Promise.all(promises);
      setSelectedUsers(new Set());
      setSelectedPermissions(new Set(["delete_posts", "delete_comments"]));
    } catch (err: any) {
      setError(err.data?.message || "Failed to add moderators");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this moderator?")) return;

    try {
      await removeModerator({
        subredditId,
        userId: userId as Id<"users">
      });
    } catch (err: any) {
      setError(err.data?.message || "Failed to remove moderator");
    }
  };

  const isUserModerator = (userId: string) => {
    return moderators?.some(mod => mod.user?._id === userId);
  };

  const filteredMembers = members?.filter(member => 
    !isUserModerator(member.user!._id)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FaUserShield className="w-6 h-6" />
                Moderation
              </h2>
              <p className="text-white/80">Manage moderators for r/{subredditName}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Left Panel - Add Moderators */}
          <div className="flex-1 p-6 border-r border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Moderators</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search community members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* Permissions Selection */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">Permissions</h4>
              <div className="space-y-2">
                {availablePermissions.map(permission => (
                  <label key={permission.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="mt-1 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{permission.label}</div>
                      <div className="text-sm text-slate-600">{permission.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Members List */}
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900 mb-3">
                Community Members ({filteredMembers.length})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredMembers.map(member => (
                  <label key={member._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(member.user!._id)}
                      onChange={() => handleUserToggle(member.user!._id)}
                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {member.user!.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">u/{member.user!.username}</div>
                      <div className="text-sm text-slate-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))}
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery ? "No members found matching your search" : "No eligible members found"}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700">
                {error}
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddModerators}
              disabled={isLoading || selectedUsers.size === 0 || selectedPermissions.size === 0}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding Moderators...
                </>
              ) : (
                <>
                  <FaPlus />
                  Add {selectedUsers.size} Moderator{selectedUsers.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Current Moderators */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Current Moderators</h3>
            
            <div className="space-y-3">
              {moderators && moderators.length > 0 ? (
                moderators.map(moderator => (
                  <div key={moderator._id} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {moderator.user!.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            u/{moderator.user!.username}
                          </div>
                          <div className="text-sm text-slate-500">
                            Added {new Date(moderator.addedAt).toLocaleDateString()}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {moderator.permissions.map(permission => (
                              <span key={permission} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg">
                                {availablePermissions.find(p => p.id === permission)?.label || permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveModerator(moderator.user!._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove moderator"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FaUserShield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No moderators yet</p>
                  <p className="text-sm">Add community members as moderators to help manage your community</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationModal;