# Boulder Notes 🧗

Guida personale al bouldering: una PWA installabile sul telefono per salvare le nozioni delle lezioni, ripassarle e analizzare i blocchi.

## Funzionalità

- **Guida** – 10 categorie (sicurezza e cadute, attrezzatura e dispositivi, tecnica di piedi, prese e mani, movimento del corpo, riposo, lettura del blocco, riscaldamento e prevenzione, mente e progressione, regole ed etichetta). Ogni mossa spiega *perché si usa*, *quando*, *perché è importante*, come si fa ed errori comuni.
- **Progressi** – segna le mosse come imparate o preferite, aggiungi appunti personali, ricerca e “ripasso del giorno”.
- **Diario lezioni** – annota ogni lezione e collega le mosse trattate.
- **Scanner** – fotografa il blocco, tocca una presa per sceglierne il colore: l’app riconosce le prese e propone una sequenza (partenza, mani, piedi, top) con link alle tecniche. Puoi correggere partenza/top a mano.
- **Analisi AI opzionale** – con la tua API key di [Google AI Studio](https://aistudio.google.com/apikey) (Gemini; salvata solo nel browser, mai nei backup) ottieni una beta più dettagliata. Modello predefinito `gemini-3.8-flash`, modificabile nelle Impostazioni.
- **Timer di riposo** tra i tentativi, **backup/ripristino** JSON, funzionamento **offline**.

## Sviluppo

```bash
npm install
npm run dev      # server di sviluppo
npm test         # test unitari (vitest)
npm run lint     # oxlint
npm run build    # build di produzione in dist/
```

## Pubblicazione su GitHub Pages (per usarla sul telefono)

1. Crea un repository vuoto su GitHub, poi:
   ```bash
   git remote add origin https://github.com/<utente>/<repo>.git
   git checkout main && git merge feature/climbing-guide-pwa
   git push -u origin main
   ```
2. Su GitHub: **Settings → Pages → Source: GitHub Actions**. Il workflow `.github/workflows/deploy.yml` esegue test e build e pubblica a ogni push su `main`.
3. Apri `https://<utente>.github.io/<repo>/` dal telefono:
   - **Android (Chrome):** menu ⋮ → *Installa app*.
   - **iPhone (Safari):** Condividi → *Aggiungi alla schermata Home*.

I dati restano sul singolo dispositivo: per spostarli usa *Esporta/Importa backup*. La chiave Google AI Studio va inserita su ogni dispositivo.

> I suggerimenti dello scanner sono euristici e la guida non sostituisce un istruttore qualificato.
