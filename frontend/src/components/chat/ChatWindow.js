import React from "react";
import EmojiPicker from "emoji-picker-react";

function ChatWindow({
  alertMsg,
  showProfilePage,
  setShowProfilePage,
  setSidebarOpen,
  profileData,
  setProfileData,
  fileInputRef,
  setFileInputRef,
  handleProfileImageChange,
  isEditing,
  setIsEditing,
  handleProfileSave,
  selectedUser,
  showOptions,
  dropdownRef,
  setShowOptions,
  handleClearChat,
  messages,
  messagesEndRef,
  currentUser,
  // previewImage,
  // setSelectedImage,
  // setPreviewImage,
  previewImages,
  selectedImages,
  setSelectedImages,
  setPreviewImages,
  sendMultipleImages,
  // previewVideo,
  // setSelectedVideo,
  // setPreviewVideo,
  previewDoc,
  setSelectedDoc,
  setPreviewDoc,
  senddocMessage,
  text,
  setText,
  emojiPickerRef,
  showEmojiPicker,
  setShowEmojiPicker,
  showAttachMenu,
  setShowAttachMenu,
  attacheRef,
  openFilePicker,
  // sendImageMessage,
  // sendVideoMessage,
  sendMessage,
  setShowUserPopup,
  showUserPopup,
  setUsers,
  showClearPopup,
  setShowClearPopup,
  setMessages,
  previewLocation,
  setPreviewLocation,
  sendLocationMessage,
  selectedMessageId,
  setSelectedMessageId,
  copyMessage,
  showCopiedToast,
  setShowCopiedToast,
  forwardMessage,
  showForwardModal,
  users,
  handleForwardToUser,
  setShowForwardModal,
  selectedMessage,
  isCopyAllowed,
  searchforwardTerm,
  setSearchforwardTerm,
  forwardRef,
  deleteMessage,
  deleteMessageEveryone,
  deleteMessageRef,
  setShowDeleteOptionsPopup,
  showDeleteOptionsPopup,
  previewVideos,
  setSelectedVideos,
  setPreviewVideos,
  sendMultipleVideos,
  selectedVideos
}) {


  const downloadFile = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const sendLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        // Show preview first (same like image/video)
        setPreviewLocation({
          latitude,
          longitude,
          url: mapUrl,
        });
      },
      () => alert("Unable to fetch location.")
    );
  };

  return (
    <div className="chat-window">
      {/* Alert Message */}
      {alertMsg.message && (
        <div
          className={`alert profile-alert ${alertMsg.type === "success" ? "alert-success" : "alert-danger"
            } py-2`}
          role="alert"
        >
          {alertMsg.message}
        </div>
      )}

      {/* -------------------- PROFILE PAGE -------------------- */}
      {showProfilePage ? (
        <div className="profile-page">
          <i
            className="fas fa-arrow-left back-btn"
            onClick={() => setSidebarOpen(true)}
          ></i>

          <h4 className="text-center">Profile</h4>

          <div className="text-center mt-3">
            <div className="profile-img-wrapper">
              <img
                src={`http://localhost:5000${profileData.profileImage}`}
                alt="Profile"
                className="profile-avatar-lg mb-4"
              />

              <button
                className="btn btn-sm btn-outline-secondary mt-2"
                onClick={() => fileInputRef.click()}
              >
                Change Profile Image
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={(ref) => setFileInputRef(ref)}
              className="hidden-file-input"
              onChange={handleProfileImageChange}
            />
          </div>

          <div className="profile-details p-4">
            <div
              className="d-flex align-items-center mb-3"
              style={{ gap: "1rem" }}
            >
              <h5 style={{ margin: "0px" }}>Personal Details</h5>
              <i
                className="fas fa-edit"
                style={{ cursor: "pointer" }}
                onClick={() => setIsEditing(!isEditing)}
              ></i>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="pb-2">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      fullName: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="pb-2">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      username: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="pb-2">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      email: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="pb-2">Mobile Number</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter 10-digit mobile number"
                  value={profileData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setProfileData({ ...profileData, phone: value });
                    }
                  }}
                  disabled={!isEditing}
                />

                {isEditing &&
                  profileData.phone.length > 0 &&
                  profileData.phone.length < 10 && (
                    <small className="text-danger">
                      Phone number must be 10 digits
                    </small>
                  )}
              </div>

              {isEditing && (
                <button
                  className="btn btn-success btn-profile-update"
                  onClick={handleProfileSave}
                >
                  Update Profile
                </button>
              )}
            </div>
          </div>
        </div>
      ) : /* -------------------- CHAT WINDOW -------------------- */
        selectedUser ? (
          <>
            {/* Chat header */}
            {showCopiedToast && (
              <div className="copied-toast">Copied</div>
            )}
            <div className="chat-header">
              <i
                className="fas fa-arrow-left back-btn"
                onClick={() => setSidebarOpen(true)}
              ></i>

              <div className="chat-user-info" onClick={() => setShowUserPopup(true)}>
                {selectedUser.profileImage ? (
                  <img
                    src={`http://localhost:5000${selectedUser.profileImage}`}
                    alt={selectedUser.username}
                    className="chat-user-avatar"
                  />
                ) : (
                  <i className="fas fa-user default-chat-icon"></i>
                )}
                {selectedUser.isOnline && <span className="online-dot"></span>}

                <span className="chat-user-name">{selectedUser.username}</span>
              </div>

              <div className="chat-options">
                <i
                  className="fas fa-ellipsis-v options-icon"
                  onClick={() => setShowOptions((prev) => !prev)}
                ></i>

                {showOptions && (
                  <div className="options-dropdown" ref={dropdownRef}>
                    {selectedMessage && isCopyAllowed(selectedMessage) && (() => {
                      const msg = messages.find(m => m._id === selectedMessageId);
                      const isAlreadyDeleted =
                        msg?.isDeletedForEveryone || msg?.text === "This message was deleted";

                      return !isAlreadyDeleted ? (
                        <button
                          onClick={() => {
                            copyMessage(selectedMessageId);
                            setShowOptions(false);
                          }}
                          className="copy-button"
                        >
                          <i className="fas fa-copy me-2"></i> Copy
                        </button>
                      ) : null;
                    })()}

                    {selectedMessageId && (
                      <>
                        {(() => {
                          const msg = messages.find(m => m._id === selectedMessageId);
                          const isAlreadyDeleted =
                            msg?.isDeletedForEveryone ||
                            msg?.text === "This message was deleted";

                          return !isAlreadyDeleted ? (
                            <button
                              onClick={() => forwardMessage(selectedMessageId)}
                            >
                              <i className="fas fa-share me-2"></i> Forward
                            </button>
                          ) : null;
                        })()}
                        <button
                          onClick={() => {
                            setShowDeleteOptionsPopup(true); // open popup with two options
                            setShowOptions(false); // close dropdown
                          }}
                        >
                          <i className="fas fa-trash me-2"></i> Delete
                        </button>


                      </>
                    )}

                    <button onClick={handleClearChat}>
                      <i className="fas fa-eraser me-2"></i> Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Chat messages */}

            <div
              className="chat-messages"
              style={{
                background: `url(${process.env.PUBLIC_URL + "/images/chat-bg.png"
                  }) no-repeat center center / cover`,
                height: "100vh",
                position: "relative",
              }}
            >
              {messages.map((msg, i) => {
                const messageTime = new Date(msg.createdAt).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                );

                const isSentByMe = msg.sender === currentUser._id;

                let statusIcon = null;
                if (isSentByMe) {
                  if (msg.seen) {
                    statusIcon = (
                      <i
                        className="bi bi-check-all"
                        style={{ color: "#2196F3", fontSize: "14px" }}
                      ></i>
                    );
                  } else if (msg.delivered) {
                    statusIcon = (
                      <i
                        className="bi bi-check-all"
                        style={{ color: "#777", fontSize: "14px" }}
                      ></i>
                    );
                  } else {
                    statusIcon = (
                      <i
                        className="bi bi-check"
                        style={{ color: "#777", fontSize: "14px" }}
                      ></i>
                    );
                  }
                }

                return (
                  <div
                    key={i}
                    className={`message-bubble ${isSentByMe ? "sent" : "received"} 
                  ${selectedMessageId === msg._id ? "selected-msg" : ""}`}
                    onClick={() => setSelectedMessageId(msg._id)}
                    onDoubleClick={() => {
                      if (selectedMessageId === msg._id) {
                        setSelectedMessageId(null); // Unselect on double click
                      }
                    }}
                  >
                    {msg.forwarded && (
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#6c63ff",
                          marginBottom: "5px",
                          fontStyle: "italic",
                        }}
                      >
                        <i className="fas fa-share"></i> Forwarded
                      </div>
                    )}

                    {msg.image && (
                      <>
                        <img
                          src={`http://localhost:5000${msg.image}`}
                          alt="sent"
                          className="chat-image"
                          //onClick={() => setSelectedMessageId(msg._id)}
                          style={{
                            maxWidth: "200px",
                            borderRadius: "10px",
                            marginBottom: "8px",
                          }}

                        />
                        {/* Download button */}
                        <div
                          className="download-icon"
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            padding: "6px",
                            borderRadius: "50%",
                            background: "#f3f3ff",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            downloadFile(
                              `http://localhost:5000${msg.image}`,
                              msg.image.split("/").pop()
                            )
                          }
                        >
                          <i className="fas fa-download" style={{ color: "#6c63ff", fontSize: "14px" }}></i>
                        </div>
                      </>
                    )}

                    {msg.video && (
                      <video
                        src={`http://localhost:5000${msg.video}`}
                        controls
                        className="chat-video"
                        style={{
                          maxWidth: "200px",
                          borderRadius: "10px",
                          marginBottom: "8px",
                        }}
                      //onClick={() => setSelectedMessageId(msg._id)}

                      ></video>
                    )}

                    {msg.doc && (
                      <div
                        className="doc-message-container d-flex align-items-center p-2 mb-2"
                        //onClick={() => setSelectedMessageId(msg._id)}
                        style={{
                          maxWidth: "260px",
                          background: "#e5ddd5",
                          borderRadius: "12px",
                          border: "1px solid #e5ddd5",
                          boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="doc-icon-box d-flex justify-content-center align-items-center me-2"
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "10px",
                            background: "#f3f3ff"
                          }}
                        >
                          <i className="fas fa-file-alt" style={{ fontSize: "22px", color: "#6c63ff" }}></i>
                        </div>

                        {/* File info */}
                        <div className="doc-info flex-grow-1" style={{ overflow: "hidden" }}>
                          <div
                            className="doc-name"
                            style={{
                              fontWeight: "600",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "150px"
                            }}
                          >
                            {msg.doc.split("/").pop()}
                          </div>

                          <div className="doc-size" style={{ fontSize: "12px", color: "#6c6c6c" }}>
                            Document file
                          </div>
                        </div>

                        {/* Download button */}
                        <div
                          className="download-icon"
                          style={{
                            padding: "6px",
                            borderRadius: "50%",
                            background: "#f3f3ff",
                            cursor: "pointer",
                            marginLeft: "auto",
                          }}
                          onClick={() =>
                            downloadFile(
                              `http://localhost:5000${msg.doc}`,
                              msg.doc.split("/").pop()
                            )
                          }
                        >
                          <i className="fas fa-download" style={{ color: "#6c63ff", fontSize: "14px" }}></i>
                        </div>
                      </div>
                    )}
                    {msg.text?.startsWith("https://www.google.com/maps") && (
                      <div
                        className="location-bubble"
                        // onClick={() => setSelectedMessageId(msg._id)}
                        style={{
                          maxWidth: "300px",
                          borderRadius: "10px",
                          marginBottom: "8px",
                          padding: "10px",
                          background: "#f3f3ff",
                          cursor: "pointer",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(msg.text, "_blank");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: "10px",
                          }}>
                          <i className="fas fa-map-marker-alt fa-2x mb-2" style={{ color: "#6c63ff" }}></i>
                          <span style={{ fontWeight: "600", color: "#000000" }}>Shared Location</span>
                        </div>
                        <span className="message-text">
                          {msg.text}
                        </span>
                      </div>
                    )}
                    {msg.text &&
                      !msg.text.startsWith("https://www.google.com/maps") &&
                      msg.text.trim().toLowerCase() !== "image" &&
                      msg.text.trim().toLowerCase() !== "video" &&
                      msg.text.trim().toLowerCase() !== "doc" && (
                        <span
                          className="message-text"
                          onClick={() => setSelectedMessageId(msg._id)}  // ONLY TEXT SELECTABLE
                        >
                          {msg.text}
                        </span>
                      )}
                    <div className="message-meta">
                      <span className="message-time">{messageTime}</span>
                      <span className="status-icon">{statusIcon}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Image preview */}
            {/* {previewImage && (
              <div className="image-preview-container p-2 text-center position-relative d-inline-block">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="img-thumbnail mb-2"
                  style={{ maxWidth: "200px", borderRadius: "10px" }}
                />

                <button
                  className="btn btn-outline-danger btn-sm position-absolute"
                  style={{ top: "5px", right: "5px", borderRadius: "50%" }}
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewImage(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )} */}

            {previewImages.length > 0 && (
              <div className="d-flex gap-2 flex-wrap p-2">
                {previewImages.map((src, i) => (
                  <div key={i} className="position-relative">
                    <img
                      alt="img-thumbnail"
                      src={src}
                      className="img-thumbnail"
                      style={{ width: "150px", height: "150px", borderRadius: "10px" }}
                    />
                    <button
                      className="btn btn-danger btn-sm position-absolute"
                      style={{ top: 5, right: 5 }}
                      onClick={() => {
                        let imgs = [...selectedImages];
                        let prev = [...previewImages];
                        imgs.splice(i, 1);
                        prev.splice(i, 1);
                        setSelectedImages(imgs);
                        setPreviewImages(prev);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video preview */}
            {/* {previewVideo && (
              <div className="image-preview-container p-2 text-center position-relative d-inline-block">
                <video
                  src={previewVideo}
                  className="img-thumbnail mb-2"
                  style={{ maxWidth: "200px", borderRadius: "10px" }}
                  controls
                ></video>

                <button
                  className="btn btn-outline-danger btn-sm position-absolute"
                  style={{ top: "5px", right: "5px", borderRadius: "50%" }}
                  onClick={() => {
                    setSelectedVideo(null);
                    setPreviewVideo(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )} */}

            {previewVideos.length > 0 && (
              <div className="d-flex gap-2 flex-wrap p-2">
                {previewVideos.map((src, i) => (
                  <div key={i} className="position-relative">
                    <video
                      alt="video-thumbnail"
                      src={src}
                      className="img-thumbnail"
                      style={{ width: "200px", height: "200px", borderRadius: "10px" }}
                    ></video>
                    {/* Remove Button */}
                    <button
                      className="btn btn-danger btn-sm position-absolute"
                      style={{ top: 5, right: 5 }}
                      onClick={() => {
                        let videos = [...selectedVideos];
                        let prev = [...previewVideos];
                        videos.splice(i, 1);
                        prev.splice(i, 1);
                        setSelectedVideos(videos);
                        setPreviewVideos(prev);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Document preview */}
            {previewDoc && (
              <div className="image-preview-container p-2 position-relative text-center d-flex justify-content-center align-items-center">

                {/* Icon + File Name */}
                <div
                  className="img-thumbnail mb-2 d-flex flex-column justify-content-center align-items-center position-relative"
                  style={{
                    width: "200px",
                    height: "120px",
                    borderRadius: "10px",
                    padding: "10px"
                  }}
                >
                  <i className="fas fa-file-alt fa-3x mb-2"></i>
                  <span style={{ fontSize: "14px", wordBreak: "break-all" }}></span>
                  {/* Remove Button */}
                  <button
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ top: 0, right: 0 }}
                    onClick={() => {
                      setSelectedDoc(null);
                      setPreviewDoc(null);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}
            {/* Location Preview */}
            {previewLocation && (
              <div className="image-preview-container p-2 position-relative text-center d-flex justify-content-center align-items-center">

                <div
                  className="img-thumbnail mb-2 d-flex flex-column justify-content-center align-items-center position-relative"
                  style={{
                    width: "200px",
                    height: "120px",
                    borderRadius: "10px",
                    padding: "10px",
                    background: "#e8f5e9"
                  }}
                >
                  <i className="fas fa-map-marker-alt fa-2x mb-2" style={{ color: "#1b5e20" }}></i>
                  <span style={{ fontWeight: "600" }}>Location Selected</span>

                  <button
                    className="btn btn-danger btn-sm position-absolute"
                    style={{ top: 0, right: 0 }}
                    onClick={() => setPreviewLocation(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

              </div>
            )}

            {/* FORWARD MODAL */}
            {showForwardModal && (
              <div className="forward-modal">
                <div className="forward-box" ref={forwardRef}>
                  <div className="forward-header">
                    {/* Close (X) Icon */}
                    <span className="close-forward"
                      onClick={() => {
                        setShowForwardModal(false);
                        setSearchforwardTerm(""); // reset search
                      }}
                    >
                      &times;
                    </span>

                    <h5 className="mb-2">Forward message to</h5>
                    {/* ---- SEARCH ---- */}
                    <div className="search-bar-container">
                      <i className="fas fa-search search-icon"></i>
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="search-bar"
                        value={searchforwardTerm}
                        onChange={(e) => setSearchforwardTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  {users
                    ?.filter((u) =>
                      u.username.toLowerCase().includes(searchforwardTerm.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u._id}
                        className="forward-user"
                        onClick={() => handleForwardToUser(u)}
                      >
                        <div className="user-avatar">
                          {u.profileImage ? (
                            <img
                              src={`http://localhost:5000${u.profileImage}`}
                              alt={u.username}
                            />
                          ) : (
                            <i className="fas fa-user default-user-icon"></i>
                          )}
                        </div>
                        <span>{u.username}</span>
                      </div>
                    ))}
                </div>
              </div>

            )}
            {showDeleteOptionsPopup && (
              <div className="popup-overlay">
                <div className="popup-box" ref={deleteMessageRef}>
                  <h5 className="delete-heading">Delete Message?</h5>

                  <div className="actions">

                    {/* DELETE FOR ME */}
                    <button
                      className="btn mb-2 w-100 text-end"
                      onClick={() => {
                        deleteMessage(selectedMessageId);
                        setShowDeleteOptionsPopup(false);
                      }}
                    >
                      Delete For Me
                    </button>

                    {/* DELETE FOR EVERYONE — SHOW ONLY IF MESSAGE IS NOT DELETED */}
                    {(() => {
                      const msg = messages.find(m => m._id === selectedMessageId);
                      if (!msg) return null;

                      const isAlreadyDeleted =
                        msg.isDeletedForEveryone || msg.text === "This message was deleted";

                      const currentUser = JSON.parse(localStorage.getItem("user"));
                      const currentUserId = currentUser?._id;

                      // Show delete-for-everyone only if YOU are the sender
                      const isSender = msg.sender === currentUserId;

                      return !isAlreadyDeleted && isSender ? (
                        <button
                          className="btn mb-2 w-100 text-end"
                          onClick={() => {
                            deleteMessageEveryone(selectedMessageId);
                            setShowDeleteOptionsPopup(false);
                          }}
                        >
                          Delete For Everyone
                        </button>
                      ) : null;
                    })()}

                    {/* CLOSE */}
                    <button
                      className="btn mb-2 w-100 text-end"
                      onClick={() => {
                        setSelectedMessageId(null);
                        setShowDeleteOptionsPopup(false)
                      }
                      }
                    >
                      Cancel
                    </button>

                  </div>
                </div>
              </div>
            )}


            {/* -------------------- Chat Input -------------------- */}
            <div className="chat-input d-flex align-items-center p-2">
              {/* Emoji */}
              <div className="emoji-btn position-relative me-2" ref={emojiPickerRef}>
                <i
                  className="far fa-smile fa-lg text-secondary"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                ></i>

                {showEmojiPicker && (
                  <div
                    className="emoji-picker-container position-absolute bottom-100 mb-2"
                    style={{ zIndex: 10, boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setText((prev) => prev + emojiData.emoji)
                      }
                    />
                  </div>
                )}
              </div>

              {/* Attach */}
              <div className="attach-btn me-2">
                <label style={{ cursor: "pointer" }}>
                  <i
                    className="fas fa-paperclip fa-lg text-secondary"
                    onClick={() => setShowAttachMenu(true)}
                  ></i>
                </label>
              </div>

              {/* Attach Menu */}
              {showAttachMenu && (
                <div className="attach-menu-grid" ref={attacheRef}>
                  <div
                    className="attach-grid-item"
                    onClick={() => openFilePicker("image")}
                  >
                    <i className="fas fa-image icon"></i>
                    <span>Image</span>
                  </div>

                  <div
                    className="attach-grid-item"
                    onClick={() => openFilePicker("video")}
                  >
                    <i className="fas fa-video icon"></i>
                    <span>Video</span>
                  </div>

                  <div
                    className="attach-grid-item"
                    onClick={() => openFilePicker("doc")}
                  >
                    <i className="fas fa-file-alt icon"></i>
                    <span>Document</span>
                  </div>

                  <div
                    className="attach-grid-item"
                    onClick={() => {
                      setShowAttachMenu(false);
                      sendLocation();
                    }}
                  >
                    <i className="fas fa-map-marker-alt icon"></i>
                    <span>Location</span>
                  </div>


                </div>
              )}

              {/* Message Input */}
              <input
                type="text"
                className="form-control message-box me-2"
                placeholder="Type a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();

                    if (previewImages.length > 0) return sendMultipleImages();
                    if (previewVideos.length > 0) return sendMultipleVideos();
                    // if (previewVideo) return sendVideoMessage();
                    if (previewDoc) return senddocMessage();
                    if (previewLocation) return sendLocationMessage();
                    return sendMessage();
                  }
                }}
              />

              {/* Send Button */}
              <button
                className="send-btn btn btn-success"
                onClick={() => {
                  if (previewImages.length > 0) return sendMultipleImages();
                  if (previewVideos.length > 0) return sendMultipleVideos();
                  // if (previewImage) return sendImageMessage();
                  // if (previewVideo) return sendVideoMessage();
                  if (previewDoc) return senddocMessage();
                  if (previewLocation) return sendLocationMessage();
                  return sendMessage();
                }}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </>
        ) : (
          /* -------------- No user selected -------------- */
          <div
            className="chat-placeholder"
            style={{
              background: `url(${process.env.PUBLIC_URL + "/images/bg-chatapp.jpg"
                }) no-repeat center center / cover`,
              height: "100vh",
              position: "relative",
            }}
          >
            <div className="bg-overlay"></div>
            <h5>Select a user to start chat</h5>
          </div>
        )}
    </div>
  );
}

export default ChatWindow;
