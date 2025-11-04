// src/pages/MessagePage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Form, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";

const MessagePage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);

  const stompClientRef = useRef(null);
  const selectedContactRef = useRef(null);
  const currentUserRef = useRef(null);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const SockJS = window.SockJS;
  const Stomp = window.Stomp;

  // theme
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Keep refs updated
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // ✅ Get user info from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch contacts
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    axios
      // .get(`http://localhost:8080/api/messages/contacts/${currentUser.id}`)
      .get(ENDPOINTS.MESSAGES.CONTACTS(currentUser.id))
      .then((res) => setContacts(res.data))
      .catch((err) => console.error("Error fetching contacts:", err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Fetch messages for selected contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return;

    setLoading(true);
    axios
      // .get(`http://localhost:8080/api/messages/conversation/${currentUser.id}/${selectedContact.id}`)
      .get(ENDPOINTS.MESSAGES.CONVERSATION(currentUser.id, selectedContact.id))
      .then((res) => setMessages(res.data))
      .then(() => {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContact.id ? { ...c, unread: false } : c
          )
        );
      })
      .catch((err) => console.error("Error fetching conversation:", err))
      .finally(() => setLoading(false));
  }, [selectedContact, currentUser]);

  // WebSocket setup with auto reconnect
  useEffect(() => {
    if (!currentUser) return;

    let client;
    const connect = () => {
      // const socket = new SockJS("http://localhost:8080/ws");
      const socket = new SockJS(ENDPOINTS.WS_BASE);
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
          setTimeout(connect, 3000);
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
        // .get(`http://localhost:8080/api/messages/conversation/${currentUser.id}/${selectedContact.id}`)
        .get(
          ENDPOINTS.MESSAGES.CONVERSATION(currentUser.id, selectedContact.id)
        )
        .then((res) => setMessages(res.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContact, currentUser]);

  // ✅ If chatWithUserId was set in localStorage
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

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedContact || !currentUser) return;

    setSending(true);
    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content,
    };

    try {
      if (connected && stompClientRef.current) {
        stompClientRef.current.send(
          "/app/chat.sendMessage",
          {},
          JSON.stringify(messageData)
        );
      } else {
        // Fallback to HTTP if WebSocket is not connected
        // await axios.post("http://localhost:8080/api/messages/send", messageData);
        await axios.post(ENDPOINTS.MESSAGES.SEND, messageData);
      }

      // Optimistically update UI
      const optimisticMessage = {
        ...messageData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContact.id
            ? { ...c, lastMessage: content, unread: false }
            : c
        )
      );
      setContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="main-container">
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Contacts Sidebar */}
          <div className="col-md-4 col-lg-3 border-end p-0">
            <div className="d-flex flex-column h-100">
              {/* Header */}
              <div className="p-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0 fw-bold">
                    <i className="fas fa-comments me-2 text-primary"></i>
                    Messages
                  </h4>
                  <Badge
                    bg={connected ? "success" : "warning"}
                    className="d-flex align-items-center"
                  >
                    <i
                      className={`fas fa-circle me-1 ${
                        connected ? "fa-beat" : ""
                      }`}
                      style={{ fontSize: "6px" }}
                    ></i>
                    {connected ? "Online" : "Offline"}
                  </Badge>
                </div>

                {/* Search Bar */}
                <div className="position-relative">
                  <i className="fas fa-search position-absolute top-50 start-3 translate-middle-y text-muted"></i>
                  <Form.Control
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-5"
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-grow-1 overflow-auto">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading contacts...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-users fa-2x text-muted mb-3"></i>
                    <p className="text-muted">
                      {searchTerm ? "No contacts found" : "No contacts yet"}
                    </p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`contact-item p-3 border-bottom ${
                        selectedContact?.id === contact.id
                          ? "active-contact"
                          : ""
                      }`}
                      onClick={() => setSelectedContact(contact)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="contact-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                          {contact.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="mb-1 fw-semibold">
                              {contact.username}
                            </h6>
                            {contact.unread && (
                              <Badge bg="danger" pill>
                                ●
                              </Badge>
                            )}
                          </div>
                          <p className="mb-0 text-muted small text-truncate">
                            {contact.lastMessage ||
                              contact.department ||
                              "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-md-8 col-lg-9 d-flex flex-column p-0">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="chat-header p-3 border-bottom d-flex align-items-center">
                  <div className="d-flex align-items-center flex-grow-1">
                    <div className="contact-avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                      {selectedContact.username?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">
                        {selectedContact.username}
                      </h5>
                      <small className="text-muted">
                        {connected ? "Online" : "Last seen recently"}
                      </small>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <Button variant="outline-secondary" size="sm">
                      <i className="fas fa-phone"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                    >
                      <i className="fas fa-video"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className="messages-container flex-grow-1 p-3 overflow-auto"
                >
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-comment-dots fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No messages yet</h5>
                      <p className="text-muted">
                        Start the conversation by sending a message!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message-bubble mb-3 ${
                          msg.senderId === currentUser?.id
                            ? "message-sent"
                            : "message-received"
                        }`}
                      >
                        <div className="message-content">
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">
                            {formatMessageTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Input */}
                <div className="message-input p-3 border-top">
                  <Form onSubmit={handleSend} className="d-flex gap-2">
                    <div className="flex-grow-1 position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Type your message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={sending}
                        className="message-input-field"
                      />
                      <div className="message-actions position-absolute top-50 end-3 translate-middle-y">
                        <Button variant="link" className="text-muted p-0 me-2">
                          <i className="fas fa-paperclip"></i>
                        </Button>
                        <Button variant="link" className="text-muted p-0">
                          <i className="fas fa-smile"></i>
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!content.trim() || sending}
                      className="send-button px-3"
                    >
                      {sending ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </Button>
                  </Form>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
                <div className="empty-chat-icon mb-4">
                  <i className="fas fa-comments fa-4x text-muted"></i>
                </div>
                <h4 className="text-muted mb-3">Welcome to Messages</h4>
                <p className="text-muted mb-4">
                  Select a contact from the sidebar to start chatting
                </p>
                <div className="feature-list text-start text-muted">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <span>Real-time messaging</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <span>Secure and private</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-check text-success me-2"></i>
                    <span>Always in sync</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .main-container {
          height: 100vh;
          background: linear-gradient(135deg, var(--bg-color), var(--card-bg));
        }

        .contact-item {
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .contact-item:hover {
          background-color: var(--bg-color);
        }

        .active-contact {
          background-color: var(--primary-btn-bg) !important;
          color: white;
          border-left-color: var(--link-color);
        }

        .active-contact .text-muted {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .contact-avatar {
          width: 45px;
          height: 45px;
          font-size: 18px;
          font-weight: 600;
        }

        .messages-container {
          background-color: var(--bg-color);
        }

        .message-bubble {
          max-width: 70%;
          animation: messageSlide 0.3s ease-out;
        }

        .message-sent {
          margin-left: auto;
        }

        .message-sent .message-content {
          background: var(--primary-btn-bg);
          color: white;
          border-radius: 18px 18px 4px 18px;
          padding: 12px 16px;
        }

        .message-received .message-content {
          background: var(--card-bg);
          color: var(--text-color);
          border: 1px solid var(--input-border);
          border-radius: 18px 18px 18px 4px;
          padding: 12px 16px;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 4px;
        }

        .message-sent .message-time {
          text-align: right;
        }

        .message-input-field {
          border-radius: 25px;
          padding: 12px 120px 12px 20px;
          border: 1px solid var(--input-border);
        }

        .send-button {
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-chat-icon {
          opacity: 0.5;
        }

        .feature-list {
          max-width: 250px;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: var(--card-bg);
        }

        .contact-item:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};

export default MessagePage;
