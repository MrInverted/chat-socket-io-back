import { Server } from "socket.io";
import { httpServer } from "./server.js";
import { Message, sequelize } from "./database.js";

const io = new Server(httpServer, {
  cors: { origin: "*" }
})

const getAllRooms = async () => {
  const allRooms = await Message.findAndCountAll({
    attributes: [
      [sequelize.fn('DISTINCT', sequelize.col('room')), 'room']
    ],
  });

  return allRooms?.rows?.map(item => item.toJSON().room);
}

const emitRooms = async (socket) => {
  const allRooms = await getAllRooms();
  socket.emit("rooms", allRooms);
}

const emitAllMessages = async (room) => {
  const allMessages = await Message.findAll({
    where: { room }
  });

  io.to(room).emit("server", allMessages);
}



io.on("connection", async (socket) => {
  const basicRoom = "Basic"
  socket.join(basicRoom);

  try {
    await emitRooms(socket);
    await emitAllMessages(basicRoom);
  }
  catch (error) {
    console.warn(error);
    socket.emit("server-error", "Something was wrong...");
  }



  socket.on("client", async (inc) => {
    const { login, room, text, textColor, bgColor } = inc;
    socket.join(room);

    try {
      const allRooms = await getAllRooms();

      await Message.create({ login, room, text, textColor, bgColor });
      await emitAllMessages(room);

      if (!allRooms.includes(room)) await emitRooms(socket);
    } catch (error) {
      console.warn(error);
      socket.emit("server-error", "Something was wrong...");
    }
  });



  socket.on("change-room", async (room) => {
    Array.from(socket.rooms).forEach(room => {
      if (room === socket.id) return;
      socket.leave(room);
    });

    socket.join(room);

    try {
      await emitAllMessages(room);
    } catch (error) {
      console.warn(error);
      socket.emit("server-error", "Something was wrong...");
    }
  })
});
