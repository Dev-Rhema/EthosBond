import { supabase } from "./supabaseClient";

class MessageService {
  /**
   * Send a message
   */
  async sendMessage(pairId, senderAddress, receiverAddress, messageText) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          pair_id: pairId,
          sender_address: senderAddress.toLowerCase(),
          receiver_address: receiverAddress.toLowerCase(),
          message: messageText,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  /**
   * Get all messages for a pair
   */
  async getMessagesByPairId(pairId) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("pair_id", pairId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(pairId, userAddress) {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("pair_id", pairId)
        .eq("receiver_address", userAddress.toLowerCase())
        .eq("is_read", false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userAddress) {
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_address", userAddress.toLowerCase())
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Get unread messages per pair for a user
   */
  async getUnreadMessagesByPair(userAddress) {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("pair_id")
        .eq("receiver_address", userAddress.toLowerCase())
        .eq("is_read", false);

      if (error) throw error;

      // Count unread messages per pair
      const unreadByPair = {};
      (data || []).forEach((msg) => {
        unreadByPair[msg.pair_id] = (unreadByPair[msg.pair_id] || 0) + 1;
      });

      return unreadByPair;
    } catch (error) {
      console.error("Error getting unread messages by pair:", error);
      return {};
    }
  }

  /**
   * Subscribe to real-time messages for a pair
   * Returns an unsubscribe function
   */
  subscribeToMessages(pairId, callback) {
    console.log(`Subscribing to messages for pair: ${pairId}`);

    const channel = supabase
      .channel(`messages:${pairId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: pairId },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `pair_id=eq.${pairId}`,
        },
        (payload) => {
          console.log("Real-time message event received:", payload.new);
          callback(payload.new);
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Subscribed to messages for pair: ${pairId}`);
        } else if (status === "CLOSED") {
          console.log(`❌ Subscription closed for pair: ${pairId}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`❌ Channel error for pair ${pairId}:`, err);
        } else {
          console.log(`Status: ${status}`, err);
        }
      });

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from messages for pair: ${pairId}`);
      channel.unsubscribe();
    };
  }

  /**
   * Subscribe to all messages for a user (for notifications)
   * Returns an unsubscribe function
   */
  subscribeToUserMessages(userAddress, callback) {
    const channel = supabase
      .channel(`user-messages:${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_address=eq.${userAddress.toLowerCase()}`,
        },
        (payload) => {
          callback(payload.new);
        },
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Delete all messages for a pair
   */
  async deleteMessagesByPairId(pairId) {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("pair_id", pairId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting messages:", error);
      return false;
    }
  }
}

export const messageService = new MessageService();
