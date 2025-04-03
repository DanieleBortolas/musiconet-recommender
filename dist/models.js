"use strict";
// Classi User ed Event
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
    // Metodo per aggiungere un nuovo genere
    addGenre(genres) {
        this.genres.push(genres);
    }
    // Metodo per aggiungere un nuovo strumento
    addInstrument(instrument) {
        this.instrument = instrument;
    }
    // Metodo per aggiungere un nuovo artista
    addArtist(artists) {
        this.artists.push(artists);
    }
    // Metodo per stampare le info dell'utente
    printInfo() {
        console.log(`Nome: ${this.name}, Cognome: ${this.surname}, Età: ${this.age}, Città: ${this.city}, Genere: ${this.genres.join(', ')}, Strumento: ${this.instrument}, Artista seguito: ${this.artists.join(', ')}`);
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
    // Metodo per aggiungere un nuovo genere
    addGenre(genres) {
        this.genres.push(genres);
    }
    // Metodo per aggiungere un nuovo strumento
    addInstrument(instrument) {
        this.instrument.push(instrument);
    }
    // Metodo per aggiungere un nuovo artista
    addArtist(artists) {
        this.artists.push(artists);
    }
    // Metodo per stampare le info dell'evento
    printInfo() {
        console.log(`Nome: ${this.name}, Genere: ${this.genres.join(', ')}, Strumenti: ${this.instrument.join(', ')}, Artista: ${this.artists.join(', ')}, Luogo: ${this.location}, Data: ${this.date}, Descrizione: ${this.description}`);
    }
}
exports.Event = Event;
