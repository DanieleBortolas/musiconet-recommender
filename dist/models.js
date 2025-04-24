"use strict";
/*  Modelli per gli algoritmi e i dati del db
    Classi e interfacce per la gestione degli utenti, degli eventi e delle raccomandazioni
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.User = void 0;
//Classe User
class User {
    constructor(id, name, surname, age, city, genres, instrument, artists) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.age = age;
        this.city = city;
        this.genres = genres;
        this.instrument = instrument;
        this.artists = artists;
    }
    // Metodo per stampare le info dell'utente
    printInfo() {
        console.log(`\nNome: ${this.name} \nCognome: ${this.surname} \nEtà: ${this.age} \nCittà: ${this.city} \nGenere: ${this.genres.join(', ')} \nStrumento: ${this.instrument} \nArtista seguito: ${this.artists.join(', ')}`);
    }
}
exports.User = User;
//Classe Event
class Event {
    constructor(id, name, genres, instrument, artists, location, date, description) {
        this.id = id;
        this.name = name;
        this.genres = genres;
        this.instrument = instrument;
        this.artists = artists;
        this.location = location;
        this.date = date;
        this.description = description;
    }
    // Metodo per stampare le info dell'evento
    printInfo() {
        console.log(`\nNome: ${this.name} \nGenere: ${this.genres.join(', ')} \nStrumenti: ${this.instrument.join(', ')} \nArtista: ${this.artists.join(', ')} \nLuogo: ${this.location} \nData: ${this.date} \nDescrizione: ${this.description}`);
    }
}
exports.Event = Event;
