"use strict";
// Logica per l'approccio ibrido
// Utilizza sia il content-based filtering che il collaborative filtering per generare raccomandazioni
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
// Funzione principale per ottenere le raccomandazioni ibride
function getHybridRecommendations(db_1, user_id_1) {
    return __awaiter(this, arguments, void 0, function* (db, user_id, kNeighbors = 20, nEvents = 10, alpha = 0.5) {
        // 1. Ottenere le raccomandazioni content-based e collaborative filtering
        const cbResults = yield content_based_js_1.default.getContentBasedRecommendations(db, user_id, nEvents * 2);
        const cfResults = yield collaborative_filtering_js_1.default.getCollaborativeFilteringRecommendations(db, user_id, kNeighbors, nEvents * 2);
        //console.log('Risultati CB: \n', cbResults)
        //console.log('Risultati CF: \n', cfResults)
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
            const finalScore = (alpha * (scores.cbScore || 0)) + ((1 - alpha) * (scores.cfScore || 0));
            hybridResults.push({ event_id, score: finalScore });
        }
        // 4. Ordinare i risultati in base al punteggio finale 
        hybridResults.sort((a, b) => b.score - a.score);
        // 5. Restituire i primi nEvents eventi
        return hybridResults.slice(0, nEvents);
    });
}
exports.default = { getHybridRecommendations };
