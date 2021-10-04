class UserManager { //User manager wordt gebruikt, om WebSockets in op te slaan.

    constructor(){//in de UserManager een array en een counter maken.
        this.users = [];
        this.totalHits = 0;
        this.resetCountUsers = new Set();
    }

    createUser(id){ 
        this.users.push({id: id, hits: 0});
        return this.findUser(id);
    }

    findUser(id){
        return this.users.find(user => user.id === id); //undefined, of object
    }

    getAllUsers(){
        return this.users;
    }

    deleteUser(id){
        const user = this.findUser(id);
        if(!user) return 'User does not exist.'; //debug message
        
        const index = this.users.findIndex(user => user.id == id);
        if(index == -1) return 'User not Found'; //debug message

        return this.users.splice(index, 1);

    }

}

module.exports = { UserManager }; //module exporteren, zodat deze makkelijk te gebruiken is in een andere Node.JS file.