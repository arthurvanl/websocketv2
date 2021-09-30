class Hit { //Class om de hits te registeren en te updaten.
    constructor(element) { //basic variables.
        this.hits = 0;
        this.element = element
    }

    add() { 
        this.hits++;
        this.update();
    }

    remove() {
        if (this.hits == 0) return;
        this.hits--;
        this.update();
    }

    update() { //Hit updaten op de webpagina.
        this.element.innerHTML = this.hits;
    }

}

var hitElement = document.querySelector(".hits"); //div class zoeken.
const hit = new Hit(hitElement); //Hit element opslaan en counter op 0;

const socket = io(); //nieuwe websocket (Van de huidige HTML webpagina connectie.)

document.body.onkeyup = function (e) { //event
    if (e.keyCode == 13) {//enter key code.
        hit.add();
        const hits = hit.hits
        socket.emit('update', {userHits: hits, hit: 1}); //Stuur event naar de server.
    }

    if (e.keyCode == 8) { //backslash key code.
        hit.remove();
        const hits = hit.hits
        socket.emit('update', {userHits: hits, hit: -1}); //Stuur event naar de server.
    }

}

socket.on('setCounter', function (e){ //Server event. Deze wordt aangeroepen zodra hij connect met de server
    hit.hits = e;
    hit.update(); //Hit element updaten
})

socket.on('updateCounter', function(e){ //Server event. Dit event wordt aangroepen zodra iemand de hit counter update.
    if(e.hit == 1){
        hit.add();
        console.log(e)
    } else if(e.hit == -1) {
        hit.remove();
        console.log(e)
    } 
})