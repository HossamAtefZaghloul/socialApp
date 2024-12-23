import { Message } from '../models/Message.js';

export default function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room 
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });

    // Handle sendMessage event
    socket.on("sendMessage", async (data) => {
      const { sender, receiverId, content } = data;
      // Check if content is valid
      if (!content || typeof content !== "string" || !content.trim()) {
        socket.emit("contentError", { error: "content content cannot be empty" });
        console.log("content content is not valid. Ignoring content.");
        return;
      }
      const newMessage = new Message({
        sender,
        receiver: receiverId,
        content,
        timestamp: new Date().toISOString(),
      });
      await newMessage.save();

      // Emit the message to the receiver's room
      io.to(receiverId).emit("receiveMessage", {
        sender,
        content,
        timestamp: newMessage.timestamp,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
