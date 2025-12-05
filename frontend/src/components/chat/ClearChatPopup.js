import React from "react";
import axios from "axios";

function ClearChatPopup({
  showClearPopup,
  selectedUser,
  currentUser,
  setShowClearPopup,
  setShowOptions,
  setMessages,
  setUsers,
  clearchatRef
}) {
  if (!showClearPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box" ref={clearchatRef}>
        <h3>Clear Chat</h3>
        <p>
          Are you sure you want to clear the chat with
          <b> {selectedUser?.username}</b>?
        </p>

        <div className="popup-buttons">
          {/* CANCEL BUTTON */}
          <button
            className="cancel-btn"
            onClick={() => setShowClearPopup(false)}
          >
            Cancel
          </button>
          {/* YES BUTTON */}
          <button
            className="confirm-btn"
            onClick={async () => {
              try {
                await axios.delete(
                  `http://localhost:5000/api/chat/clear/${currentUser._id}/${selectedUser._id}`
                );

                // Clear chat messages
                setMessages([]);

                // Close options & popup
                setShowOptions(false);
                setShowClearPopup(false);

                // Update sidebar user list (lastMessage, unreadCount)
                setUsers((prevUsers) =>
                  prevUsers.map((user) =>
                    user._id === selectedUser._id
                      ? {
                          ...user,
                          lastMessage: "",
                          unreadCount: 0,
                        }
                      : user
                  )
                );
              } catch (error) {
                console.error("Error clearing chat:", error);
              }
            }}
          >
            Yes, Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearChatPopup;
