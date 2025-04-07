"use strict";
// Punto di ingresso dell'applicazione.
// Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
// Per compilare il file, eseguire il comando `tsc`
// Per eseguire il file, eseguire il comando `node dist/index.js`
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
const content_based_js_1 = __importDefault(require("./content_based.js"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield db_operations_1.default.openDatabase();
        yield db_operations_1.default.createTable(db);
        //Conto il numero di utenti nel database
        if (!(yield db_operations_1.default.isDatabasePopulated(db))) {
            //Popolo il database se è vuoto
            yield db_operations_1.default.populate(db);
            console.log('Database popolato con successo');
        }
        const cbResults = yield content_based_js_1.default.getContentBasedRecommendations(db, 52);
        //const events: Event[] = await dbOp.getEventsInfoById(db, cbResults)
        //events.forEach(e => e.printInfo())
        console.log(cbResults);
        yield db_operations_1.default.closeDatabase(db);
    });
}
main();
