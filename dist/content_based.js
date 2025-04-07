"use strict";
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
function buildFeatureMap(db) {
    return __awaiter(this, void 0, void 0, function* () {
        //1. Ottenere tutti i generi, strumenti e id artisti
        const genres = yield db_operations_1.default.getAllGenresName(db);
        const instruments = yield db_operations_1.default.getAllInstrumentsName(db);
        const artists = yield db_operations_1.default.getAllArtistsId(db);
        //2. Creare unica mappa per genere, strumento e artista
        const featureMap = new Map();
        let i = 0;
        for (const genre of genres) {
            featureMap.set(genre, i++);
        }
        for (const instrument of instruments) {
            featureMap.set(instrument, i++);
        }
        for (const artist of artists) {
            featureMap.set(artist, i++);
        }
        console.log(`Mappa caratteristiche creata con ${featureMap.size} caratteristiche`);
        return featureMap;
    });
}
// Funzione per calcolare quanto le caratteristiche di un utente sono coperte da un evento (POSSIBILE APPROCCIO IBRIDO)
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
function createUserVector(db, user_id, featureMap) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Recuperare generi, strumenti e artisti preferiti dall'utente
        const userGenres = yield db_operations_1.default.getGenresNameByUserId(db, user_id);
        const userInstruments = yield db_operations_1.default.getInstrumentsNameByUserId(db, user_id);
        const userArtists = yield db_operations_1.default.getArtistsIdByUserId(db, user_id);
        const userFeatures = new Set(); // Set per generi (string), strumenti (string) e id artisti (number)
        userGenres.forEach(g => userFeatures.add(g));
        userInstruments.forEach(i => userFeatures.add(i));
        userArtists.forEach(a => userFeatures.add(a));
        // 2. Recuperare generi, strumenti e artisti dagli eventi seguiti dall'utente
        const followedEvents = yield db_operations_1.default.getEventsIdByUserId(db, user_id); // Eventi seguiti dall'utente
        const userEventsFeatures = new Set(); // Secondo set pesato diversamente nella costruzione del vettore
        for (const e of followedEvents) {
            const eventGenres = yield db_operations_1.default.getGenresNameByEventId(db, e);
            const eventInstruments = yield db_operations_1.default.getInstrumentsNameByEventId(db, e);
            const eventArtists = yield db_operations_1.default.getArtistsIdByEventId(db, e);
            eventGenres.forEach(g => userEventsFeatures.add(g));
            eventInstruments.forEach(i => userEventsFeatures.add(i));
            eventArtists.forEach(a => userEventsFeatures.add(a));
        }
        // 3. Costruire il vettore binario
        const vec = new Array(featureMap.size).fill(0);
        for (const uef of userEventsFeatures) {
            let i = featureMap.get(uef); //Indice può essere un numero o indefinito
            if (i != undefined) {
                vec[i] = 1; // Caratteristiche degli eventi seguiti dall'utente pesate 1
            }
            else {
                console.error(`Caratteristica ${uef} non trovata`); //Se i è undefined, uf non trovata nelle mappe
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
        console.log(vec);
        return vec;
    });
}
function createEventVector(db, event_id, featureMap) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Recuperare generi, strumenti e artisti presenti nell'evento
        const eventGenres = yield db_operations_1.default.getGenresNameByEventId(db, event_id);
        const eventInstruments = yield db_operations_1.default.getInstrumentsNameByEventId(db, event_id);
        const eventArtists = yield db_operations_1.default.getArtistsIdByEventId(db, event_id);
        const eventFeatures = new Set(); // Set per generi (tipo string), strumenti (tipo string) e id artisti (tipo number)
        eventGenres.forEach(g => eventFeatures.add(g));
        eventInstruments.forEach(i => eventFeatures.add(i));
        eventArtists.forEach(a => eventFeatures.add(a));
        // 2. Costruire il vettore binario
        const vec = new Array(featureMap.size).fill(0);
        for (const uf of eventFeatures) {
            let i = featureMap.get(uf); //Indice può essere un numero o indefinito
            if (i != undefined) {
                vec[i] = 1;
            }
            else {
                console.error(`Caratteristica ${uf} non trovata`); //Se i è undefined, uf non trovata nelle mappe
            }
        }
        return vec;
    });
}
function getContentBasedRecommendations(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Creare mappa caratteristiche, vettore utente, prelevare tutti gli eventi ed eventi dell'utente 
        const featureMap = yield buildFeatureMap(db);
        const userVector = yield createUserVector(db, user_id, featureMap);
        const allEventsId = yield db_operations_1.default.getEventsId(db);
        const userEvents = new Set(yield db_operations_1.default.getEventsIdByUserId(db, user_id)); // Converto in Set così .has ha complessità O(1)
        const results = [];
        const n = 10;
        //2. Gestire se utente è nuovo (cold start)
        if (userVector.every(v => v == 0)) { // Se l'utente non ha preferenze, restituisco gli eventi più popolari
            const popularEvent = yield db_operations_1.default.getPopularEventsId(db);
            for (const e of popularEvent) {
                results.push({ event_id: e, cosSim: 0 }); // cosSim = 0 perché non c'è similarità
            }
            return results.slice(0, n); // Restituisco i primi 10 eventi più popolari
        }
        // 3. Per ogni evento, creare vettore e calcolare similarità coseno
        for (const id of allEventsId) {
            if (!userEvents.has(id)) { // Se l'evento non è già seguito dall'utente
                const eventVector = yield createEventVector(db, id, featureMap);
                const cosSim = ml_distance_1.similarity.cosine(userVector, eventVector);
                //const alpha = 0.6; // peso da assegnare alla cosine similarity
                //const cosSim = alpha * similarity.cosine(userVector, eventVector) + (1 - alpha) * coverageScore(userVector, eventVector);
                if (cosSim > 0) { // Se la similarità è maggiore di 0, aggiungi alla lista dei risultati
                    results.push({ event_id: id, cosSim });
                }
            }
        }
        results.sort((a, b) => b.cosSim - a.cosSim); // Ordina in ordine decrescente
        // 4. Restituire i primi 10 eventi
        return results.slice(0, n); // Restituisce i primi 10 eventi
    });
}
exports.default = { getContentBasedRecommendations };
