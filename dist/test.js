"use strict";
/*  File di test
    Sono stati selezionati degli utenti specifici:
    - id: 34 (standard)
    - id: 30 (standard)
    - id: 52 (cold start)
    - id: 4 (sparso)
    - id: 33 (sparso)
    - id: 14 (nicchia)
    - id: 27 (nicchia)
    - id: 18 (eclettico)
    - id: 26 (eclettico)
    
    File ritorna i primi 5 eventi suggeriti da cf, cb e hybrid
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
const content_based_1 = __importDefault(require("./content_based"));
const collaborative_filtering_1 = __importDefault(require("./collaborative_filtering"));
const hybrid_recommender_1 = __importDefault(require("./hybrid_recommender"));
const db_operations_1 = __importDefault(require("./db_operations"));
// Costanti
const nEvents = 5; // Numero eventi da consigliare
const kNeighbors = 20; // Numero di vicini da considerare per cf e hybrid
const alpha = 0.05; // Peso di cb per il risultato finale in hybrid (il peso di cf è 1-alpha)
function runTestForUser(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Raccomandazioni per l'utente ${user_id}`);
        // Stampa delle raccomandazioni da cb
        console.log(`Content based: `);
        const cbResults = yield content_based_1.default.getContentBasedRecommendations(db, user_id, nEvents);
        console.log(cbResults);
        // Stampa delle raccomandazioni da cf
        console.log(`Collaborative filtering: `);
        const cfResults = yield collaborative_filtering_1.default.getCollaborativeFilteringRecommendations(db, user_id, nEvents, kNeighbors);
        console.log(cfResults);
        // Stampa delle raccomandazioni di hybrid
        console.log(`Hybrid: `);
        const hybridResults = yield hybrid_recommender_1.default.getHybridRecommendations(db, user_id, nEvents, kNeighbors, alpha);
        console.log(hybridResults);
        console.log("\n----------------------------------------\n");
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield db_operations_1.default.openDatabase();
        yield db_operations_1.default.createTable(db);
        //Conto il numero di utenti nel database
        if (!(yield db_operations_1.default.isDatabasePopulated(db))) {
            //Popolo il database se è vuoto
            yield db_operations_1.default.populate(db);
            console.log('Database popolato con successo');
        }
        // Vettore degli id selezionati
        const idsVector = [34, 30, 52, 4, 33, 14, 27, 18, 26];
        // Applico runTestForUser per ogni id nel vettore
        console.log("\n----------------------------------------\n");
        for (const id of idsVector) {
            yield runTestForUser(db, id);
        }
        // Chiudo il database
        yield db_operations_1.default.closeDatabase(db);
    });
}
test();
