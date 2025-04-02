"use strict";
/*
    Questo file è il punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
    Per compilare il file, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = db_operations_1.default.openDatabase();
        yield db_operations_1.default.createTable(db);
        yield db_operations_1.default.populate(db);
        //const events = await db_op.getEvents(db)
        //console.log(events)
        const userEvents = yield db_operations_1.default.executeQuery(db, "SELECT COUNT(*) as count FROM user_event");
        console.log(userEvents[0].count);
        const genre = yield db_operations_1.default.executeQuery(db, "SELECT COUNT(*) as count FROM event_genre");
        console.log(genre[0].count);
        const instrument = yield db_operations_1.default.executeQuery(db, "SELECT COUNT(*) as count FROM event_instrument");
        console.log(instrument[0].count);
        const artist = yield db_operations_1.default.executeQuery(db, "SELECT COUNT(*) as count FROM event_artist");
        console.log(artist[0].count);
        /*
        //Conto il numero di utenti nel database
        const result = await db_op.executeQuery(db, 'SELECT COUNT(*) as count FROM users')
        if(result[0].count == 0){
            //Popolo il database se è vuoto
            await db_op.populate(db)
            console.log('Database popolato con successo')
        }
        const users = await db_op.getUsers(db)
        console.log('Utenti:', users)
        */
        yield db_operations_1.default.closedDatabase(db);
    });
}
main();
