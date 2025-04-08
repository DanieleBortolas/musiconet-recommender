"use strict";
// Logica per il collaborative filtering
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ml_distance_1 = require("ml-distance");
// Funzione per trovare i k vicini più simili ad un utente target
function findNearestNeighbors(userTarget_1, usersMap_1) {
    return __awaiter(this, arguments, void 0, function* (userTarget, usersMap, kNeighbors = 10) {
        const neighbors = []; // Vicini dell'utente target
        const userTargetEvents = usersMap.get(userTarget); // Eventi seguiti dall'utente target
        // 1. Controllare se l'utente target è presente nella mappa e se ha eventi seguiti
        if (!userTargetEvents || userTargetEvents.size == 0) {
            console.warn(`Utente ${userTarget} non trovato o non ha eventi seguiti`);
            return [];
        }
        // 2. Per ogni utente nella mappa, calcolare la similarità con l'utente target
        for (const [otherUser, otherUserEvents] of usersMap.entries()) {
            if (userTarget != otherUser && otherUserEvents.size > 0) {
                const similarity = 1 - ml_distance_1.distance.jaccard(Array.from(userTargetEvents), Array.from(otherUserEvents));
                if (similarity > 0) {
                    neighbors.push({ user_id: otherUser, similarity });
                }
            }
        }
        // 3. Ordinare i vicini in base alla similarità
        neighbors.sort((a, b) => b.similarity - a.similarity);
        // 4. Prendere i primi k vicini
        return neighbors; //.slice(0, kNeighbors)
    });
}
exports.default = { findNearestNeighbors };
