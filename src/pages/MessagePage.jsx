// src/pages/MessagePage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MessagePage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const stompClientRef = useRef(null);
  const selectedContactRef = useRef(null);
  const currentUserRef = useRef(null);
  const chatEndRef = useRef(null);

  const SockJS = window.SockJS;
  const Stomp = window.Stomp;

  // Keep refs updated
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // ✅ Get user info from localStorage instead of sessionStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch contacts
  useEffect(() => {
    if (!currentUser) return;
    axios
      .get(`http://localhost:8080/api/messages/contacts/${currentUser.id}`)
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [currentUser]);

  // Fetch messages for selected contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return;
    axios
      .get(
        `http://localhost:8080/api/messages/conversation/${currentUser.id}/${selectedContact.id}`
      )
      .then((res) => setMessages(res.data))
      .then(() => {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContact.id ? { ...c, unread: false } : c
          )
        );
      })
      .catch((err) => console.error("Error fetching conversation:", err));
  }, [selectedContact, currentUser]);

  // WebSocket setup with auto reconnect
  useEffect(() => {
    if (!currentUser) return;

    let client;
    const connect = () => {
      const socket = new SockJS("http://localhost:8080/ws");
      client = Stomp.over(socket);
      stompClientRef.current = client;

      client.connect(
        {},
        () => {
          setConnected(true);
          console.log("✅ Connected to WebSocket");

          client.subscribe("/user/queue/messages", (message) => {
            const received = JSON.parse(message.body);
            console.log("📩 Received:", received);

            // Update contact list
            setContacts((prev) =>
              prev.map((c) =>
                c.id === received.senderId
                  ? {
                      ...c,
                      lastMessage: received.content,
                      unread:
                        !selectedContactRef.current ||
                        c.id !== selectedContactRef.current.id,
                    }
                  : c
              )
            );

            // Append to current conversation if relevant
            if (
              selectedContactRef.current &&
              (received.senderId === selectedContactRef.current.id ||
                received.receiverId === selectedContactRef.current.id)
            ) {
              setMessages((prev) => [...prev, received]);
            }
          });
        },
        (error) => {
          console.error("❌ WebSocket error:", error);
          setTimeout(connect, 3000); // auto reconnect
        }
      );

      socket.onclose = () => {
        console.warn("⚠️ WebSocket closed. Reconnecting...");
        setConnected(false);
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (client && client.connected) {
        client.disconnect(() => console.log("❌ Disconnected"));
      }
    };
  }, [currentUser]);

  // Polling fallback every 5 seconds
  useEffect(() => {
    if (!selectedContact || !currentUser) return;
    const interval = setInterval(() => {
      axios
        .get(
          `http://localhost:8080/api/messages/conversation/${currentUser.id}/${selectedContact.id}`
        )
        .then((res) => setMessages(res.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContact, currentUser]);

  // ✅ If chatWithUserId was set in localStorage (e.g. from a "Message" button)
  useEffect(() => {
    const chatWithUserId = localStorage.getItem("chatWithUserId");
    if (chatWithUserId && contacts.length > 0) {
      const contactToChat = contacts.find(
        (c) => c.id === Number(chatWithUserId)
      );
      if (contactToChat) {
        setSelectedContact(contactToChat);
        localStorage.removeItem("chatWithUserId");
      }
    }
  }, [contacts]);

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedContact || !connected || !currentUser)
      return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content,
    };

    stompClientRef.current.send(
      "/app/chat.sendMessage",
      {},
      JSON.stringify(messageData)
    );

    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      },
    ]);

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? { ...c, lastMessage: content, unread: false }
          : c
      )
    );
    setContent("");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      // <-- CHANGED: Used CSS variable for background
      style={{ height: "100vh", backgroundColor: "var(--bg-color)" }}
    >
      <div
        // Your .card class from index.css will handle the theming
        className="card shadow-lg"
        style={{ width: "80%", height: "85vh", borderRadius: "20px" }}
      >
        <div
          // <-- CHANGED: Removed 'bg-white' and used CSS variable
          className="card-header border-0"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <h4 className="fw-bold text-center mb-0">💬 Messages</h4>
        </div>

        <div className="card-body d-flex" style={{ overflow: "hidden" }}>
          {/* Contacts List */}
          <div
            className="border-end pe-3"
            style={{ width: "25%", overflowY: "auto" }}
          >
            <h6 className="fw-bold mb-3">Contacts</h6>
            {contacts.length === 0 && <p>No contacts yet.</p>}
            {contacts.map((contact) => (
              <div
                key={contact.id}
                // <-- CHANGED: Removed 'bg-light'
                className={`p-2 mb-2 rounded-3 ${
                  selectedContact?.id === contact.id
                    ? "bg-primary text-white" // This is OK, as .btn-primary is themed
                    : ""
                }`}
                // <-- CHANGED: Added theme-aware styles for unselected state
                style={{
                  cursor: "pointer",
                  position: "relative",
                  backgroundColor:
                    selectedContact?.id !== contact.id
                      ? "var(--bg-color)" // Use the page background for unselected
                      : "", // Let bg-primary take over when selected
                }}
                onClick={() => setSelectedContact(contact)}
              >
                <strong>{contact.username}</strong>
                <br />
                {/* <-- CHANGED: Removed 'text-muted' which fails in dark mode */}
                <small style={{ color: "var(--placeholder-color)" }}>
                  {contact.lastMessage
                    ? contact.lastMessage.length > 25
                      ? contact.lastMessage.slice(0, 25) + "..."
                      : contact.lastMessage
                    : contact.department}
                </small>
                {contact.unread && (
                  <span
                    className="badge bg-danger position-absolute top-0 end-0"
                    style={{ fontSize: "0.6rem" }}
                  >
                    ●
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-grow-1 d-flex flex-column ps-3">
            {selectedContact ? (
              <>
                <div className="border-bottom pb-2 mb-2">
                  <h6 className="fw-Ebold">
                    Chat with {selectedContact.username}
                  </h6>
                </div>

                <div
                  className="flex-grow-1 overflow-auto mb-3"
                  // <-- CHANGED: Used CSS variable for chat background
                  style={{
                    backgroundColor: "var(--bg-color)",
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  {messages.length === 0 ? (
                    <p className="text-center mt-3">
                      No messages yet.
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`d-flex mb-2 ${
                          msg.senderId === currentUser?.id
                            ? "justify-content-end"
                            : "justify-content-start"
                        }`}
                      >
                        <div
                          // <-- CHANGED: Removed 'bg-white' and 'border'
                          className={`p-2 rounded-3 ${
                            msg.senderId === currentUser?.id
                              ? "bg-primary text-white" // This is themed
                              : ""
                          }`}
                          // <-- CHANGED: Added theme-aware styles for "received" bubble
                          style={{
                            maxWidth: "70%",
                            backgroundColor:
                              msg.senderId !== currentUser?.id
                                ? "var(--card-bg)"
                                : "",
                            border:
                              msg.senderId !== currentUser?.id
                                ? "1px solid var(--input-border)"
                                : "none",
                          }}
                        >
                          {msg.content}
                          <div>
                            {/* <-- CHANGED: Used CSS var for timestamp color */}
                            <small
                              className="ms-2"
                              style={{ color: "var(--placeholder-color)" }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="d-flex border-top pt-2"
                  style={{ gap: "8px" }}
                >
                  <input
                    type="text"
                    // Your .form-control class from index.css will handle theming
                    className="form-control"
                    placeholder="Type a message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <button
                    type="submit"
                    // Your .btn-primary class from index.css will handle theming
                    className="btn btn-primary"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              // <-- CHANGED: Removed 'text-muted'
              <div className="text-center my-auto">
                Select a contact to start chatting 💬
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;