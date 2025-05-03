# Piano per la Realizzazione di un'Applicazione di Test MusicoNet (MVP per la Tesi) e Base per l'App Scalabile

**Obiettivo:** Creare un'applicazione minimale (frontend in Expo + API backend) per valutare il sistema di raccomandazione esistente con utenti reali, gettando le basi per l'applicazione completa di MusicoNet.

**Componenti Chiave:**
1.  **`musiconet-recommender`:** Il progetto backend esistente con la logica di raccomandazione e gestione DB locale (SQLite).
2.  **API Layer:** Un nuovo strato intermedio per esporre le funzionalità di raccomandazione via HTTP.
3.  **MusicoNet Test App (Expo):** L'applicazione mobile frontend per interagire con l'utente e l'API.

**Passi del Piano:**

1.  **Creazione del Livello API (Backend):**
    *   Sviluppare un semplice server HTTP (ad esempio, utilizzando Node.js con framework come Express o Fastify) nella directory del progetto `musiconet-recommender` o in una sottodirectory dedicata.
    *   Questo server importerà e utilizzerà le funzioni dal progetto `musiconet-recommender` (in particolare quelle in `src/index.ts` o direttamente le funzioni di raccomandazione da `src/hybrid_recommender.ts`).
    *   Definire un endpoint API (es. `GET /recommendations/:userId`) che accetti un ID utente e restituisca la lista di raccomandazioni generate dal motore esistente.
    *   Configurare il server per aprire e chiudere il database SQLite (`musiconet.db`) in modo appropriato per le richieste API.
    *   Implementare una gestione base degli errori per le richieste API.

2.  **Progettazione dell'Interfaccia Utente Minimale (Expo):**
    *   Definire le schermate essenziali per l'applicazione di test:
        *   Una schermata iniziale dove l'utente può "identificarsi" (per semplicità, potrebbe essere un campo dove inserire un ID utente esistente nel database, o una lista predefinita di utenti di test).
        *   Una schermata per visualizzare le raccomandazioni ottenute.
    *   L'interfaccia deve essere pulita e focalizzata sulla presentazione delle raccomandazioni (es. lista di eventi/artisti raccomandati).

3.  **Implementazione dell'Applicazione Frontend (Expo):**
    *   Creare un nuovo progetto Expo.
    *   Sviluppare le schermate progettate nel passo 2 utilizzando React Native.
    *   Implementare la logica per effettuare chiamate HTTP all'API creata nel passo 1 (utilizzando `fetch` o librerie come `axios`).
    *   Gestire lo stato dell'applicazione (input utente, caricamento raccomandazioni, visualizzazione risultati).

4.  **Integrazione e Test Locale:**
    *   Assicurarsi che il server API sia in esecuzione.
    *   Eseguire l'applicazione Expo su un emulatore o dispositivo di test.
    *   Verificare che l'app Expo possa connettersi all'API, inviare richieste e visualizzare correttamente le raccomandazioni ricevute.

5.  **Preparazione per i Test con Utenti:**
    *   Configurare l'ambiente per permettere agli utenti di test di accedere all'applicazione (ad esempio, tramite Expo Go o build di test).
    *   Assicurarsi che il server API sia accessibile dagli utenti di test (potrebbe richiedere la configurazione di tunneling o deployment su un server accessibile pubblicamente per i test).

6.  **Pianificazione per la Scalabilità Futura:**
    *   Documentare come l'API layer può essere esteso per includere altre funzionalità di MusicoNet (gestione profili, creazione eventi, interazioni sociali).
    *   Considerare l'evoluzione del database da SQLite a una soluzione più scalabile (es. PostgreSQL) e come migrare i dati.
    *   Pensare a come gli algoritmi di raccomandazione potrebbero essere ottimizzati per performance e scalabilità (come discusso nella valutazione tecnica).
    *   Pianificare l'implementazione di autenticazione utente robusta e gestione dei dati completa.

**Diagramma dell'Architettura:**

```mermaid
graph TD
    A[Utente] -->|Interagisce con| B[MusicoNet Test App (Frontend Expo)]
    B -->|Richiede Raccomandazioni| C[API Layer (Nuovo Backend)]
    C -->|Utilizza Logica da| D[musiconet-recommender (Backend Esistente)]
    D -->|Accede a/Scrive su| E[musiconet.db (SQLite Database)]