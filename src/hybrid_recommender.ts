/*  Logica per l'approccio ibrido
    Utilizza sia il content-based filtering che il collaborative filtering per generare raccomandazioni
    Il punteggio finale è calcolato come: alpha * (punteggio content-based) + (1 - alpha) * (punteggio collaborative filtering)
*/

import cb from './content_based.js'
import cf from './collaborative_filtering.js'
import {Database} from 'sqlite3'
import {Recommendation} from './models.js'
import {DEFAULT_RECOMMENDATIONS, DEFAULT_K_NEIGHBORS, DEFAULT_ALPHA} from './constants.js'

/**
 * @summary Funzione principale per ottenere le raccomandazioni ibride
 * @param db - Database SQLite
 * @param user_id - ID dell'utente
 * @param nEvents - Numero di eventi da restituire (default: 10)
 * @param kNeighbors - Numero di vicini da considerare (default: 20)
 * @param alpha - Peso per il content-based filtering (default: 0.5)
 * @return - Array di raccomandazioni ibride
 */
async function getHybridRecommendations(db: Database, user_id: number, nEvents: number = DEFAULT_RECOMMENDATIONS, kNeighbors: number = DEFAULT_K_NEIGHBORS, alpha: number = DEFAULT_ALPHA): Promise<Recommendation[]>{
    // 1. Ottenere le raccomandazioni content-based e collaborative filtering
    const cbResults = await cb.getContentBasedRecommendations(db, user_id, nEvents*2)                       // Ottieni il doppio degli eventi per ottenere più risultati
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, nEvents*2, kNeighbors) // Ottieni il doppio degli eventi per ottenere più risultati 

    // 2. Mappare i punteggi delle raccomandazioni per ogni evento presente in almeno una lista
    const mapEventScores = new Map<number, {cbScore?: number, cfScore?: number}>()
    for(const cb of cbResults){
        mapEventScores.set(cb.event_id, {cbScore: cb.score})            // Aggiungi il punteggio content-based
    }
    for(const cf of cfResults){
        if(mapEventScores.has(cf.event_id)){                            
            mapEventScores.get(cf.event_id)!.cfScore = cf.normScore     // Aggiorna il punteggio collaborative filtering
        }
        else{
            mapEventScores.set(cf.event_id, {cfScore: cf.normScore})    // Aggiungi il punteggio collaborative filtering
        }
    }
    
    // 3. Calcolare il punteggio finale per ogni evento
    const hybridResults: Recommendation[] = []
    for(const [event_id, scores] of mapEventScores.entries()){
        const finalScore = (alpha * (scores.cbScore || 0)) + ((1 - alpha) * (scores.cfScore || 0))  // Calcola il punteggio finale
        hybridResults.push({event_id, score: Math.round(finalScore*1000)/1000})   // Arrotonda a 3 decimali 
    }

    // 4. Ordinare i risultati in base al punteggio finale
    hybridResults.sort((a, b) => b.score - a.score)

    // 5. Restituire i primi nEvents eventi
    return hybridResults.slice(0, nEvents)
}

export default {getHybridRecommendations}