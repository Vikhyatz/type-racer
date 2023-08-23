const express = require('express');
const http = require('http');
const axios = require('axios');
const socketIO = require('socket.io');
const path = require('path')

const app = express();
const server = http.createServer(app);
const io = socketIO(server);



app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
})

let Players = 0



io.on("connection", (socket) => {
    console.log('user connected generally');

    socket.on('joinRoom', async (room) => {
        socket.join(room);
        Players++;

        console.log(`User joined room: ${room}, player: ${Players}`);

        if (Players === 2) {
            console.log('start');
            io.in(room).emit('startCountdown');

            try {
                const response = await axios.get('http://api.quotable.io/random');
                const quote = response.data.content;

                // transferring the quote from the server to the client to get the same quote for each player 
                io.emit('quote', quote);

            } catch (error) {
                console.error('Error fetching quote:', error);
            }
        }

        socket.on('opponent-input', (input) => {
            socket.broadcast.emit('opponent-input', input);
        });

        socket.on('stop-game-random-time', (time) => {
            io.emit('stop-game-random-time', time);
        });

        socket.on('disconnect', () => {
            Players--;
            console.log(`User left room: ${room}, players remaining: ${Players}`);
        });
    })




});





server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
