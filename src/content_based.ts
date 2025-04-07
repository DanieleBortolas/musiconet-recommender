// Creare mapping caratteristiche -> indice
import {Database} from 'sqlite3'
import {User, Event} from './models'
import dbOp from './db_operations'
import {similarity, distance} from 'ml-distance'

async function buildFeatureMap(db: Database): Promise<Map <string | number, number>>{   // il primo number è l'ID artista
    //1. Ottenere tutti i generi, strumenti e id artisti
    const genres = await dbOp.getAllGenresName(db)
    const instruments = await dbOp.getAllInstrumentsName(db)
    const artists = await dbOp.getAllArtistsId(db)

    //2. Creare unica mappa per genere, strumento e artista
    const featureMap = new Map<string | number, number>()
    let i = 0
    for(const genre of genres){
        featureMap.set(genre, i++)
    }
    for(const instrument of instruments){
        featureMap.set(instrument, i++)
    }
    for(const artist of artists){
        featureMap.set(artist, i++)
    }

    console.log(`Mappa caratteristiche creata con ${featureMap.size} caratteristiche`)
    
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

async function createUserVector(db: Database, user_id: number, featureMap: Map<string | number, number>): Promise<number[]>{
    // 1. Recuperare generi, strumenti e artisti preferiti dall'utente
    const userGenres = await dbOp.getGenresNameByUserId(db, user_id)
    const userInstruments = await dbOp.getInstrumentsNameByUserId(db, user_id)
    const userArtists = await dbOp.getArtistsIdByUserId(db, user_id)

    const userFeatures = new Set<string | number>()     // Set per generi (string), strumenti (string) e id artisti (number)
    userGenres.forEach(g => userFeatures.add(g))
    userInstruments.forEach(i => userFeatures.add(i))
    userArtists.forEach(a => userFeatures.add(a))

    // 2. Recuperare generi, strumenti e artisti dagli eventi seguiti dall'utente
    const followedEvents = await dbOp.getEventsIdByUserId(db, user_id)  // Eventi seguiti dall'utente
    const userEventsFeatures = new Set<string | number>()               // Secondo set pesato diversamente nella costruzione del vettore
    for(const e of followedEvents){
        const eventGenres = await dbOp.getGenresNameByEventId(db, e)
        const eventInstruments = await dbOp.getInstrumentsNameByEventId(db, e)
        const eventArtists = await dbOp.getArtistsIdByEventId(db, e)

        eventGenres.forEach(g => userEventsFeatures.add(g))
        eventInstruments.forEach(i => userEventsFeatures.add(i))
        eventArtists.forEach(a => userEventsFeatures.add(a))
    }
    
    // 3. Costruire il vettore pesato
    const vec = new Array(featureMap.size).fill(0)
    for(const uef of userEventsFeatures){
        let i: number | undefined = featureMap.get(uef)         //Indice può essere un numero o indefinito
        if(i != undefined){
            vec[i] = 1                                          // Caratteristiche degli eventi seguiti dall'utente pesate 1
        }else{
            console.error(`Caratteristica ${uef} non trovata`)  //Se i è undefined, uf non trovata nelle mappe
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

async function createEventVector(db: Database, event_id: number, featureMap: Map<string | number, number>): Promise<number[]>{
    // 1. Recuperare generi, strumenti e artisti presenti nell'evento
    const eventGenres = await dbOp.getGenresNameByEventId(db, event_id)
    const eventInstruments = await dbOp.getInstrumentsNameByEventId(db, event_id)
    const eventArtists = await dbOp.getArtistsIdByEventId(db, event_id)

    const eventFeatures = new Set<string | number>()     // Set per generi (tipo string), strumenti (tipo string) e id artisti (tipo number)
    eventGenres.forEach(g => eventFeatures.add(g))
    eventInstruments.forEach(i => eventFeatures.add(i))
    eventArtists.forEach(a => eventFeatures.add(a))
    
    // 2. Costruire il vettore binario
    const vec = new Array(featureMap.size).fill(0)
    for(const uf of eventFeatures){
        let i: number | undefined = featureMap.get(uf)           //Indice può essere un numero o indefinito
        if(i != undefined){
            vec[i] = 1
        }else{
            console.error(`Caratteristica ${uf} non trovata`)       //Se i è undefined, uf non trovata nelle mappe
        }
    }
    return vec
}

async function getContentBasedRecommendations(db: Database, user_id: number, nEvents: number = 10): Promise<{event_id: number, cosSim: number}[]>{
    // 1. Creare mappa caratteristiche, vettore utente, prelevare tutti gli eventi ed eventi dell'utente 
    const featureMap: Map <string | number, number> = await buildFeatureMap(db)
    const userVector: number[] = await createUserVector(db, user_id, featureMap)
    const allEventsId: number[] = await dbOp.getEventsId(db)
    const userEvents = new Set(await dbOp.getEventsIdByUserId(db, user_id)) // Converto in Set così .has ha complessità O(1)
    const results: {event_id: number, cosSim: number}[] = []

    //2. Gestire se utente è nuovo (cold start)
    if(userVector.every(v => v == 0)){ // Se l'utente non ha preferenze, restituisco gli eventi più popolari
        const popularEvent = await dbOp.getPopularEventsId(db)
        
        for(const e of popularEvent){
            results.push({event_id: e, cosSim: 0}) // cosSim = 0 perché non c'è similarità
        }
        return results.slice(0, nEvents)             // Restituisco i primi 10 eventi più popolari
    }

    // 3. Per ogni evento, creare vettore e calcolare similarità coseno
    for(const id of allEventsId){
        if(!userEvents.has(id)){             // Se l'evento non è già seguito dall'utente
            const eventVector: number[] = await createEventVector(db, id, featureMap)
            const cosSim = similarity.cosine(userVector, eventVector)
            
            //const alpha = 0.6; // peso da assegnare alla cosine similarity
            //const cosSim = alpha * similarity.cosine(userVector, eventVector) + (1 - alpha) * coverageScore(userVector, eventVector);
            
            if(cosSim > 0){                             // Se la similarità è maggiore di 0, aggiungi alla lista dei risultati
                results.push({event_id: id, cosSim})
            }
        }
    }
    results.sort((a, b) => b.cosSim - a.cosSim)         // Ordina in ordine decrescente

    // 4. Restituire i primi 10 eventi
    return results.slice(0, nEvents)                         // Restituisce i primi 10 eventi
}

export default {getContentBasedRecommendations}