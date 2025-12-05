import React from "react";
//import "./Chat.css"; // If your sidebar styles are inside Chat.css
import API from "../../api/api";


function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  ProfiledropdownRef,
  showProfileMenu,
  setShowProfileMenu,
  setSelectedUser,
  setShowProfilePage,
  setFileInputRef,
  handleProfileImageChange,
  searchTerm,
  setSearchTerm,
  filteredUsers,
  selectedUser,
  loadMessages
}) {
  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const deviceId = localStorage.getItem("deviceId");

      if (!user || !deviceId) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      await API.post("/auth/logout", {
        userId: user._id,
        deviceId
      });

      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("deviceId");

      // Redirect
      window.location.href = "/";

    } catch (error) {
      console.error("Logout failed:", error);

      // Even if API fails → force logout
      localStorage.clear();
      window.location.href = "/";
    }
  };


  return (

    <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      {/* ---- HEADER ---- */}
      <div className="sidebar-header">
        <div className="bg-overlay-sidebar"></div>

        {/* Profile Image */}
        <div
          className="profile-image"
          onClick={() => {
            setSelectedUser(null);
            setShowProfilePage(true);
            setShowProfileMenu(false);
            setSidebarOpen(false);
          }}
        >
          {currentUser?.profileImage ? (
            <img
              src={`http://localhost:5000${currentUser.profileImage}`}
              alt={currentUser.username}
            />
          ) : (
            <i className="fas fa-user default-user-icon"></i>
          )}
        </div>

        {/* Branding */}
        <div className="d-flex align-items-center justify-content-center chat-box">
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-comments"></i>
          </div>
          <h4
            className="text-center ms-2"
            style={{ cursor: "pointer" }}
            onClick={() => (window.location.href = "/chat")}
          >
            ChatHub
          </h4>
        </div>

        {/* Profile Menu */}
        <div
          className="menu-icon"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <i className="fas fa-ellipsis-v"></i>

          {showProfileMenu && (
            <div className="profile-menu" ref={ProfiledropdownRef}>
              <div
                className="menu-item"
                onClick={() => {
                  setSelectedUser(null);
                  setShowProfilePage(true);
                  setShowProfileMenu(false);
                  setSidebarOpen(false);
                }}
              >
                <i className="fas fa-user" style={{ marginRight: "8px" }}></i>
                Profile
              </div>

              <div
                className="menu-item"
                onClick={handleLogout}
              >
                <i className="fas fa-arrow-right-from-bracket" style={{ marginRight: "8px" }}></i>
                Logout
              </div>

            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={(ref) => setFileInputRef(ref)}
          className="hidden-file-input"
          onChange={handleProfileImageChange}
        />
      </div>

      {/* ---- SEARCH ---- */}
      <div className="search-bar-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Search users..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ---- USER LIST ---- */}
      <div className="user-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => loadMessages(user)}
              className={`user-item ${selectedUser?._id === user._id ? "active" : ""
                }`}
            >
              <div className="user-avatar">
                {user.profileImage ? (
                  <img
                    src={`http://localhost:5000${user.profileImage}`}
                    alt={user.username}
                  />
                ) : (
                  <i className="fas fa-user default-user-icon"></i>
                )}

              </div>
              {user.isOnline && <span className="online-dot"></span>}

              <div className="user-info">
                <div className="user-name">
                  <span>{user.username}</span>
                  {user.unreadCount > 0 && (
                    <span className="badge bg-success ms-2">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
                <div className="user-last-message">
                  {user.lastMessage || "No messages"}
                </div>
              </div>
            </div>


          ))
        ) : (
          <div className="text-center pt-4">No users found</div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
