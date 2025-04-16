/*  Logica per il collaborative filtering
    Utilizza la similarità di Jaccard per calcolare la similarità tra gli eventi seguiti dagli utenti
*/

import {Database} from 'sqlite3'
import dbOp from './db_operations'
import {Recommendation, UserSimilarity} from './models'

// Calcolare la similarità di Jaccard tra due set di eventi
function jaccardSimilarity(setA: Set<number>, setB: Set<number>): number{
    const intersection = new Set<number>()                      // Intersezione tra i due set
    for(const a of setA){
        if(setB.has(a)) intersection.add(a)                     // Aggiungo l'elemento alla intersezione se presente in entrambi i set
    }
    if(intersection.size == 0) return 0                         // Se non ci sono eventi in comune, la similarità è 0
    
    const union = setA.size + setB.size - intersection.size     // Unione tra i due set

    return intersection.size / union                            // Similarità di Jaccard
}

// Trovare i k vicini più simili ad un utente target
async function findNearestNeighbors(userTarget: number, usersMap: Map<number, Set<number>>, kNeighbors: number): Promise<UserSimilarity[]>{
    const neighbors: UserSimilarity[] = []  // Vicini dell'utente target
    const userTargetEvents = usersMap.get(userTarget)   // Eventi seguiti dall'utente target

    // 1. Controllare se l'utente target è presente nella mappa e se ha eventi seguiti
    if(!userTargetEvents || userTargetEvents.size == 0){
        console.error(`Utente ${userTarget} non trovato o non ha eventi seguiti`)
        return []
    }

    // 2. Per ogni utente nella mappa, calcolare la similarità con l'utente target
    for(const [otherUser, otherUserEvents] of usersMap.entries()){
        if(userTarget != otherUser && otherUserEvents.size > 0){                        // Ignora l'utente target e gli utenti senza eventi seguiti
            const similarity = jaccardSimilarity(userTargetEvents, otherUserEvents)     // Calcola la similarità di Jaccard
            if(similarity > 0){
                neighbors.push({user_id: otherUser, similarity})    
            }
        }
    }

    // 3. Ordinare i vicini in base alla similarità
    neighbors.sort((a, b) => b.similarity - a.similarity)

    // 4. Prendere i primi k vicini
    return neighbors.slice(0, kNeighbors)
}

function normalizeScore(scores: Recommendation[], k: number): void{
    // Controlla se ci sono punteggi da normalizzare
    if(scores.length == 0 || k <= 0) return                       // Se non ci sono punteggi, non fare nulla
    
    // Normalizza i punteggi
    for(const s of scores){
        s.normScore = s.score / k
    }
}

// Funzione principale per ottenere le raccomandazioni collaborative filtering
async function getCollaborativeFilteringRecommendations(db: Database, user_id: number, nEvents: number = 10, kNeighbors: number = 20): Promise<Recommendation[]>{
    // 1. Creare mappa utenti e eventi seguiti
    const allUsersEvents = await dbOp.getAllUsersEvents(db)                                 

    // 2. Trovare i k vicini più simili all'utente target
    const neighbors = await findNearestNeighbors(user_id, allUsersEvents, kNeighbors)
    if(neighbors.length == 0){ 
        console.log(`Nessun vicino trovato per l'utente ${user_id}`)        // Se non ci sono vicini, restituisco un array vuoto
        return []
    }
    //console.log(neighbors)

    // 3. Ottenere gli eventi seguiti dall'utente target
    const userEvents = allUsersEvents.get(user_id) || new Set<number>()

    // 4. Creare una mappa per tenere traccia degli eventi raccomandati e dei punteggi di similarità
    const recommendedEvents = new Map<number, number>()

    // 5. Per ogni vicino, aggiungere gli eventi seguiti alla mappa dei raccomandati
    for(const neighbor of neighbors){
        const neighborEvents: Set<number> | undefined = allUsersEvents.get(neighbor.user_id)
        if(neighborEvents){                                                         // Se il vicino ha eventi seguiti (non è undefined)
            for(const e of neighborEvents){                                        
                if(!userEvents.has(e)){                                             // Se l'evento non è già seguito dall'utente target
                    const currentScore: number = recommendedEvents.get(e) || 0      // Ottieni il punteggio corrente dell'evento raccomandato (0 se non esiste)
                    recommendedEvents.set(e, currentScore + neighbor.similarity)    // Aggiungo la similarità del vicino al punteggio dell'evento raccomandato
                }
            }
        }
    }

    // 6. Convertire la mappa in un vettore, normalizzare i risultati e ordinare in base al punteggio
    const results: Recommendation[] = Array.from(recommendedEvents.entries()).map(([event_id, score]) => ({event_id, score}))
    normalizeScore(results, neighbors.length)             // Normalizza i punteggi in base al numero di vicini trovati
    results.sort((a, b) => b.score - a.score)       // Ordina in base al punteggio decrescente

    // 7. Restituire i primi nEvents eventi
    return results.slice(0, nEvents)

}

export default {getCollaborativeFilteringRecommendations}