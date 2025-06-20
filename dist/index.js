"use strict";
/*  Punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query
    per ottenere le raccomandazioni per un utente specifico o per eseguire il test su un vettore di id.
    Viene anche gestita l'analisi degli argomenti passati da riga di comando.
    
    Per compilare il progetto, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`

    Per eseguire il file con gli argomenti da riga di comando, eseguire il comando
        `node dist/index.js --user <user_id> --alpha <alpha> --k <k> --n <n> --detailsUser --detailsEvents`
    
    Per eseguire il test, eseguire il comando
        `node dist/index.js --test`
    oppure
        `node dist/index.js --test --k <k> --n <n> --alpha <alpha> --detailsUser --detailsEvents`
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
    // 1. Controllare se sono stati passati argomenti da riga di comando
    const args = {};
    if (argv.length < 3) {
        throw new Error(`Nessun argomento passato`);
    }
    // 2. Controllare se sono stati passati argomenti validi e analizzarli
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        const value = argv[i + 1];
        switch (arg) {
            // Argomento per eseguire il test
            case '--test':
                args.test = true;
                break;
            // Argomento per specificare l'ID dell'utente
            case '--user':
                const user_id = parseInt(value);
                if (!isNaN(user_id)) {
                    args.user_id = user_id;
                    i++;
                }
                else {
                    throw new Error(`Valore non valido per --user: ${value}`);
                }
                break;
            // Argomento per specificare il peso di cb nell'approccio ibrido
            case '--alpha':
                const alpha = parseFloat(value);
                if (!isNaN(alpha)) {
                    args.alpha = alpha;
                    i++;
                }
                else {
                    throw new Error(`Valore non valido per --alpha: ${value}`);
                }
                break;
            // Argomento per specificare il numero di vicini da considerare per cf e hybrid
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
            // Argomento per specificare il numero di eventi da consigliare
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
            // Argomento per mostrare i dettagli dell'utente
            case '--detailsUser':
                args.showDetailsUser = true;
                break;
            // Argomento per mostrare i dettagli degli eventi raccomandati
            case '--detailsEvents':
                args.showDetailsEvents = true;
                break;
            // Argomento per mostrare l'aiuto
            case '--help':
                console.log(`\n----------------- Aiuto -----------------`);
                console.log(`--test: Esegui il test su un vettore di id predefiniti`);
                console.log(`--user <user_id>: ID dell'utente per cui generare le raccomandazioni`);
                console.log(`--alpha <alpha>: Peso per il content-based filtering nell'approccio ibrido (default: ${ALPHA})`);
                console.log(`--k <k>: Numero di vicini da considerare per il collaborative filtering (default: ${K_NEIGHBORS})`);
                console.log(`--n <n>: Numero di eventi da consigliare (default: ${N_RECOMMENDATIONS})`);
                console.log(`--detailsUser: Mostra i dettagli dell'utente`);
                console.log(`--detailsEvents: Mostra i dettagli degli eventi raccomandati`);
                console.log(`--help: Mostra questo messaggio di aiuto`);
                console.log(`-------------------------------------------\n`);
                process.exit(0); // Esci dopo aver stampato l'aiuto
                break;
            // Argomento non valido
            default:
                throw new Error(`Argomento non valido: ${arg}`);
        }
    }
    // 3. Ritornare gli argomenti analizzati
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
        // 1. Controllare l'esistenza dell'utente e stamparne i dettagli se richiesto
        const user = yield db_operations_1.default.getUserInfo(db, user_id);
        if (user && userDetails)
            user.printInfo();
        // 2. Stampare le raccomandazioni da cb
        console.log(`\nContent based: `);
        const cbResults = yield content_based_js_1.default.getContentBasedRecommendations(db, user_id, nEvents);
        console.log(cbResults);
        // 3. Stampare le raccomandazioni da cf
        console.log(`\nCollaborative filtering: `);
        const cfResults = yield collaborative_filtering_js_1.default.getCollaborativeFilteringRecommendations(db, user_id, nEvents, kNeighbor);
        console.log(cfResults);
        // 4. Stampare le raccomandazioni di hybrid
        console.log(`\nHybrid: `);
        const hybridResults = yield hybrid_recommender_js_1.default.getHybridRecommendations(db, user_id, nEvents, kNeighbor, alpha);
        console.log(hybridResults);
        // 5. Stampare i dettagli degli eventi raccomandati se richiesto
        if (eventsDetails) {
            for (const rec of hybridResults) {
                const event = yield db_operations_1.default.getEventInfo(db, rec.event_id);
                if (event)
                    event.printInfo();
            }
        }
        console.log("\n-------------------------------------------\n");
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
            // 1. Analizzare gli argomenti passati da riga di comando
            const args = parseArguments(process.argv);
            // 2. Inizializzare il database
            const db = yield db_operations_1.default.openDatabase(); // Apro il database
            yield db_operations_1.default.createTable(db); // Creo le tabelle se non esistono
            yield db_operations_1.default.populateIfEmpty(db); // Popolo il database se è vuoto
            // 3. Eseguire il test o le raccomandazioni per un utente specifico
            if (args.test) {
                // Vettore degli id selezionati
                const idsVector = [34, 30, 52, 4, 33, 14, 27, 18, 26];
                // Applico runTestForUser per ogni id nel vettore
                console.log("\n------------- Esecuzione test -------------\n");
                for (const id of idsVector) {
                    console.log(`Raccomandazioni per l'utente ${id}`);
                    yield runTestForUser(db, id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents);
                }
            }
            else if (args.user_id) {
                let esci = false;
                while (esci == false) { // Ciclo per chiedere se si vuole aggiungere un evento all'utente
                    // Se l'utente è specificato, stampo le raccomandazioni per quell'utente
                    console.log(`\n------ Esecuzione alg. per utente ${args.user_id} ------\n`);
                    yield runTestForUser(db, args.user_id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents);
                    // Chiedo se si vuole aggiungere un evento all'utente
                    const rl = require('readline').createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    const answer = yield new Promise((resolve) => {
                        rl.question("Vuoi aggiungere un evento all'utente? (s/n): ", resolve);
                    });
                    if (answer.toLowerCase() == "s") {
                        // Chiedo l'ID dell'evento da aggiungere
                        const eventId = yield new Promise((resolve) => {
                            rl.question("Inserisci l'ID dell'evento da aggiungere: ", resolve);
                        });
                        const eventIdNum = parseInt(eventId);
                        if (!isNaN(eventIdNum)) {
                            // Aggiungo l'evento all'utente
                            yield db_operations_1.default.insertUserEvent(db, args.user_id, eventIdNum);
                            console.log(`Evento ${eventIdNum} aggiunto all'utente ${args.user_id}`);
                        }
                        else {
                            console.error("ID evento non valido");
                            esci = true; // Esci dal ciclo se l'ID non è valido
                        }
                    }
                    else {
                        esci = true; // Esci dal ciclo se l'utente non vuole aggiungere un evento
                    }
                    rl.close();
                } // Continua a chiedere se si vuole aggiungere un evento finché l'utente risponde 's'
            }
            // 4. Chiudere il database
            yield db_operations_1.default.closeDatabase(db); // Chiudo il database
        }
        catch (err) {
            // 5. Gestire gli errori
            console.error("\n------ Errore durante l'esecuzione ------\n", err);
            return;
        }
    });
}
main();
