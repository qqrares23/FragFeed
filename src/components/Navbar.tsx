import { FaPlus, FaReddit, FaUser, FaGamepad } from "react-icons/fa";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import CreateDropdown from "./CreateDowndown";
import GamingDropdown from "./GamingDropdown";
import { useState } from "react";
import SearchBar from "./SearchBar";
import "../styles/Navbar.css";

const Navbar = () => {
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showGamingDropdown, setShowGamingDropdown] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleCreateDropdown = () => {
    setShowCreateDropdown(true);
    setShowGamingDropdown(false);
  };

  const handleGamingDropdown = () => {
    setShowGamingDropdown(true);
    setShowCreateDropdown(false);
  };

  const closeAllDropdowns = () => {
    setShowCreateDropdown(false);
    setShowGamingDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <FaReddit className="reddit-icon" />
            <span className="site-name">reddit</span>
          </div>
        </Link>
        <SearchBar />

        <div className="nav-actions">
          {/* Gaming Hub Button - Available to all users */}
          <div className="dropdown-container">
            <button 
              className="icon-button gaming-button" 
              onClick={handleGamingDropdown}
              title="Gaming Hub"
            >
              <FaGamepad />
            </button>
            {showGamingDropdown && (
              <GamingDropdown
                isOpen={showGamingDropdown}
                onClose={closeAllDropdowns}
              />
            )}
          </div>

          <Unauthenticated>
            <SignInButton mode="modal">
              <button className="sign-in-button">Sign In</button>
            </SignInButton>
          </Unauthenticated>
          
          <Authenticated>
            <div className="dropdown-container">
              <button className="icon-button" onClick={handleCreateDropdown}>
                <FaPlus />
              </button>
              {showCreateDropdown && (
                <CreateDropdown
                  isOpen={showCreateDropdown}
                  onClose={closeAllDropdowns}
                />
              )}
            </div>
            <button
              className="icon-button"
              onClick={() => user?.username && navigate(`/u/${user.username}`)}
              title="View Profile"
            >
              <FaUser />
            </button>
            <UserButton />
          </Authenticated>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;