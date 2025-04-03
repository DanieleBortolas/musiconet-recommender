// Classi User ed Event

//Classe User
export class User {
    constructor(
        private id: number, 
        public name: string, 
        public surname: string, 
        public age: number, 
        public city: string, 
        public genres: string[], 
        public instrument: string, 
        public artists: string[]
    ){}

    // Metodo per aggiungere un nuovo genere
    addGenre(genres: string): void{
        this.genres.push(genres)
    }

    // Metodo per aggiungere un nuovo strumento
    addInstrument(instrument: string): void{
        this.instrument = instrument
    }

    // Metodo per aggiungere un nuovo artista
    addArtist(artists: string): void{
        this.artists.push(artists)
    }

    // Metodo per stampare le info dell'utente
    printInfo(): void{
        console.log(`Nome: ${this.name}, Cognome: ${this.surname}, Età: ${this.age}, Città: ${this.city}, Genere: ${this.genres.join(', ')}, Strumento: ${this.instrument}, Artista seguito: ${this.artists.join(', ')}`)
    }
}

//Classe Event
export class Event{
    constructor(
        private id: number,
        public name: string,
        public genres: string[],
        public instrument: string[],
        public artists: string[],
        public location: string,
        public date: Date,
        public description: string,     
    ){}

    // Metodo per aggiungere un nuovo genere
    addGenre(genres: string): void{
        this.genres.push(genres)
    }

    // Metodo per aggiungere un nuovo strumento
    addInstrument(instrument: string): void{
        this.instrument.push(instrument)
    }

    // Metodo per aggiungere un nuovo artista
    addArtist(artists: string): void{
        this.artists.push(artists)
    }

    // Metodo per stampare le info dell'evento
    printInfo(): void{
        console.log(`Nome: ${this.name}, Genere: ${this.genres.join(', ')}, Strumenti: ${this.instrument.join(', ')}, Artista: ${this.artists.join(', ')}, Luogo: ${this.location}, Data: ${this.date}, Descrizione: ${this.description}`)
    }
}