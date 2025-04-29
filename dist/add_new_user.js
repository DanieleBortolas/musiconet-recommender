"use strict";
/*  Logica per aggiungere un nuovo utente al database
    Le informazioni dell'utente vengono lette da un file JSON e inserite nel database SQLite.
    L'utente non può essere già presente nel database siccome l'id viene generato automaticamente in base all'ultimo id presente.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const readline = __importStar(require("node:readline/promises"));
const node_process_1 = require("node:process");
const db_operations_1 = __importDefault(require("./db_operations"));
const models_1 = require("./models");
/**
 * @summary Chiedere all'utente di inserire un numero
 * @param rl - Interfaccia di lettura per l'input dell'utente
 * @param question - Domanda da porre all'utente
 * @returns - Numero inserito dall'utente
 */
function numericQuestion(rl, question) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const input = yield rl.question(question); // Chiedere all'utente di inserire un numero
            const data = parseInt(input); // Convertire la risposta in un numero
            if (!isNaN(data)) { // Se non è un numero, chiedere di nuovo
                return data;
            }
            console.log("Inserire un numero valido");
        }
    });
}
/**
 * @summary Chiedere all'utente di inserire una stringa
 * @param rl - Interfaccia di lettura per l'input dell'utente
 * @param question - Domanda da porre all'utente
 * @returns - Stringa inserita dall'utente
 */
function stringQuestion(rl, question) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const input = yield rl.question(question); // Chiedere all'utente di inserire una stringa
            if (input.length > 0 && isNaN(parseInt(input))) { // Se non è una stringa, chiedere di nuovo
                return input;
            }
            console.log("Inserire una stringa valida");
        }
    });
}
/**
 * @summary Chiedere all'utente di inserire una lista di stringhe
 * @param rl - Interfaccia di lettura per l'input dell'utente
 * @param question - Domanda da porre all'utente
 * @returns - Lista di stringhe inserite dall'utente
 */
function listStringQuestion(rl, question) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const input = yield rl.question(question); // Chiedere all'utente di inserire una lista di stringhe
            const data = input.split(',').map(s => s.trim()); // Convertire la risposta in un array di stringhe
            if (data.length > 0) { // Se non è una lista, chiedere di nuovo
                return data;
            }
            console.log("Inserire una lista valida");
        }
    });
}
/**
 * @summary Aggiungere un nuovo utente al database prendendo i dati dall'input dell'utente
 * @param - Void
 * @returns - Void
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Creare un'interfaccia di lettura per l'input dell'utente
        const rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout }); // Creare un'interfaccia di lettura per l'input dell'utente
        console.log("------ Inserimento nuovo utente ------\n");
        const userData = new models_1.User(0, "", "", 0, "", [], "", []); // Creare un oggetto vuoto per i dati dell'utente
        let events = []; // Creare un array vuoto per gli eventi seguiti dall'utente
        // 2. Chiedere all'utente di inserire i dati
        try {
            userData.name = yield stringQuestion(rl, "Nome: "); // Chiedere all'utente di inserire il nome
            userData.surname = yield stringQuestion(rl, "Cognome: "); // Chiedere all'utente di inserire il cognome
            userData.age = yield numericQuestion(rl, "Età: "); // Chiedere all'utente di inserire l'età
            userData.city = yield stringQuestion(rl, "Città: "); // Chiedere all'utente di inserire la città
            userData.genres = yield listStringQuestion(rl, "Generi (separati da virgola): "); // Chiedere all'utente di inserire i generi
            userData.instrument = yield stringQuestion(rl, "Strumento: "); // Chiedere all'utente di inserire lo strumento
            userData.artists = yield listStringQuestion(rl, "Artisti seguiti (separati da virgola): "); // Chiedere all'utente di inserire gli artisti seguiti
            events = yield listStringQuestion(rl, "Eventi seguiti (separati da virgola): "); // Chiedere all'utente di inserire gli eventi seguiti
        }
        catch (_a) {
            console.error("Errore durante l'inserimento dei dati dell'utente");
            rl.close();
            return;
        }
        finally {
            rl.close();
        }
        // 3. Inserire i dati dell'utente nel database
        let db = null;
        try {
            db = yield db_operations_1.default.openDatabase(); // Aprire il database SQLite
            yield db_operations_1.default.createTable(db); // Creare le tabelle se non esistono già
            yield db_operations_1.default.populateIfEmpty(db); // Popolare il database se è vuoto
            const id = (yield db_operations_1.default.getLastId(db, "user")) + 1; // Ottenere l'ID dell'utente
            userData.id = id; // Assegnare l'ID all'utente
            console.log(`\nInserimento utente ${userData.id} nel database...`);
            yield db_operations_1.default.insertNewUser(db, userData, events); // Inserire l'utente nel database
            console.log("\n------ Dati inseriti con successo ------\n"); // Messaggio di successo
        }
        catch (err) {
            console.error("Errore durante l'inserimento dei dati dell'utente\n", err);
        }
        finally {
            if (db) {
                yield db_operations_1.default.closeDatabase(db); // Chiudere il database
            }
        }
    });
}
main();
