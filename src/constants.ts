/*  File contenente tutte le costanti utilizzate nel progetto
*/

// Costanti per le raccomandazioni
export const DEFAULT_K_NEIGHBORS: number = 20;          // Numero di vicini da considerare per il collaborative filtering
export const DEFAULT_RECOMMENDATIONS: number = 10;      // Numero di eventi da consigliare
export const DEFAULT_ALPHA: number = 0.5;               // Peso per il content-based filtering nell'approccio ibrido
export const USER_VECTOR_EXPLICIT_WEIGHT: number = 2;   // Peso per le caratteristiche esplicite dell'utente
export const USER_VECTOR_IMPLICIT_WEIGHT: number = 1;   // Peso per le caratteristiche implicite dell'utente
export const EVENT_VECTOR_WEIGHT: number = 1;           // Peso per le caratteristiche dell'evento

// Costanti per il database
export const DB_PATH: string = 'musiconet.db';                                  // Percorso del database SQLite
export const USER_PATH: string = './data/user.json';                            // Percorso del file JSON contenente gli utenti
export const EVENT_PATH: string = './data/event.json';                          // Percorso del file JSON contenente gli eventi
export const GENRE_PATH: string = './data/genre.json';                          // Percorso del file JSON contenente i generi
export const INSTRUMENT_PATH: string = './data/instrument.json';                // Percorso del file JSON contenente gli strumenti
export const ARTIST_PATH: string = './data/artist.json';                        // Percorso del file JSON contenente gli artisti
export const USER_EVENT_PATH: string = './data/user_event.json';                // Percorso del file JSON contenente la relazione utente eventi
export const USER_GENRE_PATH: string = './data/user_genre.json';                // Percorso del file JSON contenente la relazione utente generi
export const USER_INSTRUMENT_PATH: string = './data/user_instrument.json';      // Percorso del file JSON contenente la relazione utente strumenti
export const USER_ARTIST_PATH: string = './data/user_artist.json';              // Percorso del file JSON contenente la relazione utente artisti
export const EVENT_GENRE_PATH: string = './data/event_genre.json';              // Percorso del file JSON contenente la relazione evento generi
export const EVENT_INSTRUMENT_PATH: string = './data/event_instrument.json';    // Percorso del file JSON contenente la relazione evento strumenti
export const EVENT_ARTIST_PATH: string = './data/event_artist.json';   	        // Percorso del file JSON contenente la relazione evento artisti

// constanti per l'inserimenti di un nuovo utente
export const NEW_USER_PATH: string = './data/new_user.json'                     // Percorso del file JSON contenente il nuovo utente
