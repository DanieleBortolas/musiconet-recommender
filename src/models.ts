/*  Modelli per gli algoritmi e i dati del db
    Classi e interfacce per la gestione degli utenti, degli eventi e delle raccomandazioni
*/ 

//Classe User
export class User {
    constructor(
        public id: number, 
        public name: string, 
        public surname: string, 
        public age: number, 
        public city: string, 
        public genres: string[], 
        public instrument: string, 
        public artists: string[]
    ){}

    // Metodo per stampare le info dell'utente
    printInfo(): void{
        console.log(`\nNome: ${this.name} \nCognome: ${this.surname} \nEtà: ${this.age} \nCittà: ${this.city} \nGenere: ${this.genres.join(', ')} \nStrumento: ${this.instrument} \nArtista seguito: ${this.artists.join(', ')}`)
    }
}

//Classe Event
export class Event{
    constructor(
        public id: number,
        public name: string,
        public genres: string[],
        public instrument: string[],
        public artists: string[],
        public location: string,
        public date: Date,
        public description: string,     
    ){}

    // Metodo per stampare le info dell'evento
    printInfo(): void{
        console.log(`\nNome: ${this.name} \nGenere: ${this.genres.join(', ')} \nStrumenti: ${this.instrument.join(', ')} \nArtista: ${this.artists.join(', ')} \nLuogo: ${this.location} \nData: ${this.date} \nDescrizione: ${this.description}`)
    }
}

// Interfaccia per la similarità degli utenti
export interface UserSimilarity{
    user_id: number
    similarity: number
}

// Interfaccia per le raccomandazioni
export interface Recommendation{
    event_id: number
    score: number
    normScore?: number  // Punteggio normalizzato (opzionale) utilizzato per l'ibrido
}
