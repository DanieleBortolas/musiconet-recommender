/*  Logica per l'approccio ibrido
    Utilizza sia il content-based filtering che il collaborative filtering per generare raccomandazioni
*/

import cb from './content_based.js'
import cf from './collaborative_filtering.js'
import {Database} from 'sqlite3'
import {Recommendation} from './models.js'

// Funzione principale per ottenere le raccomandazioni ibride
async function getHybridRecommendations(db: Database, user_id: number, nEvents: number = 10, kNeighbors: number = 20, alpha: number = 0.5): Promise<Recommendation[]>{
    // 1. Ottenere le raccomandazioni content-based e collaborative filtering
    const cbResults = await cb.getContentBasedRecommendations(db, user_id, nEvents*2)
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, nEvents*2, kNeighbors)
    
    //console.log('Risultati CB: \n', cbResults)
    //console.log('Risultati CF: \n', cfResults)

    // 2. Mappare i punteggi delle raccomandazioni per ogni evento presente in almeno una lista
    const mapEventScores = new Map<number, {cbScore?: number, cfScore?: number}>()
    for(const cb of cbResults){
        mapEventScores.set(cb.event_id, {cbScore: cb.score})        // Aggiungi il punteggio content-based
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
        const finalScore = (alpha * (scores.cbScore || 0)) + ((1 - alpha) * (scores.cfScore || 0))
        hybridResults.push({event_id, score: finalScore}) 
    }

    // 4. Ordinare i risultati in base al punteggio finale 
    hybridResults.sort((a, b) => b.score - a.score)

    // 5. Restituire i primi nEvents eventi
    return hybridResults.slice(0, nEvents)
}

export default {getHybridRecommendations}