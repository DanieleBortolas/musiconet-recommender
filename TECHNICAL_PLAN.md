# Dettaglio Tecnico del Piano di Implementazione MusicoNet MVP

Questo documento fornisce un dettaglio tecnico del piano d'azione definito in `PLAN.md` per la realizzazione di un'applicazione di test MusicoNet (Minimum Viable Product per la tesi) che serva anche da base per l'applicazione completa e scalabile.

L'approccio è modulare e agile, suddividendo il lavoro in task semplici e testabili singolarmente per consentire un progresso iterativo e una facile verifica dei risultati.

## 1. Creazione del Livello API (Backend)

Questo blocco di task si concentra sull'esposizione della logica di raccomandazione esistente tramite un'interfaccia HTTP.

### Task 1.1: Inizializzazione Progetto Backend API

*   **Obiettivo:** Creare la struttura base del progetto Node.js che ospiterà il server API.
*   **Come fare:**
    1.  Aprire il terminale nella directory principale del progetto `musiconet-recommender`.
    2.  Inizializzare un nuovo progetto Node.js eseguendo `npm init -y`. Questo creerà il file `package.json`.
    3.  Installare le dipendenze necessarie: un framework web leggero (es. Express o Fastify), TypeScript e le dipendenze già usate dal motore di raccomandazione (`sqlite3`, `ml-distance`). Eseguire:
        ```bash
        npm install express sqlite3 ml-distance
        npm install --save-dev typescript @types/express @types/sqlite3 @types/ml-distance
        ```
        (Scegliere Express o Fastify in base alla preferenza; l'esempio userà Express).
    4.  Inizializzare la configurazione di TypeScript eseguendo `npx tsc --init`. Modificare `tsconfig.json` per includere i file sorgente del motore di raccomandazione esistente e i nuovi file API (es. assicurarsi che `rootDir` e `outDir` siano configurati correttamente, ad esempio `rootDir: "./src"`, `outDir: "./dist"`).
*   **Test:** Verificare la creazione dei file `package.json`, `package-lock.json`, `tsconfig.json` e della directory `node_modules`.

### Task 1.2: Implementazione Server HTTP Base

*   **Obiettivo:** Creare un server HTTP funzionante capace di rispondere alle richieste.
*   **Come fare:**
    1.  Creare una nuova directory per il codice API, ad esempio `src/api`.
    2.  Creare un file sorgente per il server, ad esempio `src/api/server.ts`.
    3.  Scrivere il codice TypeScript per importare Express e creare un'istanza dell'applicazione.
    4.  Definire una rotta di test semplice, ad esempio `GET /status`, che restituisca una risposta JSON fissa (es. `{ status: 'API is running' }`).
    5.  Configurare il server per ascoltare su una porta specifica (es. 3000).
    6.  Aggiungere uno script di avvio in `package.json` per compilare il codice TypeScript e avviare il server compilato (es. `"start": "tsc && node dist/api/server.js"`).
*   **Test:** Eseguire `npm start`. Aprire un browser o utilizzare `curl` (`curl http://localhost:3000/status`) per verificare che il server risponda con il messaggio di stato atteso.

### Task 1.3: Integrazione Logica Raccomandazione e DB

*   **Obiettivo:** Connettere il server API con le funzioni del motore di raccomandazione e gestire l'accesso al database.
*   **Come fare:**
    1.  Nel file `src/api/server.ts`, importare le funzioni necessarie dai moduli del motore di raccomandazione (`../db_operations.ts`, `../hybrid_recommender.ts`).
    2.  Implementare la rotta principale per le raccomandazioni, ad esempio `GET /recommendations/:userId`.
    3.  All'interno del gestore di questa rotta:
        *   Estrarre l'ID utente dai parametri della richiesta (`req.params.userId`). Convertirlo in numero e validare che sia un numero valido.
        *   Aprire una connessione al database SQLite utilizzando `dbOp.openDatabase()`.
        *   Chiamare la funzione `hybrid.getHybridRecommendations()` passando la connessione DB, l'ID utente e i parametri desiderati (es. numero di raccomandazioni, numero di vicini, alpha - questi potrebbero anche essere passati come query parameters nell'API per maggiore flessibilità, es. `/recommendations/:userId?n=10&k=20&alpha=0.5`).
        *   Chiudere la connessione al database utilizzando `dbOp.closeDatabase()`. **Nota:** Gestire l'apertura/chiusura del DB per ogni richiesta potrebbe non essere efficiente per un'API ad alto traffico. Per un MVP, è accettabile, ma per la scalabilità futura, considerare un connection pool o un'istanza DB gestita centralmente.
        *   Restituire i risultati delle raccomandazioni come risposta JSON (`res.json(recommendations)`).
    4.  Implementare una gestione base degli errori: se l'ID utente non è valido o se si verifica un errore durante l'accesso al DB o la generazione delle raccomandazioni, restituire una risposta di errore appropriata (es. status 400 per input non valido, status 500 per errori interni) con un messaggio descrittivo.
*   **Test:** Avviare il server API (`npm start`). Utilizzare `curl` o Postman per inviare richieste GET all'endpoint `/recommendations/:userId` con ID utente validi (presenti nel database `musiconet.db`). Verificare che la risposta contenga una lista di raccomandazioni in formato JSON. Testare anche con ID utente non validi per verificare la gestione degli errori.

## 2. Progettazione dell'Interfaccia Utente Minimale (Expo)

Questo blocco si concentra sulla creazione dei componenti visivi di base dell'applicazione mobile.

### Task 2.1: Inizializzazione Progetto Expo

*   **Obiettivo:** Creare la struttura base dell'applicazione mobile Expo.
*   **Come fare:**
    1.  Aprire un nuovo terminale in una directory separata (esterna a `musiconet-recommender`).
    2.  Creare un nuovo progetto Expo utilizzando il template vuoto (blank): `npx create-expo-app musiconet-test-app`.
    3.  Navigare nella directory del nuovo progetto: `cd musiconet-test-app`.
    4.  Avviare il progetto per la prima volta per assicurarsi che tutto sia configurato correttamente: `npm start`. Seguire le istruzioni per aprire l'app in Expo Go sul tuo dispositivo o in un emulatore/simulatore.
*   **Test:** Verificare che l'applicazione Expo si avvii correttamente e mostri la schermata iniziale predefinita ("Open up App.js to start working on your app!").

### Task 2.2: Definizione Schermate Base

*   **Obiettivo:** Creare i componenti React Native per l'input dell'utente e la visualizzazione delle raccomandazioni.
*   **Come fare:**
    1.  Aprire il progetto `musiconet-test-app` nel tuo editor di codice.
    2.  Modificare il file principale dell'app (solitamente `App.tsx` o `App.js`) o creare nuovi file per i componenti delle schermate (es. `src/screens/InputScreen.tsx`, `src/components/RecommendationList.tsx`).
    3.  Nella schermata principale o in un componente dedicato all'input:
        *   Aggiungere un componente `TextInput` per permettere all'utente di inserire l'ID utente.
        *   Aggiungere un componente `Button` con un testo come "Mostra Raccomandazioni".
    4.  Creare un componente o una sezione nella schermata principale per visualizzare i risultati. Inizialmente, potrebbe essere un semplice `Text` che dice "Raccomandazioni qui" o un componente `FlatList` vuoto.
*   **Test:** Eseguire l'app Expo (`npm start`). Verificare che i componenti `TextInput` e `Button` siano visibili sullo schermo e che ci sia uno spazio riservato alla visualizzazione dei risultati.

## 3. Implementazione dell'Applicazione Frontend (Expo)

Questo blocco si concentra sulla logica di comunicazione tra il frontend Expo e il backend API.

### Task 3.1: Implementazione Chiamata API

*   **Obiettivo:** Aggiungere la logica per inviare l'ID utente all'API backend e ricevere le raccomandazioni.
*   **Come fare:**
    1.  Nel file della schermata di input, definire una funzione asincrona che verrà chiamata quando l'utente preme il bottone "Mostra Raccomandazioni".
    2.  All'interno di questa funzione:
        *   Recuperare il valore inserito nel `TextInput` (l'ID utente).
        *   Utilizzare la funzione `fetch` di JavaScript (o installare e usare una libreria come `axios` - `npx expo install axios`) per effettuare una richiesta GET all'URL dell'API backend (es. `http://<indirizzo-ip-locale-o-url-pubblico>:3000/recommendations/${userId}`). **Nota:** Quando si testa su dispositivi reali o emulatori, `localhost` nel frontend si riferisce al dispositivo/emulatore stesso, non al computer host. Sarà necessario usare l'indirizzo IP locale del computer host o uno strumento come ngrok (vedi Task 5.1).
        *   Attendere la risposta (`await fetch(...)`).
        *   Parsare la risposta JSON (`await response.json()`).
        *   Gestire potenziali errori nella risposta HTTP (es. `response.ok` è false).
        *   Aggiornare lo stato del componente React Native per memorizzare i dati delle raccomandazioni ricevute.
        *   Implementare un semplice indicatore di caricamento (es. uno stato booleano `isLoading` e un componente `ActivityIndicator`) da mostrare mentre si attende la risposta API.
        *   Implementare la visualizzazione di messaggi di errore se la chiamata API fallisce.
*   **Test:** Assicurarsi che il server API backend sia in esecuzione. Eseguire l'app Expo (`npm start`). Inserire un ID utente valido nel `TextInput` e premere il bottone. Verificare nel terminale di Expo che la chiamata API venga effettuata e che i dati vengano ricevuti e stampati nella console (per ora). Verificare che l'indicatore di caricamento appaia e scompaia.

### Task 3.2: Visualizzazione Raccomandazioni

*   **Obiettivo:** Mostrare le raccomandazioni ricevute dall'API nell'interfaccia utente.
*   **Come fare:**
    1.  Nel componente o nella sezione dedicata alla visualizzazione dei risultati, utilizzare lo stato che contiene le raccomandazioni ricevute.
    2.  Configurare il componente `FlatList` per renderizzare ogni elemento della lista di raccomandazioni. Per ogni elemento (una raccomandazione), mostrare almeno l'ID dell'evento e il punteggio di raccomandazione (es. utilizzando un componente `Text`).
    3.  Aggiungere un testo o un messaggio da mostrare se la lista delle raccomandazioni è vuota.
*   **Test:** Eseguire il flusso completo (avviare backend, avviare frontend, inserire ID utente, premere bottone). Verificare che la lista di raccomandazioni appaia correttamente sullo schermo dell'app Expo, mostrando gli ID degli eventi e i punteggi.

## 4. Integrazione e Test Locale Completo

Questo blocco verifica che l'intero flusso funzioni correttamente nell'ambiente di sviluppo locale.

### Task 4.1: Esecuzione Combinata e Test End-to-End

*   **Obiettivo:** Verificare che frontend e backend comunichino e funzionino insieme come previsto.
*   **Come fare:**
    1.  Avviare il server API backend (nel terminale del progetto `musiconet-recommender`).
    2.  Avviare l'applicazione Expo (nel terminale del progetto `musiconet-test-app`).
    3.  Nell'app Expo, inserire un ID utente valido e richiedere le raccomandazioni.
    4.  Verificare che la richiesta arrivi al backend, che il backend elabori la richiesta e restituisca le raccomandazioni, e che il frontend riceva e visualizzi correttamente tali raccomandazioni.
*   **Test:** Eseguire il flusso completo più volte con diversi ID utente (se disponibili nel database di test). Confrontare i risultati visualizzati nell'app con quelli che ci si aspetterebbe o che vengono stampati nel terminale del backend.

## 5. Preparazione per i Test con Utenti

Questo blocco prepara l'applicazione per essere utilizzata da altri per i test della tesi.

### Task 5.1: Esposizione API (se necessario)

*   **Obiettivo:** Rendere l'API backend accessibile da dispositivi esterni alla rete locale.
*   **Come fare:**
    *   Se i tester non sono sulla stessa rete locale del computer che esegue il backend, sarà necessario esporre l'API. Un modo semplice per test temporanei è usare `ngrok`. Installare `ngrok` e avviarlo puntando alla porta del server API (es. `ngrok http 3000`). `ngrok` fornirà un URL pubblico temporaneo.
    *   Aggiornare l'URL dell'API nel codice frontend Expo con l'URL fornito da `ngrok`.
    *   Per un deployment più stabile, considerare servizi come Vercel, Heroku, o un VPS, adattando il processo di deployment per un'applicazione Node.js.
*   **Test:** Provare ad accedere all'URL pubblico dell'API da un dispositivo esterno (es. telefono non connesso al Wi-Fi locale) utilizzando un browser o `curl` per verificare che risponda.

### Task 5.2: Creazione Build di Test Expo

*   **Obiettivo:** Preparare l'applicazione mobile per la distribuzione ai tester.
*   **Come fare:**
    *   I tester possono utilizzare l'app Expo Go per scansionare il QR code fornito da `npm start` (se il backend è accessibile via ngrok o URL pubblico).
    *   In alternativa, creare una build standalone dell'app (richiede un account Expo e configurazione aggiuntiva) utilizzando i comandi di build di Expo (es. `eas build -p android` o `eas build -p ios`).
*   **Test:** Installare l'app sui dispositivi di test (tramite Expo Go o la build standalone) e verificare che si connetta correttamente all'API esposta e funzioni come previsto.

## 6. Pianificazione per la Scalabilità Futura (Documentazione)

Questo blocco riguarda la documentazione e le considerazioni per le fasi successive dello sviluppo di MusicoNet.

*   **Obiettivo:** Riassumere le aree chiave per l'evoluzione del progetto verso un sistema scalabile e completo.
*   **Come fare:**
    *   Aggiungere una sezione a questo documento o creare un nuovo file (`FUTURE_PLAN.md`) che elenchi le considerazioni per la scalabilità e le funzionalità future, basandosi sulla valutazione tecnica precedente e sulla tesi.
    *   Includere punti come:
        *   Migrazione del database da SQLite a un DB più robusto (es. PostgreSQL).
        *   Ottimizzazione degli algoritmi di raccomandazione per performance e scalabilità (es. algoritmi item-based, librerie specializzate).
        *   Integrazione di dati più ricchi per le raccomandazioni (dati contestuali, interazioni sociali).
        *   Implementazione di tutte le funzionalità descritte nella tesi (gestione profili, eventi, gruppi, chat, ecc.).
        *   Implementazione di un sistema di autenticazione e autorizzazione robusto.
        *   Considerazioni sull'infrastruttura di deployment per un'applicazione di produzione.
*   **Test:** Verificare che la documentazione sia chiara e comprensibile.