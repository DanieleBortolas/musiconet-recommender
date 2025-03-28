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
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, data_1.createTable)();
        //Controlla se il database è già stato popolato
        const users = yield (0, data_1.getUsers)();
        if (users.length === 0) {
            // Se il db è vuoto, inserisci i dati iniziali
            yield (0, data_1.insertUser)('Daniele', 22, ['metal', 'rock'], 'guitar', ['Metallica', 'ACDC'], 'Feltre');
            yield (0, data_1.insertUser)('Giovanni', 25, ['pop', 'rock'], 'drums', ['Queen', 'Pink Floyd'], 'Belluno');
            console.log('Utenti inseriti correttamente');
        }
        else {
            console.log('Database già popolato');
        }
        // Stampa gli users
        const allUsers = yield (0, data_1.getUsers)();
        console.log('Utenti:', allUsers);
    });
}
main();
