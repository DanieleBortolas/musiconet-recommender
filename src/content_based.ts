// Logica per il content-based filtering
// Utilizza la similarità coseno (dalla libreria ml-distance) per calcolare la similarità tra le caratteristiche 
// dell'utente e quelle degli eventi

import {Database} from 'sqlite3'
import dbOp from './db_operations'
import {similarity as mlSimilarity} from 'ml-distance'

// Creare mapping caratteristiche -> indice
async function buildFeatureMap(db: Database): Promise<Map <string | number, number>>{   // il primo number è l'ID artista
    //1. Ottenere tutti i generi, strumenti e id artisti
    const genres = await dbOp.getAllGenresName(db)
    const instruments = await dbOp.getAllInstrumentsName(db)
    const artists = await dbOp.getAllArtistsId(db)

    //2. Creare unica mappa per genere, strumento e artista
    const featureMap = new Map<string | number, number>()
    let j = 0
    genres.forEach(g => featureMap.set(g, j++))         // Aggiungo generi alla mappa
    instruments.forEach(i => featureMap.set(i, j++))    // Aggiungo strumenti alla mappa
    artists.forEach(a => featureMap.set(a, j++))        // Aggiungo artisti alla mappa

    //console.log(`Mappa caratteristiche creata con ${featureMap.size} caratteristiche`)
    
    return featureMap
}

// Funzione per calcolare quanto le caratteristiche di un utente sono coperte da un evento (POSSIBILE APPROCCIO IBRIDO)
function coverageScore(userVec: number[], eventVec: number[]) {
    let intersection = 0;
    let userFeatureCount = 0;
  
    for (let i = 0; i < userVec.length; i++) {
      if (userVec[i] === 1) {
        userFeatureCount++;
        if (eventVec[i] === 1) {
          intersection++;
        }
      }
    }
  
    return userFeatureCount === 0 ? 0 : intersection / userFeatureCount;
}

// Funzione per creare il vettore pesato dell'utente
async function createUserVector(db: Database, user_id: number, featureMap: Map<string | number, number>): Promise<number[]>{
    // 1. Recuperare generi, strumenti e artisti preferiti dall'utente
    const userGenres = await dbOp.getGenresNameByUserId(db, user_id)
    const userInstruments = await dbOp.getInstrumentsNameByUserId(db, user_id)
    const userArtists = await dbOp.getArtistsIdByUserId(db, user_id)

    const userFeatures = new Set<string | number>()     // Set per generi (string), strumenti (string) e id artisti (number)
    userGenres.forEach(g => userFeatures.add(g))        // Aggiungo generi al set
    userInstruments.forEach(i => userFeatures.add(i))   // Aggiungo strumenti al set
    userArtists.forEach(a => userFeatures.add(a))       // Aggiungo artisti al set

    // 2. Recuperare generi, strumenti e artisti dagli eventi seguiti dall'utente
    const followedEvents = await dbOp.getEventsIdByUserId(db, user_id)  // Eventi seguiti dall'utente
    const userEventsFeatures = new Set<string | number>()               // Secondo set pesato diversamente nella costruzione del vettore
    for(const e of followedEvents){
        const eventGenres = await dbOp.getGenresNameByEventId(db, e)            
        const eventInstruments = await dbOp.getInstrumentsNameByEventId(db, e)
        const eventArtists = await dbOp.getArtistsIdByEventId(db, e)

        eventGenres.forEach(g => userEventsFeatures.add(g))             // Aggiungo generi al secondo set
        eventInstruments.forEach(i => userEventsFeatures.add(i))        // Aggiungo strumenti al secondo set
        eventArtists.forEach(a => userEventsFeatures.add(a))            // Aggiungo artisti al secondo set
    }
    
    // 3. Costruire il vettore pesato
    const vec = new Array(featureMap.size).fill(0)
    for(const uef of userEventsFeatures){
        let i: number | undefined = featureMap.get(uef)         //Indice può essere un numero o indefinito
        if(i != undefined){
            vec[i] = 1                                          // Caratteristiche degli eventi seguiti dall'utente pesate 1
        }else{
            console.error(`Caratteristica ${uef} non trovata`)  //Se i è undefined, uf non trovata nella mappa
        }
    }
    for(const uf of userFeatures){
        let i: number | undefined = featureMap.get(uf)
        if(i != undefined){
            vec[i] = 2                                          // Caratteristiche esplicite dell'utente pesate 2
        }else{
            console.error(`Caratteristica ${uf} non trovata`)
        }
    }
    return vec
}

// Funzione per creare il vettore binario dell'evento
async function createEventVector(db: Database, event_id: number, featureMap: Map<string | number, number>): Promise<number[]>{
    // 1. Recuperare generi, strumenti e artisti presenti nell'evento
    const eventGenres = await dbOp.getGenresNameByEventId(db, event_id)
    const eventInstruments = await dbOp.getInstrumentsNameByEventId(db, event_id)
    const eventArtists = await dbOp.getArtistsIdByEventId(db, event_id)

    const eventFeatures = new Set<string | number>()        // Set per generi (tipo string), strumenti (tipo string) e id artisti (tipo number)
    eventGenres.forEach(g => eventFeatures.add(g))          // Aggiungo generi al set
    eventInstruments.forEach(i => eventFeatures.add(i))     // Aggiungo strumenti al set
    eventArtists.forEach(a => eventFeatures.add(a))         // Aggiungo artisti al set
    
    // 2. Costruire il vettore binario
    const vec = new Array(featureMap.size).fill(0)
    for(const uf of eventFeatures){
        let i: number | undefined = featureMap.get(uf)          //Indice può essere un numero o indefinito
        if(i != undefined){
            vec[i] = 1                                          // Caratteristiche dell'evento pesate 1
        }else{
            console.error(`Caratteristica ${uf} non trovata`)   //Se i è undefined, uf non trovata nella mappa
        }
    }
    return vec
}

// Funzione principale per ottenere le raccomandazioni content-based
async function getContentBasedRecommendations(db: Database, user_id: number, nEvents: number = 10): Promise<{event_id: number, similarity: number}[]>{
    // 1. Creare mappa caratteristiche, vettore utente, prelevare tutti gli eventi ed eventi dell'utente 
    const featureMap: Map <string | number, number> = await buildFeatureMap(db)         // Mappa caratteristiche
    const userVector: number[] = await createUserVector(db, user_id, featureMap)        // Vettore utente
    const allEventsId: number[] = await dbOp.getEventsId(db)                            // Tutti gli eventi
    const userEvents = new Set(await dbOp.getEventsIdByUserId(db, user_id))             // Eventi seguiti dall'utente
    const results: {event_id: number, similarity: number}[] = []

    //2. Gestire se utente è nuovo (cold start)
    if(userVector.every(v => v == 0)){                  // Se l'utente non ha preferenze, restituisco gli eventi più popolari
        const popularEvent = await dbOp.getPopularEventsId(db)
        for(const e of popularEvent){
            results.push({event_id: e, similarity: 0})      // similarity = 0 perché non c'è similarità
        }
        return results.slice(0, nEvents)                // Restituisco i primi nEvents eventi più popolari
    }

    // 3. Per ogni evento, creare vettore e calcolare similarità coseno
    for(const id of allEventsId){
        if(!userEvents.has(id)){                        // Se l'evento non è già seguito dall'utente (Set: complessità O(n))
            const eventVector: number[] = await createEventVector(db, id, featureMap)
            const similarity = mlSimilarity.cosine(userVector, eventVector)            // Cosine similarity tra vettore utente e vettore evento
            
            /*
            const alpha = 0.6; // peso da assegnare alla cosine similarity
            const similarity = alpha * similarity.cosine(userVector, eventVector) + (1 - alpha) * coverageScore(userVector, eventVector);
            */
            
            if(similarity > 0){                             // Se la similarità è maggiore di 0, aggiungi alla lista dei risultati
                results.push({event_id: id, similarity})
            }
        }
    }

    // 4. Ordinare i risultati in base alla similarità decrescente 
    results.sort((a, b) => b.similarity - a.similarity)

    // 5. Restituire i primi nEvents eventi
    return results.slice(0, nEvents)
}

export default {getContentBasedRecommendations}