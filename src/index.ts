/*
    Questo file è il punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
    Per compilare il file, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`
*/

import db_op from './db_operations'
import {User, Event} from './models.js'

async function main(){
    const db = db_op.openDatabase()
    
    await db_op.createTable(db)
    //await db_op.populate(db)

    const users = await db_op.getUsers(db)
    users.forEach(user => {user.printInfo()})

    const events = await db_op.getEvents(db)
    events.forEach(event => {event.printInfo()})

   // const result = await db_op.executeQuery(db, `SELECT a.name FROM artist a JOIN user_artist ua ON a.id = ua.artist_id WHERE ua.user_id = 2`)
    //console.log(result)

    //const events = await db_op.getEvents(db)
    //console.log(events)
    /*
    const userEvents = await db_op.executeQuery(db, "SELECT COUNT(*) as count FROM user_event")
    console.log(userEvents[0].count)

    const genre = await db_op.executeQuery(db, "SELECT COUNT(*) as count FROM event_genre")
    console.log(genre[0].count)

    const instrument = await db_op.executeQuery(db, "SELECT COUNT(*) as count FROM event_instrument")
    console.log(instrument[0].count)

    const artist = await db_op.executeQuery(db, "SELECT COUNT(*) as count FROM event_artist")
    console.log(artist[0].count)
    
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
    await db_op.closedDatabase(db)
}

main()