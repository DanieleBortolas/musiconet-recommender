/*
    Questo file è il punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
    Per compilare il file, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`
*/

import db_op from './db_operations'

async function main(){
    const db = db_op.openDatabase()
    await db_op.createTable(db)
    
    //Conto il numero di utenti nel database
    const result = await db_op.executeQuery(db, 'SELECT COUNT(*) as count FROM users')
    if(result[0].count == 0){
        //Popolo il database se è vuoto
        await db_op.populate(db)
        console.log('Database popolato con successo')
    }
    const users = await db_op.getUsers(db)
    console.log('Utenti:', users)
    await db_op.closedDatabase(db)
}

main()