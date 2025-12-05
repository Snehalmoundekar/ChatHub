import React from "react";

function UserPopup({ showUserPopup, selectedUser, setShowUserPopup }) {
  if (!showUserPopup || !selectedUser) return null;

  return (
    <div
      className="user-popup-overlay"
      onClick={() => setShowUserPopup(false)}
    >
      <div
        className="user-popup"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="popup-header">
          <h5>{selectedUser.username}</h5>
          <i
            className="fas fa-times close-icon"
            onClick={() => setShowUserPopup(false)}
          ></i>
        </div>

        <div className="popup-body text-center">
          {selectedUser.profileImage ? (
            <img
              src={`http://localhost:5000${selectedUser.profileImage}`}
              alt={selectedUser.username}
              className="popup-avatar"
            />
          ) : (
            <i className="fas fa-user popup-default-icon"></i>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPopup;
