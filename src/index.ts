import {createTable, insertUser, insertEvent, getUsers, getEvents, getUserEvents} from './data'

async function main(){
    await createTable();

    //Controlla se il database è già stato popolato
    const users = await getUsers();
    
    if(users.length === 0){
        // Se il db è vuoto, inserisci i dati iniziali
        await insertUser('Daniele', 22, ['metal', 'rock'], 'guitar', ['Metallica', 'ACDC'], 'Feltre')
        await insertUser('Giovanni', 25, ['pop', 'rock'], 'drums', ['Queen', 'Pink Floyd'], 'Belluno')

        console.log('Utenti inseriti correttamente')
    }else{
        console.log('Database già popolato')
    }

    // Stampa gli users
    const allUsers = await getUsers();
    console.log('Utenti:', allUsers)
}

main()