import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Star } from "lucide-react";
import { messageService } from "../services/messageService";

export default function Chat({ bond, currentUser, onClose }) {
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
          bond.id,
        );
        setMessages(loadedMessages);
        console.log("Loaded messages:", loadedMessages.length);
        // Mark messages as read
        await messageService.markMessagesAsRead(bond.id, currentUser.address);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = messageService.subscribeToMessages(
      bond.id,
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
          messageService.markMessagesAsRead(bond.id, currentUser.address);
        }
      },
    );

    // Polling fallback - check for new messages every 2 seconds
    pollInterval = setInterval(async () => {
      try {
        const loadedMessages = await messageService.getMessagesByPairId(
          bond.id,
        );
        setMessages((prev) => {
          // Compare lengths to detect new messages
          if (loadedMessages.length > prev.length) {
            console.log("Polling detected new messages");
            // Mark new messages as read
            messageService.markMessagesAsRead(bond.id, currentUser.address);
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
  }, [bond.id, currentUser.address]);

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
          bond_id: bond.id,
          sender_address: currentUser.address.toLowerCase(),
          receiver_address: bond.profile.address.toLowerCase(),
          message: messageText,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setInput("");

        // Send to database
        await messageService.sendMessage(
          bond.id,
          currentUser.address,
          bond.profile.address,
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
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={bond.profile?.profilePicture || "/default-avatar.png"}
          alt={bond.profile?.displayName || bond.profile?.name}
          className="w-10 h-10 rounded-full border-2 border-cyan-500"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-100">
            {bond.profile?.displayName || bond.profile?.name}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {bond.profile?.ethosScore || 0}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">
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
                  className={`px-4 py-2 rounded-xl max-w-[75%] sm:max-w-xs break-words ${
                    isFromCurrentUser
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "bg-slate-700 text-slate-100 shadow"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
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
      <div className="p-4 border-t border-slate-700 flex gap-2 bg-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
        />
        <button
          onClick={handleSend}
          className="px-4 sm:px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition flex items-center gap-2"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
