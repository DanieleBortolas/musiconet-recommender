# Algoritmo di Raccomandazione Musiconet

Questo progetto implementa un algoritmo di raccomandazione per l'applicazione Musiconet, focalizzato sulla suggerire eventi musicali agli utenti. L'algoritmo combina diverse metodologie per fornire raccomandazioni personalizzate.

## Scopo

L'algoritmo di raccomandazione è una componente fondamentale dell'applicazione Musiconet, con l'obiettivo di migliorare l'esperienza dell'utente suggerendo eventi musicali in linea con i loro interessi e comportamenti passati. Questo aiuta gli utenti a scoprire nuovi eventi e aumenta l'engagement con la piattaforma.

## Tecnologie e Dipendenze

Il progetto è sviluppato in **TypeScript** e utilizza **Node.js** per l'esecuzione. Le dipendenze principali includono:

- **sqlite3**: Per la gestione del database SQLite.
- **ml-distance**: Per il calcolo della similarità coseno nel content-based filtering.

Le dipendenze complete sono elencate nel file `package.json`.

## Metodologie di Raccomandazione

L'algoritmo di raccomandazione implementa un approccio ibrido che combina due metodologie principali:

1.  **Content-Based Filtering**: Questo approccio raccomanda eventi simili a quelli che l'utente ha apprezzato in passato. Si basa sulla creazione di vettori di caratteristiche per utenti ed eventi (generi, strumenti, artisti) e sul calcolo della similarità coseno tra di essi. Viene gestito il problema del "cold start" per i nuovi utenti suggerendo gli eventi più popolari.
2.  **Collaborative Filtering**: Questa metodologia suggerisce eventi che sono piaciuti a utenti con gusti simili. Viene calcolata la similarità tra gli utenti (utilizzando la similarità di Jaccard sugli eventi seguiti) e vengono raccomandati gli eventi seguiti dai vicini più simili che l'utente target non ha ancora visto.
3.  **Approccio Ibrido**: Le raccomandazioni finali sono generate combinando i punteggi ottenuti dal content-based filtering e dal collaborative filtering. Il peso di ciascun approccio nel punteggio finale è determinato dal parametro `alpha`.

## Struttura dei Dati

I dati utilizzati dall'algoritmo sono memorizzati in un database SQLite chiamato `musiconet.db`. Questo database viene popolato inizialmente utilizzando i file JSON presenti nella directory `data/`.

I file JSON e le relative tabelle nel database sono:

-   `data/user.json` -> Tabella `user`: Contiene le informazioni sugli utenti (id, nome, cognome, età, città).
-   `data/event.json` -> Tabella `event`: Contiene le informazioni sugli eventi (id, nome, luogo, data, descrizione).
-   `data/genre.json` -> Tabella `genre`: Contiene i nomi dei generi musicali.
-   `data/instrument.json` -> Tabella `instrument`: Contiene i nomi degli strumenti musicali.
-   `data/artist.json` -> Tabella `artist`: Contiene le informazioni sugli artisti (id, nome).
-   `data/user_event.json` -> Tabella `user_event`: Relazione molti-a-molti tra utenti ed eventi seguiti.
-   `data/user_genre.json` -> Tabella `user_genre`: Relazione molti-a-molti tra utenti e generi preferiti.
-   `data/user_instrument.json` -> Tabella `user_instrument`: Relazione molti-a-molti tra utenti e strumenti suonati.
-   `data/user_artist.json` -> Tabella `user_artist`: Relazione molti-a-molti tra utenti e artisti seguiti.
-   `data/event_genre.json` -> Tabella `event_genre`: Relazione molti-a-molti tra eventi e generi.
-   `data/event_instrument.json` -> Tabella `event_instrument`: Relazione molti-a-molti tra eventi e strumenti.
-   `data/event_artist.json` -> Tabella `event_artist`: Relazione molti-a-molti tra eventi e artisti.

## Setup e Configurazione

Per installare e configurare il progetto, seguire i seguenti passaggi:

1.  **Clonare il repository**:
    ```bash
    git clone <URL_REPOSITORY>
    cd musiconet-recommender
    ```
    (Sostituire `<URL_REPOSITORY>` con l'URL effettivo del repository)

2.  **Installare le dipendenze**:
    ```bash
    npm install
    ```

3.  **Compilare il progetto TypeScript**:
    ```bash
    tsc
    ```
    Questo genererà i file JavaScript compilati nella directory `dist/`.

## Esecuzione

L'algoritmo può essere eseguito in due modalità principali tramite riga di comando:

1.  **Eseguire il test su un vettore di ID predefiniti**:
    ```bash
    node dist/index.js --test
    ```
    È possibile specificare parametri aggiuntivi:
    ```bash
    node dist/index.js --test --k <k> --n <n> --alpha <alpha> --detailsUser --detailsEvents
    ```

2.  **Generare raccomandazioni per un utente specifico**:
    ```bash
    node dist/index.js --user <user_id>
    ```
    È possibile specificare parametri aggiuntivi:
    ```bash
    node dist/index.js --user <user_id> --alpha <alpha> --k <k> --n <n> --detailsUser --detailsEvents
    ```

**Parametri da riga di comando:**

-   `--test`: Esegue il test su un vettore di ID utente predefiniti.
-   `--user <user_id>`: Specifica l'ID dell'utente per cui generare le raccomandazioni.
-   `--alpha <alpha>`: Peso per il content-based filtering nell'approccio ibrido (default: 0.5). Accetta valori float tra 0 e 1.
-   `--k <k>`: Numero di vicini da considerare per il collaborative filtering (default: 20). Accetta valori interi positivi.
-   `--n <n>`: Numero di eventi da consigliare (default: 5). Accetta valori interi positivi.
-   `--detailsUser`: Mostra i dettagli dell'utente per cui vengono generate le raccomandazioni.
-   `--detailsEvents`: Mostra i dettagli degli eventi raccomandati.
-   `--help`: Mostra un messaggio di aiuto con le opzioni disponibili.

## Struttura delle Directory e dei File

-   `data/`: Contiene i file JSON utilizzati per popolare il database.
-   `src/`: Contiene il codice sorgente TypeScript.
    -   `index.ts`: Punto di ingresso dell'applicazione, gestisce l'esecuzione e l'analisi degli argomenti.
    -   `content_based.ts`: Implementa la logica del content-based filtering.
    -   `collaborative_filtering.ts`: Implementa la logica del collaborative filtering.
    -   `hybrid_recommender.ts`: Combina i risultati dei due approcci per le raccomandazioni ibride.
    -   `db_operations.ts`: Contiene le funzioni per interagire con il database SQLite.
    -   `models.ts`: Definisce le classi e le interfacce per gli utenti, gli eventi e le raccomandazioni.
    -   `constants.ts`: Contiene le costanti utilizzate nel progetto (percorsi file, parametri di default).
    -   `add_new_user.ts`: Contiene la logica per l'aggiunta di un nuovo utente.
-   `musiconet.db`: Il database SQLite (generato dopo la prima esecuzione).
-   `package.json`: Definisce le dipendenze del progetto e gli script.
-   `package-lock.json`: Blocca le versioni delle dipendenze.
-   `tsconfig.json`: File di configurazione per il compilatore TypeScript.
-   `README.md`: Questo file di documentazione.
