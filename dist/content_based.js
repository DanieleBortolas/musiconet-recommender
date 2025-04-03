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
function buildFeatureMaps(db) {
    return __awaiter(this, void 0, void 0, function* () {
        //1. Ottenere tutti i generi, strumenti e id artisti
        const genres = yield db_operations_1.default.getAllGenresName(db);
        const instruments = yield db_operations_1.default.getAllInstrumentsName(db);
        const artists = yield db_operations_1.default.getAllArtistsId(db);
        //2. Creare mappa per genere, strumento e artista
        const genreMap = new Map();
        let index = 0;
        for (const genre of genres) {
            genreMap.set(genre, index++);
        }
        const instrumentMap = new Map();
        for (const instrument of instruments) {
            instrumentMap.set(instrument, index++);
        }
        const artistMap = new Map();
        for (const artist of artists) {
            artistMap.set(artist, index++);
        }
        //console.log(`Mappe caratteristiche create: ${genreMap.size} generi, ${instrumentMap.size} strumenti, ${artistMap.size} artisti`)
        console.log(genreMap);
        console.log(instrumentMap);
        console.log(artistMap);
        return { genreMap, instrumentMap, artistMap, n_feature: index };
    });
}
function createUserVector(db, user_id, genreMap, instrumentMap, artistMap, n_feature) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Recuperare generi, strumenti e artisti preferiti
        const userGenres = yield db_operations_1.default.getGenresByUserId(db, user_id);
        const userInstruments = yield db_operations_1.default.getInstrumentsByUserId(db, user_id);
        const userArtists = yield db_operations_1.default.getArtistsByUserId(db, user_id);
        //const interestedEvents ...
        const userFeatures = new Set(); // Set per generi (string), strumenti (string) e id artisti (number)
        userGenres.forEach(g => userFeatures.add(g));
        userInstruments.forEach(i => userFeatures.add(i));
        userArtists.forEach(a => userFeatures.add(a));
        console.log(userFeatures);
        // 2. Costruire il vettore binario
        const vec = new Array(n_feature).fill(0);
        for (const uf of userFeatures) {
            let i; //Indice può essere un numero o indefinito
            if (typeof uf == 'string') { //Se uf è tipo stringa, può essere un genere o uno strumento
                i = genreMap.get(uf);
                if (i == undefined) { //Se i è undefined, uf è uno strumento
                    i = instrumentMap.get(uf);
                }
            }
            else {
                i = artistMap.get(uf); //Se uf non è tipo stringa, è un artista
            }
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
exports.default = { buildFeatureMaps, createUserVector };
