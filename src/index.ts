/*  Punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
    Per compilare il file, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`
    Oppure eseguire il file ./start.bat
*/

import {Database} from 'sqlite3'
import dbOp from './db_operations'
import hybrid from './hybrid_recommender.js'
//import cb from './content_based.js'
//import cf from './collaborative_filtering.js'
//import {User, Event} from './models.js'

// Stampare tutte le raccomandazioni per ogni utente
async function printAllUsersAllRecommendations(db: Database){
    for(let id = 0; id<53; id++){
        console.log(`Utente ${id}`)
        const results = await hybrid.getHybridRecommendations(db, id)
        console.log(results)
    }
}

// Stampare tutte le raccomandazioni per l'utente con id = user_id
async function printUserAllRecommendations(db: Database, user_id: number){
    const results = await hybrid.getHybridRecommendations(db, user_id)
    console.log(`Raccomandazioni per l'utente ${user_id}\n`, results)
}

// Funzione principale
async function main(){
    const db = await dbOp.openDatabase()
    await dbOp.createTable(db)
    
    //Conto il numero di utenti nel database
    if(!(await dbOp.isDatabasePopulated(db))){
        //Popolo il database se è vuoto
        await dbOp.populate(db)
        console.log('Database popolato con successo')
    }
    

    const user_id = 9
    await printUserAllRecommendations(db, user_id)

    await dbOp.closeDatabase(db)
}

main()