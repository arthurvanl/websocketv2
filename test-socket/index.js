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
        users.resetCountUsers.delete(socket.id); //verwijder de user van de set.

        if(users.users.length == 1 && users.users.length == users.resetCountUsers.size){ //als de array length gelijk is 1 en gelijk aan de set size dan door gaan
            users.totalHits = 0;
            users.resetCountUsers.clear();
            socket.broadcast.emit('setCounter', {
                totalHits: 0,
                userSize: 1,
                setSize: 0
            });
        } else { //zo niet dan dit uitvoeren.
            socket.broadcast.emit('setCounter', {
                totalHits: users.totalHits, 
                userSize: users.users.length,
                setSize: users.resetCountUsers.size
            });
        }
    });

    if(users.resetCountUsers.size > 0){ //als resetCountUsers groter dan 0 is dan door gaan.
        socket.emit('setCounter', { //event aanmaken
            totalHits: users.totalHits,
            userSize: users.users.length,
            setSize: users.resetCountUsers.size,
        });
        socket.broadcast.emit('setCounter', { //waardes broadcasten naar alles Web Sockets.
            totalHits: users.totalHits, 
            userSize: users.users.length,
            setSize: users.resetCountUsers.size
        })
    } else {
        socket.emit('setCounter', { //alleen voor de user goed neerzetten.
            totalHits: users.totalHits,
            userSize: users.users.length,
            setSize: 0
        })
    }

    socket.on('reset-counter', function(e){ //reset functie.
        
        if(users.resetCountUsers.has(e)) return; //als de websocket id al in de set zit dan niet door gaan. 
        //De regel hierboven is eigenlijk niet echt nodig vanwege een set niet dezelfde waarde nog een keer in de set kan stoppen. Dat filtert de Set eruit.
        users.resetCountUsers.add(e); //websocket id toevoegen aan array.

        if(users.resetCountUsers.size == users.users.length){ //als de resetCountUsers gelijk is aan de lengte van user array, dan door gaan.
            users.resetCountUsers.clear();
            users.totalHits = 0;
            socket.broadcast.emit('setCounter', { //event broadcasten.
                totalHits: users.totalHits,
                userSize: users.users.length,
                setSize: 0
            });
            socket.emit('setCounter', {
                totalHits: users.totalHits,
                userSize: users.users.length,
                setSize: 0
            });
        } else { //zo niet dan de
            socket.broadcast.emit('resetCount', { //event broadcasten.
                totalUsers: users.users.length,
                resetUsers: users.resetCountUsers.size
            });
            socket.emit('resetCount', { //event sturen naar de websocket waarvan de "reset-counter" werdt gelistent
                totalUsers: users.users.length,
                resetUsers: users.resetCountUsers.size
            });
        }

    });

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
server.listen(6500, '0.0.0.0', () => console.log(`Server running on port ${server.address().port}`));