import cb from './content_based.js'
import cf from './collaborative_filtering.js'
import {Database} from 'sqlite3'
import dbOp from './db_operations.js'
import {Recommendation} from './models.js'

function normalizeScore(scores: Recommendation[]): void{
    if(scores.length == 0) return
    let maxScore = scores[0].score
    let minScore = scores[0].score

    for(const s of scores){
        if(s.score > maxScore) maxScore = s.score
        if(s.score < minScore) minScore = s.score
    }
    const range = maxScore - minScore
    if(range == 0) return
    for(const s of scores){
        s.normScore = (s.score - minScore) / range
    }
}

//TODO: aggiungere commenti e TESTARE
async function getHybridRecommendations(db: Database, user_id: number, kNeighbors: number = 20, nEvents: number = 10, alpha: number = 0.5): Promise<Recommendation[]>{
    const cbResults = await cb.getContentBasedRecommendations(db, user_id)
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, kNeighbors)
    
    normalizeScore(cbResults)
    normalizeScore(cfResults)

    const combinedScores = new Map<number, {cbScore?: number, cfScore?: number}>()
    for(const cb of cbResults){
        combinedScores.set(cb.event_id, {cbScore: cb.normScore})
    }
    for(const cf of cfResults){
        if(combinedScores.has(cf.event_id)){
            combinedScores.get(cf.event_id)!.cfScore = cf.normScore
        }
        else{
            combinedScores.set(cf.event_id, {cfScore: cf.normScore})
        }
    }
    const hybridResults: Recommendation[] = []
    
    for(const [event_id, scores] of combinedScores.entries()){
        const finalScore = (alpha * (scores.cbScore || 0)) + ((1 - alpha) * (scores.cfScore || 0))
        hybridResults.push({event_id, score: finalScore}) 
    }

    hybridResults.sort((a, b) => b.score - a.score)

    return hybridResults.slice(0, nEvents)
}
