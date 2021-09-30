//packages ophalen
const http = require("http");
const express = require("express");
const io = require("socket.io");

const app = express(); //Nieuwe express application aanmaken.
const server = http.createServer(app); //Nieuwe HTTP server aanmaken.
const ws = new io.Server(server); //Nieuwe websocket aanmaken.

app.use(express.static('./site')); //Html folder.

const { UserManager } = require('./site/js/users.js'); //UserManager word gebruikt om de connecties in op te slaan.

const users = new UserManager(); //Class in constante opslaan.

ws.on('connection', socket => { //event

    console.log('ID: '+socket.id+" connected to the server."); //Wanneer een nieuwe connectie ontstaan dan debug message sturen.
    users.createUser(socket.id); //Nieuwe user maken, id: socket.id, hits: 0

    socket.on('disconnect', function (e){ //Wanneer iemand disconnect user verwijderen van UserManager.
        users.deleteUser(socket.id)
        console.log('ID: '+socket.id+" disconnected from the server."); //debug message
    });

    socket.emit('setCounter', users.totalHits) //Wanneer iemand een nieuwe connectie maakt met de server, dan de counter op de juiste value zetten.

    socket.on('update', function(e){ //Als iemand de counter update, dan voor elke connectie deze ook updaten.

        if(e.hit == 1){ //1 erbij
            users.totalHits++;
        } else if(e.hit == -1){ //1 eraf 
            users.totalHits--;
        }

        const user = users.findUser(socket.id); //User zoeken.
        user.hits += e.hit//user hits aanpassen naar de hit die de User heeft uitgevoerd.

        socket.broadcast.emit('updateCounter', { //voor iedereen aanpassen
            id: socket.id,
            userHits: user.hits,
            hit: e.hit,
            totalHits: users.totalHits
        });
    });
    
});

//Zet de server aan op poort 5500 en netwerk ip.
server.listen(5500, '0.0.0.0', () => console.log(`Server running on port ${server.address().port}`));