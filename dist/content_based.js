"use strict";
/*  Logica per il content-based filtering
    Utilizza la similarità coseno (dalla libreria ml-distance) per calcolare la similarità tra le caratteristiche
    dell'utente e quelle degli eventi
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
const db_operations_1 = __importDefault(require("./db_operations"));
const ml_distance_1 = require("ml-distance");
// Creare mapping caratteristiche -> indice
function buildFeatureMap(db) {
    return __awaiter(this, void 0, void 0, function* () {
        //1. Ottenere tutti i generi, strumenti e id artisti
        const genres = yield db_operations_1.default.getAllGenresName(db);
        const instruments = yield db_operations_1.default.getAllInstrumentsName(db);
        const artists = yield db_operations_1.default.getAllArtistsId(db);
        //2. Creare unica mappa per genere, strumento e artista
        const featureMap = new Map();
        let j = 0;
        genres.forEach(g => featureMap.set(g, j++)); // Aggiungo generi alla mappa
        instruments.forEach(i => featureMap.set(i, j++)); // Aggiungo strumenti alla mappa
        artists.forEach(a => featureMap.set(a, j++)); // Aggiungo artisti alla mappa
        //console.log(`Mappa caratteristiche creata con ${featureMap.size} caratteristiche`)
        return featureMap;
    });
}
// Calcolare quanto le caratteristiche di un utente sono coperte da un evento (POSSIBILE APPROCCIO IBRIDO)
function coverageScore(userVec, eventVec) {
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
// Creare il vettore pesato dell'utente
function createUserVector(db, user_id, featureMap) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Recuperare generi, strumenti e artisti preferiti dall'utente
        const userGenres = yield db_operations_1.default.getGenresNameByUserId(db, user_id);
        const userInstruments = yield db_operations_1.default.getInstrumentsNameByUserId(db, user_id);
        const userArtists = yield db_operations_1.default.getArtistsIdByUserId(db, user_id);
        const userFeatures = new Set(); // Set per generi (string), strumenti (string) e id artisti (number)
        userGenres.forEach(g => userFeatures.add(g)); // Aggiungo generi al set
        userInstruments.forEach(i => userFeatures.add(i)); // Aggiungo strumenti al set
        userArtists.forEach(a => userFeatures.add(a)); // Aggiungo artisti al set
        // 2. Recuperare generi, strumenti e artisti dagli eventi seguiti dall'utente
        const followedEvents = yield db_operations_1.default.getEventsIdByUserId(db, user_id); // Eventi seguiti dall'utente
        const userEventsFeatures = new Set(); // Secondo set pesato diversamente nella costruzione del vettore
        for (const e of followedEvents) {
            const eventGenres = yield db_operations_1.default.getGenresNameByEventId(db, e);
            const eventInstruments = yield db_operations_1.default.getInstrumentsNameByEventId(db, e);
            const eventArtists = yield db_operations_1.default.getArtistsIdByEventId(db, e);
            eventGenres.forEach(g => userEventsFeatures.add(g)); // Aggiungo generi al secondo set
            eventInstruments.forEach(i => userEventsFeatures.add(i)); // Aggiungo strumenti al secondo set
            eventArtists.forEach(a => userEventsFeatures.add(a)); // Aggiungo artisti al secondo set
        }
        // 3. Costruire il vettore pesato
        const vec = new Array(featureMap.size).fill(0);
        for (const uef of userEventsFeatures) {
            let i = featureMap.get(uef); //Indice può essere un numero o indefinito
            if (i != undefined) {
                vec[i] = 1; // Caratteristiche degli eventi seguiti dall'utente pesate 1
            }
            else {
                console.error(`Caratteristica ${uef} non trovata`); //Se i è undefined, uf non trovata nella mappa
            }
        }
        for (const uf of userFeatures) {
            let i = featureMap.get(uf);
            if (i != undefined) {
                vec[i] = 2; // Caratteristiche esplicite dell'utente pesate 2
            }
            else {
                console.error(`Caratteristica ${uf} non trovata`);
            }
        }
        return vec;
    });
}
// Creare il vettore binario dell'evento
function createEventVector(db, event_id, featureMap) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Recuperare generi, strumenti e artisti presenti nell'evento
        const eventGenres = yield db_operations_1.default.getGenresNameByEventId(db, event_id);
        const eventInstruments = yield db_operations_1.default.getInstrumentsNameByEventId(db, event_id);
        const eventArtists = yield db_operations_1.default.getArtistsIdByEventId(db, event_id);
        const eventFeatures = new Set(); // Set per generi (tipo string), strumenti (tipo string) e id artisti (tipo number)
        eventGenres.forEach(g => eventFeatures.add(g)); // Aggiungo generi al set
        eventInstruments.forEach(i => eventFeatures.add(i)); // Aggiungo strumenti al set
        eventArtists.forEach(a => eventFeatures.add(a)); // Aggiungo artisti al set
        // 2. Costruire il vettore binario
        const vec = new Array(featureMap.size).fill(0);
        for (const uf of eventFeatures) {
            let i = featureMap.get(uf); //Indice può essere un numero o indefinito
            if (i != undefined) {
                vec[i] = 1; // Caratteristiche dell'evento pesate 1
            }
            else {
                console.error(`Caratteristica ${uf} non trovata`); //Se i è undefined, uf non trovata nella mappa
            }
        }
        return vec;
    });
}
// Funzione principale per ottenere le raccomandazioni content-based
function getContentBasedRecommendations(db_1, user_id_1) {
    return __awaiter(this, arguments, void 0, function* (db, user_id, nEvents = 10) {
        // 1. Creare mappa caratteristiche, vettore utente, prelevare tutti gli eventi ed eventi dell'utente 
        const featureMap = yield buildFeatureMap(db); // Mappa caratteristiche
        const userVector = yield createUserVector(db, user_id, featureMap); // Vettore utente
        const allEventsId = yield db_operations_1.default.getEventsId(db); // Tutti gli eventi
        const userEvents = new Set(yield db_operations_1.default.getEventsIdByUserId(db, user_id)); // Eventi seguiti dall'utente
        const results = [];
        //2. Gestire se utente è nuovo (cold start)
        if (userVector.every(v => v == 0)) { // Se l'utente non ha preferenze, restituisco gli eventi più popolari
            const popularEvent = yield db_operations_1.default.getPopularEventsId(db);
            for (const e of popularEvent) {
                results.push({ event_id: e, score: 0 }); // similarity = 0 perché non c'è similarità
            }
            return results.slice(0, nEvents); // Restituisco i primi nEvents eventi più popolari
        }
        // 3. Per ogni evento, creare vettore e calcolare similarità coseno
        for (const id of allEventsId) {
            if (!userEvents.has(id)) { // Se l'evento non è già seguito dall'utente (Set: complessità O(n))
                const eventVector = yield createEventVector(db, id, featureMap);
                const similarity = ml_distance_1.similarity.cosine(userVector, eventVector); // Cosine similarity tra vettore utente e vettore evento
                /*
                const alpha = 0.6; // peso da assegnare alla cosine similarity
                const similarity = alpha * similarity.cosine(userVector, eventVector) + (1 - alpha) * coverageScore(userVector, eventVector);
                */
                if (similarity > 0) { // Se la similarità è maggiore di 0, aggiungi alla lista dei risultati
                    results.push({ event_id: id, score: similarity });
                }
            }
        }
        // 4. Ordinare i risultati in base alla similarità decrescente 
        results.sort((a, b) => b.score - a.score);
        // 5. Restituire i primi nEvents eventi
        return results.slice(0, nEvents);
    });
}
exports.default = { getContentBasedRecommendations };
