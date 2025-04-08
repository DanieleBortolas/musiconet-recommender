// Logica per il collaborative filtering

import {Database} from 'sqlite3'
import dbOp from './db_operations'

// Funzione per calcolare la similarità di Jaccard tra due set di eventi
//TODO: commenta bene
function jaccardSimilarity(setA: Set<number>, setB: Set<number>): number{
    const intersection = new Set<number>()
    for(const a of setA){
        if(setB.has(a)){
            intersection.add(a)                                 // Aggiungo l'elemento alla intersezione se presente in entrambi i set
        }
    }
    if(intersection.size == 0) return 0
    
    const union = setA.size + setB.size - intersection.size                          // Unione tra i due set
    if(union == 0) return 0

    return intersection.size / union                                                 // Similarità di Jaccard
}
// Funzione per trovare i k vicini più simili ad un utente target
// TODO: commenta bene
async function findNearestNeighbors(userTarget: number, usersMap: Map<number, Set<number>>, kNeighbors: number = 10): Promise<{user_id: number; similarity: number}[]>{
    const neighbors: { user_id: number; similarity: number}[] = []  // Vicini dell'utente target
    const userTargetEvents = usersMap.get(userTarget)   // Eventi seguiti dall'utente target

    // 1. Controllare se l'utente target è presente nella mappa e se ha eventi seguiti
    if(!userTargetEvents || userTargetEvents.size == 0){
        console.warn(`Utente ${userTarget} non trovato o non ha eventi seguiti`)
        return []
    }

    // 2. Per ogni utente nella mappa, calcolare la similarità con l'utente target
    for(const [otherUser, otherUserEvents] of usersMap.entries()){
        if(userTarget != otherUser && otherUserEvents.size > 0){
            const similarity = jaccardSimilarity(userTargetEvents, otherUserEvents)
            if(similarity > 0){
                neighbors.push({user_id: otherUser, similarity})
            }
        }
    }

    // 3. Ordinare i vicini in base alla similarità
    neighbors.sort((a, b) => b.similarity - a.similarity)

    // 4. Prendere i primi k vicini
    return neighbors//.slice(0, kNeighbors)

}

export default {findNearestNeighbors}