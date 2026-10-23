# Catalogo dal gestionale

I clienti prenotano su /prenota senza account. /login e /registrazione rimandano alle prenotazioni. /admin mantiene il PIN.

Prima di attivare il catalogo, eseguire scripts/004_catalog_services.sql nel progetto Supabase in uso. Crea la tabella del listino senza alterare appuntamenti e senza nuove variabili di ambiente.

In Catalogo modificare nome, prezzo, durata o «a partire da», quindi salvare il servizio. Categorie e taglie restano quelle attuali. Listino pubblico e nuove prenotazioni usano i valori salvati. Gli appuntamenti esistenti conservano nome e durata originali.

Senza la tabella si legge il listino originale; il salvataggio indica lo script necessario. Gli altri errori del database non vengono ignorati.

Verifica dopo attivazione: accedere con PIN, modificare un servizio e riaprire /prenota per controllare prezzo e durata nel catalogo e nel riepilogo.
