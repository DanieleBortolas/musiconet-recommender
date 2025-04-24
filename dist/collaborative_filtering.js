"use strict";
/*  Logica per il collaborative filtering
    Utilizza la similarità di Jaccard per calcolare la similarità tra gli eventi seguiti dai vicini dell'utente target
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_operations_1 = __importDefault(require("./db_operations"));
const constants_1 = require("./constants");
/**
 * @summary Calcolare la similarità di Jaccard tra due set di eventi
 * @param setA - Primo set di eventi
 * @param setB - Secondo set di eventi
 * @return - Similarità di Jaccard tra i due set
 */
function jaccardSimilarity(setA, setB) {
    const intersection = new Set(); // Intersezione tra i due set
    for (const a of setA) {
        if (setB.has(a))
            intersection.add(a); // Aggiungo l'elemento alla intersezione se presente in entrambi i set
    }
    if (intersection.size == 0)
        return 0; // Se non ci sono eventi in comune, la similarità è 0
    const union = setA.size + setB.size - intersection.size; // Unione tra i due set
    return intersection.size / union; // Similarità di Jaccard
}
/***
 * @summary Trovare i k vicini più simili all'utente target
 * @param userTarget - ID dell'utente target
 * @param usersMap - Mappa degli utenti e degli eventi seguiti
 * @param kNeighbors - Numero di vicini da considerare
 * @return - Array di oggetti UserSimilarity contenenti l'ID dell'utente e la similarità
 */
function findNearestNeighbors(userTarget, usersMap, kNeighbors) {
    return __awaiter(this, void 0, void 0, function* () {
        const neighbors = []; // Vicini dell'utente target
        const userTargetEvents = usersMap.get(userTarget); // Eventi seguiti dall'utente target
        // 1. Controllare se l'utente target è presente nella mappa e se ha eventi seguiti
        if (!userTargetEvents || userTargetEvents.size == 0) {
            console.error(`Utente ${userTarget} non trovato o non ha eventi seguiti`);
            return [];
        }
        // 2. Per ogni utente nella mappa, calcolare la similarità con l'utente target
        for (const [otherUser, otherUserEvents] of usersMap.entries()) {
            if (userTarget != otherUser && otherUserEvents.size > 0) { // Ignora l'utente target e gli utenti senza eventi seguiti
                const similarity = jaccardSimilarity(userTargetEvents, otherUserEvents); // Calcola la similarità di Jaccard
                if (similarity > 0) {
                    neighbors.push({ user_id: otherUser, similarity });
                }
            }
        }
        console.log(`Vicini trovati per l'utente ${userTarget}:`, neighbors.length); // Stampa il numero di vicini trovati
        // 3. Ordinare i vicini in base alla similarità
        neighbors.sort((a, b) => b.similarity - a.similarity);
        // 4. Prendere i primi k vicini
        return neighbors.slice(0, kNeighbors);
    });
}
/**
 * @summary Normalizzare i punteggi delle raccomandazioni in base al numero di vicini
 * @param scores - Array di oggetti Recommendation contenenti l'ID dell'evento e il punteggio
 * @param k - Numero di vicini
 * @return - Array di oggetti Recommendation con i punteggi normalizzati
 */
function normalizeScore(scores, k) {
    // Controlla se ci sono punteggi da normalizzare
    if (scores.length == 0 || k <= 0)
        return; // Se non ci sono punteggi, non fare nulla
    // Normalizza i punteggi
    for (const s of scores) {
        s.normScore = s.score / k;
    }
}
/***
 * @summary Funzione principale per ottenere le raccomandazioni collaborative filtering
 * @param db - Database SQLite
 * @param user_id - ID dell'utente
 * @param nEvents - Numero di eventi da consigliare (default: 10)
 * @param kNeighbors - Numero di vicini da considerare (default: 20)
 * @return - Array di raccomandazioni collaborative filtering
 */
function getCollaborativeFilteringRecommendations(db_1, user_id_1) {
    return __awaiter(this, arguments, void 0, function* (db, user_id, nEvents = constants_1.DEFAULT_RECOMMENDATIONS, kNeighbors = constants_1.DEFAULT_K_NEIGHBORS) {
        // 1. Ottenere mappa utenti e eventi seguiti
        const allUsersEvents = yield db_operations_1.default.getAllUsersEvents(db);
        // 2. Trovare i k vicini più simili all'utente target
        const neighbors = yield findNearestNeighbors(user_id, allUsersEvents, kNeighbors);
        if (neighbors.length == 0) {
            console.log(`Nessun vicino trovato per l'utente ${user_id}`); // Se non ci sono vicini, restituisco un array vuoto
            return [];
        }
        // 3. Ottenere gli eventi seguiti dall'utente target
        const userEvents = allUsersEvents.get(user_id) || new Set();
        // 4. Creare una mappa per tenere traccia degli eventi raccomandati e dei punteggi di similarità
        const recommendedEvents = new Map();
        // 5. Per ogni vicino, aggiungere gli eventi seguiti alla mappa dei raccomandati
        for (const neighbor of neighbors) {
            const neighborEvents = allUsersEvents.get(neighbor.user_id);
            if (neighborEvents) { // Se il vicino ha eventi seguiti (non è undefined)
                for (const e of neighborEvents) {
                    if (!userEvents.has(e)) { // Se l'evento non è già seguito dall'utente target
                        const currentScore = recommendedEvents.get(e) || 0; // Ottieni il punteggio corrente dell'evento raccomandato (0 se non esiste)
                        recommendedEvents.set(e, currentScore + neighbor.similarity); // Aggiungo la similarità del vicino al punteggio dell'evento raccomandato
                    }
                }
            }
        }
        // 6. Convertire la mappa in un vettore, normalizzare i risultati e ordinare in base al punteggio
        const results = Array.from(recommendedEvents.entries()).map(([event_id, score]) => ({ event_id, score }));
        normalizeScore(results, neighbors.length); // Normalizza i punteggi in base al numero di vicini trovati
        results.sort((a, b) => (b.normScore || 0) - (a.normScore || 0)); // Ordina in base al punteggio decrescente
        // 7. Restituire i primi nEvents eventi
        return results.slice(0, nEvents);
    });
}
exports.default = { getCollaborativeFilteringRecommendations };
