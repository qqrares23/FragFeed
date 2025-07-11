import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaCamera, FaUser, FaGlobe, FaMapMarkerAlt, FaEdit } from "react-icons/fa";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    bio?: string;
    location?: string;
    website?: string;
    profilePictureUrl?: string;
    bannerImageUrl?: string;
  };
}

const ProfileEditModal = ({ isOpen, onClose, currentProfile }: ProfileEditModalProps) => {
  const [bio, setBio] = useState(currentProfile.bio || "");
  const [location, setLocation] = useState(currentProfile.location || "");
  const [website, setWebsite] = useState(currentProfile.website || "");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.image.generateUploadUrl);

  if (!isOpen) return null;

  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile picture size should be less than 5MB");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Banner image size should be less than 10MB");
        return;
      }

      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file
    });

    if (!result.ok) throw new Error('Failed to upload file');
    const { storageId } = await result.json();
    return storageId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let profilePictureId = undefined;
      let bannerImageId = undefined;

      if (profilePicture) {
        profilePictureId = await uploadFile(profilePicture);
      }

      if (bannerImage) {
        bannerImageId = await uploadFile(bannerImage);
      }

      await updateProfile({
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        profilePicture: profilePictureId,
        bannerImage: bannerImageId,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
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
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <p className="text-white/80">Customize your profile</p>
              </div>
            </div>
            <button 
              onClick={onClose}
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
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Banner Image
              </label>
              <div className="relative">
                <div className="w-full h-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl overflow-hidden">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                  ) : currentProfile.bannerImageUrl ? (
                    <img src={currentProfile.bannerImageUrl} alt="Current banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <FaCamera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-primary-500 text-white p-2 rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
                  <FaCamera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerSelect}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : currentProfile.profilePictureUrl ? (
                      <img src={currentProfile.profilePictureUrl} alt="Current profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                    <FaCamera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
                <div className="text-sm text-slate-600">
                  <p>Upload a profile picture</p>
                  <p className="text-xs text-slate-400">Max size: 5MB</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="input resize-none"
                rows={3}
                maxLength={200}
                disabled={isLoading}
              />
              <div className="text-xs text-slate-400 mt-1">
                {bio.length}/200 characters
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                <FaMapMarkerAlt className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you from?"
                className="input"
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-slate-700 mb-2">
                <FaGlobe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="input"
                disabled={isLoading}
              />
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
                onClick={onClose}
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
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;