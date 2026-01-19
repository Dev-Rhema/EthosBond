import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { messageService } from "../services/messageService";

export default function Chat({ pair, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load messages on mount and subscribe to real-time updates
  useEffect(() => {
    let pollInterval;

    const loadMessages = async () => {
      try {
        const loadedMessages = await messageService.getMessagesByPairId(
          pair.id,
        );
        setMessages(loadedMessages);
        console.log("Loaded messages:", loadedMessages.length);
        // Mark messages as read
        await messageService.markMessagesAsRead(pair.id, currentUser.address);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = messageService.subscribeToMessages(
      pair.id,
      (newMessage) => {
        console.log("Real-time message received:", newMessage);
        // Avoid duplicates - check if message already exists
        setMessages((prev) => {
          const messageExists = prev.some((m) => m.id === newMessage.id);
          if (messageExists) {
            console.log("Message already exists, skipping duplicate");
            return prev;
          }
          return [...prev, newMessage];
        });

        // Mark new message as read if it's for the current user
        if (newMessage.receiver_address === currentUser.address.toLowerCase()) {
          messageService.markMessagesAsRead(pair.id, currentUser.address);
        }
      },
    );

    // Polling fallback - check for new messages every 2 seconds
    pollInterval = setInterval(async () => {
      try {
        const loadedMessages = await messageService.getMessagesByPairId(
          pair.id,
        );
        setMessages((prev) => {
          // Compare lengths to detect new messages
          if (loadedMessages.length > prev.length) {
            console.log("Polling detected new messages");
            // Mark new messages as read
            messageService.markMessagesAsRead(pair.id, currentUser.address);
            return loadedMessages;
          }
          return prev;
        });
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [pair.id, currentUser.address]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      try {
        const messageText = input;
        // Optimistically add message to UI immediately
        const optimisticMessage = {
          id: Date.now().toString(),
          pair_id: pair.id,
          sender_address: currentUser.address.toLowerCase(),
          receiver_address: pair.profile.address.toLowerCase(),
          message: messageText,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setInput("");

        // Send to database
        await messageService.sendMessage(
          pair.id,
          currentUser.address,
          pair.profile.address,
          messageText,
        );
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message");
        // Remove the optimistic message on error
        setMessages((prev) => prev.slice(0, -1));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-gray-800 to-blue-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img
              src={pair.profile?.profilePicture || "/default-avatar.png"}
              alt={pair.profile?.displayName || pair.profile?.name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <h3 className="font-semibold text-white">
                {pair.profile?.displayName || pair.profile?.name}
              </h3>
              <p className="text-xs text-white text-opacity-80">
                ⭐ Ethos: {pair.profile?.ethosScore || 0}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isFromCurrentUser =
                msg.sender_address === currentUser.address.toLowerCase();
              return (
                <div
                  key={idx}
                  className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs ${
                      isFromCurrentUser
                        ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white"
                        : "bg-gray-100 text-gray-900 shadow"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2 bg-white rounded-b-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg hover:from-blue-800 hover:to-gray-900 transition"
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
