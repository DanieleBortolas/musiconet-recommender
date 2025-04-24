"use strict";
/*  Logica per l'approccio ibrido
    Utilizza sia il content-based filtering che il collaborative filtering per generare raccomandazioni
    Il punteggio finale è calcolato come: alpha * (punteggio content-based) + (1 - alpha) * (punteggio collaborative filtering)
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
const content_based_js_1 = __importDefault(require("./content_based.js"));
const collaborative_filtering_js_1 = __importDefault(require("./collaborative_filtering.js"));
const constants_js_1 = require("./constants.js");
/**
 * @summary Funzione principale per ottenere le raccomandazioni ibride
 * @param db - Database SQLite
 * @param user_id - ID dell'utente
 * @param nEvents - Numero di eventi da restituire (default: 10)
 * @param kNeighbors - Numero di vicini da considerare (default: 20)
 * @param alpha - Peso per il content-based filtering (default: 0.5)
 * @return - Array di raccomandazioni ibride
 */
function getHybridRecommendations(db_1, user_id_1) {
    return __awaiter(this, arguments, void 0, function* (db, user_id, nEvents = constants_js_1.DEFAULT_RECOMMENDATIONS, kNeighbors = constants_js_1.DEFAULT_K_NEIGHBORS, alpha = constants_js_1.DEFAULT_ALPHA) {
        // 1. Ottenere le raccomandazioni content-based e collaborative filtering
        const cbResults = yield content_based_js_1.default.getContentBasedRecommendations(db, user_id, nEvents * 2); // Ottieni il doppio degli eventi per ottenere più risultati
        const cfResults = yield collaborative_filtering_js_1.default.getCollaborativeFilteringRecommendations(db, user_id, nEvents * 2, kNeighbors); // Ottieni il doppio degli eventi per ottenere più risultati 
        // 2. Mappare i punteggi delle raccomandazioni per ogni evento presente in almeno una lista
        const mapEventScores = new Map();
        for (const cb of cbResults) {
            mapEventScores.set(cb.event_id, { cbScore: cb.score }); // Aggiungi il punteggio content-based
        }
        for (const cf of cfResults) {
            if (mapEventScores.has(cf.event_id)) {
                mapEventScores.get(cf.event_id).cfScore = cf.normScore; // Aggiorna il punteggio collaborative filtering
            }
            else {
                mapEventScores.set(cf.event_id, { cfScore: cf.normScore }); // Aggiungi il punteggio collaborative filtering
            }
        }
        // 3. Calcolare il punteggio finale per ogni evento
        const hybridResults = [];
        for (const [event_id, scores] of mapEventScores.entries()) {
            const finalScore = (alpha * (scores.cbScore || 0)) + ((1 - alpha) * (scores.cfScore || 0)); // Calcola il punteggio finale
            hybridResults.push({ event_id, score: Math.round(finalScore * 1000) / 1000 }); // Arrotonda a 3 decimali 
        }
        // 4. Ordinare i risultati in base al punteggio finale
        hybridResults.sort((a, b) => b.score - a.score);
        // 5. Restituire i primi nEvents eventi
        return hybridResults.slice(0, nEvents);
    });
}
exports.default = { getHybridRecommendations };
