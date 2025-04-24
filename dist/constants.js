"use strict";
/*  File contenente tutte le costanti utilizzate nel progetto
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_ARTIST_PATH = exports.EVENT_INSTRUMENT_PATH = exports.EVENT_GENRE_PATH = exports.USER_ARTIST_PATH = exports.USER_INSTRUMENT_PATH = exports.USER_GENRE_PATH = exports.USER_EVENT_PATH = exports.ARTIST_PATH = exports.INSTRUMENT_PATH = exports.GENRE_PATH = exports.EVENT_PATH = exports.USER_PATH = exports.DB_PATH = exports.EVENT_VECTOR_WEIGHT = exports.USER_VECTOR_IMPLICIT_WEIGHT = exports.USER_VECTOR_EXPLICIT_WEIGHT = exports.DEFAULT_ALPHA = exports.DEFAULT_RECOMMENDATIONS = exports.DEFAULT_K_NEIGHBORS = void 0;
// Costanti per le raccomandazioni
exports.DEFAULT_K_NEIGHBORS = 20; // Numero di vicini da considerare per il collaborative filtering
exports.DEFAULT_RECOMMENDATIONS = 10; // Numero di eventi da consigliare
exports.DEFAULT_ALPHA = 0.5; // Peso per il content-based filtering nell'approccio ibrido
exports.USER_VECTOR_EXPLICIT_WEIGHT = 2; // Peso per le caratteristiche esplicite dell'utente
exports.USER_VECTOR_IMPLICIT_WEIGHT = 1; // Peso per le caratteristiche implicite dell'utente
exports.EVENT_VECTOR_WEIGHT = 1; // Peso per le caratteristiche dell'evento
// Costanti per il database
exports.DB_PATH = 'musiconet.db'; // Percorso del database SQLite
exports.USER_PATH = './data/user.json'; // Percorso del file JSON contenente gli utenti
exports.EVENT_PATH = './data/event.json'; // Percorso del file JSON contenente gli eventi
exports.GENRE_PATH = './data/genre.json'; // Percorso del file JSON contenente i generi
exports.INSTRUMENT_PATH = './data/instrument.json'; // Percorso del file JSON contenente gli strumenti
exports.ARTIST_PATH = './data/artist.json'; // Percorso del file JSON contenente gli artisti
exports.USER_EVENT_PATH = './data/user_event.json'; // Percorso del file JSON contenente la relazione utente eventi
exports.USER_GENRE_PATH = './data/user_genre.json'; // Percorso del file JSON contenente la relazione utente generi
exports.USER_INSTRUMENT_PATH = './data/user_instrument.json'; // Percorso del file JSON contenente la relazione utente strumenti
exports.USER_ARTIST_PATH = './data/user_artist.json'; // Percorso del file JSON contenente la relazione utente artisti
exports.EVENT_GENRE_PATH = './data/event_genre.json'; // Percorso del file JSON contenente la relazione evento generi
exports.EVENT_INSTRUMENT_PATH = './data/event_instrument.json'; // Percorso del file JSON contenente la relazione evento strumenti
exports.EVENT_ARTIST_PATH = './data/event_artist.json'; // Percorso del file JSON contenente la relazione evento artisti
