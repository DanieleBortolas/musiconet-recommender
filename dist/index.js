"use strict";
/*  Punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
    Per compilare il file, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`
    Oppure eseguire il file ./start.bat
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
const hybrid_recommender_js_1 = __importDefault(require("./hybrid_recommender.js"));
const content_based_js_1 = __importDefault(require("./content_based.js"));
const collaborative_filtering_js_1 = __importDefault(require("./collaborative_filtering.js"));
// Costanti
const N_RECOMMENDATIONS = 5; // Numero eventi da consigliare
const K_NEIGHBORS = 20; // Numero di vicini da considerare per cf e hybrid
const ALPHA = 0.5; // Peso di cb per il risultato finale in hybrid (il peso di cf è 1-alpha)
/**
 * @summary Analizzare gli argomenti passati da riga di comando
 * @param argv - Array di stringhe contenente gli argomenti passati da riga di comando
 * @return - Oggetto Arguments contenente gli argomenti analizzati
 */
function parseArguments(argv) {
    const args = {};
    // Controllo se sono stati passati argomenti da riga di comando
    if (argv.length < 3) {
        throw new Error(`Nessun argomento passato`);
    }
    // Controllo se sono stati passati argomenti validi
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        const value = argv[i + 1];
        switch (arg) {
            case '--user':
                const user_id = parseInt(value);
                if (!isNaN(user_id)) {
                    args.user_id = user_id;
                    i++;
                }
                else {
                    //console.log(`Valore non valido per --user: ${value}`)
                    throw new Error(`Valore non valido per --user: ${value}`);
                }
                break;
            case '--test':
                args.test = true;
                break;
            case '--alpha':
                const alpha = parseFloat(value);
                if (!isNaN(alpha)) {
                    args.alpha = alpha;
                    i++;
                }
                else {
                    //console.log(`Valore non valido per --alpha: ${value}`)
                    throw new Error(`Valore non valido per --alpha: ${value}`);
                }
                break;
            case '--k':
                const k = parseInt(value);
                if (!isNaN(k)) {
                    args.k = k;
                    i++;
                }
                else {
                    //console.log(`Valore non valido per --k: ${value}`)
                    throw new Error(`Valore non valido per --k: ${value}`);
                }
                break;
            case '--n':
                const n = parseInt(value);
                if (!isNaN(n)) {
                    args.n = n;
                    i++;
                }
                else {
                    throw new Error(`Valore non valido per --n: ${value}`);
                }
                break;
            case '--detailsUser':
                args.showDetailsUser = true;
                break;
            case '--detailsEvents':
                args.showDetailsEvents = true;
                break;
            default:
                throw new Error(`Argomento non valido: ${arg}`);
        }
    }
    return args;
}
/**
 * @summary Eseguire l'algoritmo di raccomandazione per un utente specifico
 * @param db - Database SQLite
 * @param user_id - ID dell'utente
 * @param nEvents - Numero di eventi da consigliare (default: N_RECOMMENDATIONS)
 * @param kNeighbor - Numero di vicini da considerare (default: K_NEIGHBORS)
 * @param alpha - Peso per il content-based filtering (default: ALPHA)
 * @param userDetails - Mostra i dettagli dell'utente (default: false)
 * @param eventsDetails - Mostra i dettagli degli eventi raccomandati (default: false)
 * @return - Void
 */
function runTestForUser(db_1, user_id_1) {
    return __awaiter(this, arguments, void 0, function* (db, user_id, nEvents = N_RECOMMENDATIONS, kNeighbor = K_NEIGHBORS, alpha = ALPHA, userDetails = false, eventsDetails = false) {
        console.log(`Raccomandazioni per l'utente ${user_id}`);
        // Stampare i dettagli dell'utente
        if (userDetails) {
            const user = yield db_operations_1.default.getUserInfo(db, user_id);
            if (user) {
                user.printInfo();
            }
            else {
                console.log(`Utente con id ${user_id} non trovato`);
            }
        }
        // Stampare le raccomandazioni da cb
        console.log(`\nContent based: `);
        const cbResults = yield content_based_js_1.default.getContentBasedRecommendations(db, user_id, nEvents);
        console.log(cbResults);
        // Stampare le raccomandazioni da cf
        console.log(`\nCollaborative filtering: `);
        const cfResults = yield collaborative_filtering_js_1.default.getCollaborativeFilteringRecommendations(db, user_id, nEvents, kNeighbor);
        console.log(cfResults);
        // Stampare le raccomandazioni di hybrid
        console.log(`\nHybrid: `);
        const hybridResults = yield hybrid_recommender_js_1.default.getHybridRecommendations(db, user_id, nEvents, kNeighbor, alpha);
        console.log(hybridResults);
        // Stampare i dettagli degli eventi raccomandati
        if (eventsDetails) {
            for (const rec of hybridResults) {
                const event = yield db_operations_1.default.getEventInfo(db, rec.event_id);
                if (event) {
                    event.printInfo();
                }
                else {
                    console.log(`Evento con id ${rec.event_id} non trovato`);
                }
            }
        }
        console.log("\n----------------------------------------\n");
    });
}
/**
 * @summary Funzione principale per l'esecuzione del programma
 * @param - Void
 * @return - Void
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Analisi degli argomenti passati da riga di comando
            const args = parseArguments(process.argv);
            // Inizializzazione del database
            const db = yield db_operations_1.default.openDatabase(); // Apro il database
            yield db_operations_1.default.createTable(db); // Creo le tabelle se non esistono
            yield db_operations_1.default.populateIfEmpty(db); // Popolo il database se è vuoto
            if (args.test) {
                // Vettore degli id selezionati
                const idsVector = [34, 30, 52, 4, 33, 14, 27, 18, 26];
                // Applico runTestForUser per ogni id nel vettore
                console.log("\n----------------------------------------\n");
                for (const id of idsVector) {
                    yield runTestForUser(db, id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents);
                }
            }
            else if (args.user_id) {
                // Se l'utente è specificato, stampo le raccomandazioni per quell'utente
                yield runTestForUser(db, args.user_id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents);
            }
            yield db_operations_1.default.closeDatabase(db); // Chiudo il database
        }
        catch (err) {
            // Gestione degli errori
            console.error("\n--- Errore durante l'esecuzione ---\n", err);
            return;
        }
    });
}
main();
