// Creare mapping caratteristiche -> indice
import {Database} from 'sqlite3'
import {User, Event} from './models'
import db_op from './db_operations'

async function buildFeatureMaps(db: Database): Promise<{genreMap: Map<string, number>;
                                                        instrumentMap: Map<string, number>;
                                                        artistMap: Map<number, number>; // number è l'ID artista
                                                        n_feature: number;}> {
    //1. Ottenere tutti i generi, strumenti e id artisti
    const genres = await db_op.getAllGenresName(db)
    const instruments = await db_op.getAllInstrumentsName(db)
    const artists = await db_op.getAllArtistsId(db)

    //2. Creare mappa per genere, strumento e artista
    const genreMap = new Map<string, number>()
    let index = 0
    for(const genre of genres){
        genreMap.set(genre, index ++)
    }

    const instrumentMap = new Map<string, number>()
    for(const instrument of instruments){
        instrumentMap.set(instrument, index ++)
    }

    const artistMap = new Map<number, number>()
    for(const artist of artists){
        artistMap.set(artist, index ++)
    }

    console.log(`Mappe caratteristiche create: ${genreMap.size} generi, ${instrumentMap.size} strumenti, ${artistMap.size} artisti`)
    
    return {genreMap, instrumentMap, artistMap, n_feature: index}
}

async function createUserVector(db: Database, user_id: number, genreMap: Map<string, number>, 
                                instrumentMap: Map<string, number>, artistMap: Map<number, number>, 
                                n_feature: number): Promise<number[]>{
    
    // 1. Recuperare generi, strumenti e artisti preferiti
    const userGenres = await db_op.getGenresByUserId(db, user_id)
    const userInstruments = await db_op.getInstrumentsByUserId(db, user_id)
    const userArtists = await db_op.getArtistsByUserId(db, user_id)

    //const interestedEvents ...

    const userFeatures = new Set<string | number>()     // Set per generi (string), strumenti (string) e id artisti (number)
    userGenres.forEach(g => userFeatures.add(g))
    userInstruments.forEach(i => userFeatures.add(i))
    userArtists.forEach(a => userFeatures.add(a))
    
    // 2. Costruire il vettore binario
    const vec = new Array(n_feature).fill(0)
    for(const uf of userFeatures){
        let i: number | undefined           //Indice può essere un numero o indefinito
        if(typeof uf == 'string'){          //Se uf è tipo stringa, può essere un genere o uno strumento
            i = genreMap.get(uf)
            if(i == undefined){             //Se i è undefined, uf è uno strumento
                i = instrumentMap.get(uf)
            }
        }
        else{
            i = artistMap.get(uf)           //Se uf non è tipo stringa, è un artista
        }
        if(i != undefined){
            vec[i] = 1
        }else{
            console.error(`Caratteristica ${uf} non trovata`)       //Se i è undefined, uf non trovata nelle mappe
        }

    }
    return vec
}

export default {buildFeatureMaps, createUserVector}