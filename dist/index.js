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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = db_operations_1.default.openDatabase();
        yield db_operations_1.default.createTable(db);
        //Conto il numero di utenti nel database
        const result = yield db_operations_1.default.executeQuery(db, 'SELECT COUNT(*) as count FROM users');
        if (result[0].count == 0) {
            //Popolo il database se è vuoto
            yield db_operations_1.default.populate(db);
            console.log('Database popolato con successo');
        }
        const users = yield db_operations_1.default.getUsers(db);
        console.log('Utenti:', users);
        yield db_operations_1.default.closedDatabase(db);
    });
}
main();
