# Backlog – Min Ekonom Light

Ordning: överst = närmast. Flytta rader till "Klart" när de är gjorda.

## Näst på tur
- [ ] **Slå på riktig skärmdumpsavläsning**: koden är klar. Kvar: sätt `ANTHROPIC_API_KEY` och `TEST_CODES` i Netlify, skriftligt samtycke från vårdnadshavare utanför appen, kontrollera leverantörens lagringsvillkor och att samtyckestexten i appen stämmer med dem.
- [ ] **Testa formuleringar** av "saldo / vad finns på kontot / summan på kontot". Välj den som fastnar bäst hos målgruppen och gör texterna enhetliga.

## Idéer – avvaktar
- [ ] **Likhets-ikoner i "Har jag råd?"**: visa köpet som ikoner mot det man har, t.ex. "du vill köpa 3 pizzaslicar och har 24".
- [ ] **Verifierat samtycke** från vårdnadshavare (mejl eller BankID) – hör ihop med riktig avläsning och en server.
- [ ] **Notiser** (kräver push-server; på iPhone bara när appen är installerad på hemskärmen).
- [ ] **Ekonomi-quiz** ("Hur är du med pengar") – behöver frågorna.
- [ ] **Tips efter quizet** (korta swipebara kort).
- [ ] **Support/FAQ-sida.**
- [ ] **"Visa introduktionen igen"** i inställningar.
- [ ] **Sparmål-firande**: egen skärm för uppnått mål (återanvänder badge-firandet tills vidare).
- [ ] **Köpkompisar** (socialt) – pausat, syns som "Snart".
- [ ] **Skydd mot felinmatning** (om manuell inmatning blir huvudväg): läs upp siffran i ord och som likhet, varna vid stora förändringar mot förra värdet.

## Klart
- [x] Skärmdumpsavläsning (kod): serverfunktion `netlify/functions/read-screenshot.mjs`, testkod via länk `?kod=…`, faller tillbaka på fejkat läge utan kod
- [x] PWA av Figma-prototypen, offline, installerbar
- [x] Samtyckessteg i onboarding + vårdnadshavartext i inställningar
- [x] Copyändringar: "vad finns på kontot", "hemskärmen"
- [x] Likhets-kortet visar varje enhet som en ikon, tio per rad
