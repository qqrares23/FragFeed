import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaTimes, FaUsers, FaPlus } from "react-icons/fa";
import "../styles/CreateCommunityModal.css";

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
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <FaUsers className="title-icon" />
            <h2>Create Community</h2>
          </div>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="community-name" className="form-label">
                Community Name
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">r/</span>
                <input
                  type="text"
                  id="community-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="community_name"
                  className="form-input"
                  maxLength={21}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <p className="input-help">
                Community names including capitalization cannot be changed
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="community-description" className="form-label">
                Description <span className="optional">(optional)</span>
              </label>
              <textarea
                id="community-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your community"
                className="form-textarea"
                maxLength={500}
                disabled={isLoading}
                rows={4}
              />
              <div className="character-count">
                {description.length}/500
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-button"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" />
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
    </>
  );
};

export default CreateCommunityModal;