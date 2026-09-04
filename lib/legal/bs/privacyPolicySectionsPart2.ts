import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

export const privacyPolicySectionsPart2Bs: LegalSection[] = [
  {
    id: "international-transfers",
    title: "10. Međunarodni prijenosi podataka",
    blocks: [
      {
        type: "paragraph",
        text: "Vaši podaci mogu se obrađivati u zemljama različitim od vašeg mjesta boravišta. Osiguravamo odgovarajuću zaštitu putem:",
      },
      {
        type: "list",
        items: [
          "Standardnih ugovornih klauzula (SCC) koje je odobrila Evropska komisija",
          "Odluka o adekvatnosti za zemlje s ekvivalentnom zaštitom podataka",
          "Obavezujućih korporativnih pravila za prijenose unutar grupe",
          "Vaše izričite saglasnosti gdje je to potrebno",
        ],
      },
    ],
  },
  {
    id: "children",
    title: "11. Privatnost djece",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva nije namijenjena korisnicima mlađim od 16 godina. Ne prikupljamo namjerno lične podatke od djece mlađe od 16 godina. Ako saznamo za takvo prikupljanje, odmah ćemo obrisati te podatke.",
      },
    ],
  },
  {
    id: "cookies",
    title: "12. Kolačići i tehnologije praćenja",
    blocks: [
      {
        type: "paragraph",
        text: "Koristimo kolačiće i slične tehnologije za:",
      },
      {
        type: "list",
        items: [
          "Održavanje korisničkih sesija i preferencija",
          "Analizu korištenja i performansi platforme",
          "Pružanje personalizovanih iskustava",
          "Osiguravanje sigurnosti i sprečavanje prevare",
        ],
      },
      {
        type: "paragraph",
        text: "Preferencijama kolačića možete upravljati putem postavki preglednika.",
      },
    ],
  },
  {
    id: "policy-changes",
    title: "13. Izmjene ove politike",
    blocks: [
      {
        type: "paragraph",
        text: "Možemo ažurirati ovu politiku privatnosti kako bismo odrazili izmjene u našim praksama ili zakonskim zahtjevima. Bitne izmjene bit će saopćene putem e-mail obavještenja registrovanim korisnicima, istaknutih obavještenja na našoj platformi i ažuriranog datuma stupanja na snagu na ovoj politici.",
      },
    ],
  },
  {
    id: "contact",
    title: "14. Kontakt informacije",
    blocks: [
      {
        type: "paragraph",
        text: "Za pitanja, zahtjeve ili zabrinutosti vezane za privatnost, kontaktirajte nas:",
      },
      {
        type: "list",
        items: [
          "Službenik za privatnost: privacy@postsiva.com",
          "Opšta podrška: support@postsiva.com",
          "Službenik za zaštitu podataka: dpo@postsiva.com",
          "Pravno odjeljenje: legal@postsiva.com",
        ],
      },
    ],
  },
  {
    id: "google-data",
    title: "15. Korištenje Google korisničkih podataka i YouTube API integracija",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva se integriše s Google API-jima i YouTube Data API v3 kako bi pružila sveobuhvatne usluge upravljanja YouTube-om. Ovaj odjeljak detaljno opisuje kako pristupamo, koristimo i štitimo vaše Google korisničke podatke u skladu s Google API Services User Data Policy.",
      },
    ],
    subsections: [
      {
        id: "google-scopes",
        title: "15.1 Google OAuth opsezi i dozvole",
        blocks: [
          {
            type: "paragraph",
            text: "Kada povežete svoj Google/YouTube nalog s PostSiva, zahtijevamo dozvole uključujući userinfo.email, userinfo.profile, openid, yt-analytics.readonly, youtube.readonly, youtube, youtube.force-ssl i youtube.upload po potrebi za identifikaciju naloga, analitiku i upravljanje sadržajem.",
          },
        ],
      },
      {
        id: "google-data-use",
        title: "15.2 Kako koristimo Google i YouTube podatke",
        blocks: [
          {
            type: "list",
            items: [
              "Prikaz informacija o kanalu, metapodataka videozapisa i playlista u vašoj kontroli tabli",
              "Omogućavanje prijenosa, zakazivanja, uređivanja i organizacije YouTube videozapisa",
              "Pružanje analitičkih izvještaja i uvida u performanse",
              "Ponuda AI-podržanih prijedloga za naslove, opise, oznake i sličice",
              "Olakšavanje timske saradnje na vašem YouTube prisustvu uz vašu dozvolu",
            ],
          },
        ],
      },
      {
        id: "google-security",
        title: "15.3 Sigurnost podataka i ograničena upotreba",
        blocks: [
          {
            type: "list",
            items: [
              "OAuth 2.0 autentifikacija s AES-256 šifriranjem tokena",
              "Nikada ne pohranjujemo lozinke vašeg Google naloga",
              "Google korisnički podaci koriste se isključivo za pružanje i unapređenje usluga upravljanja YouTube-om",
              "Ne prodajemo, ne iznajmljujemo niti ne dijelimo Google korisničke podatke s trećim stranama u reklamne svrhe",
              "Ne koristimo Google korisničke podatke za treniranje AI/ML modela bez izričite saglasnosti",
            ],
          },
        ],
      },
      {
        id: "google-retention",
        title: "15.4 Zadržavanje i brisanje podataka",
        blocks: [
          {
            type: "list",
            items: [
              "Analitički podaci se keširaju do 30 dana radi poboljšanja performansi kontrole table",
              "Google korisnički podaci se brišu kada prekinete povezivanje Google naloga",
              "Potpuno uklanjanje povezanih Google podataka u roku od 30 dana od brisanja računa",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "linkedin-data",
    title: "16. Korištenje LinkedIn podataka",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva koristi LinkedIn API-je, uključujući LinkedIn Community Management API, kako bi pomogla korisnicima da upravljaju i objavljuju sadržaj na LinkedIn-u na siguran i usklađen način.",
      },
    ],
    subsections: [
      {
        id: "linkedin-access",
        title: "16.1 Podaci kojima pristupamo s LinkedIn-a",
        blocks: [
          {
            type: "list",
            items: [
              "ID LinkedIn stranice ili profila",
              "Sadržaj objave i metapodaci (tekst, reference na medije, vremenske oznake)",
              "Komentari i reakcije na objave",
              "Osnovne metrike angažmana (lajkovi, broj komentara)",
              "Naziv stranice ili profila i javne informacije potrebne za objavljivanje",
            ],
          },
          {
            type: "note",
            text: "NE pristupamo privatnim porukama, lozinkama niti osjetljivim ličnim podacima.",
          },
        ],
      },
      {
        id: "linkedin-use",
        title: "16.2 Kako koristimo LinkedIn podatke",
        blocks: [
          {
            type: "list",
            items: [
              "Kreiranje, zakazivanje, objavljivanje i upravljanje LinkedIn objavama",
              "Prikaz performansi objava i uvida u angažman",
              "Omogućavanje korisnicima da odgovaraju na komentare i upravljaju reakcijama",
              "Unapređenje toka rada sadržaja i produktivnosti korisnika",
            ],
          },
          {
            type: "paragraph",
            text: "Ne prodajemo, ne iznajmljujemo niti ne dijelimo LinkedIn podatke s trećim stranama.",
          },
        ],
      },
      {
        id: "linkedin-control",
        title: "16.3 Kontrola korisnika i brisanje podataka",
        blocks: [
          {
            type: "list",
            items: [
              "Prekinite povezivanje LinkedIn naloga s PostSiva u bilo kojem trenutku",
              "Zatražite brisanje pohranjenih podataka povezanih s LinkedIn-om",
              "Kontrolišite dozvole direktno iz postavki svog LinkedIn naloga",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chrome-extension",
    title: "17. Korištenje podataka Chrome ekstenzije",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva nudi Chrome ekstenziju preglednika koja unapređuje vaše LinkedIn iskustvo. LinkedIn sadržaju pristupamo samo kada aktivno koristite ekstenziju za radnje kao što je ponovno objavljivanje.",
      },
    ],
    subsections: [
      {
        id: "extension-access",
        title: "17.1 Pristup LinkedIn podacima",
        blocks: [
          {
            type: "list",
            items: [
              "Ekstenzija pristupa LinkedIn objavama samo kada izričito pokrenete radnju",
              "Ne prikupljamo niti ne pristupamo LinkedIn podacima u pozadini",
              "Ne dolazi do automatskog skeniranja niti pasivnog prikupljanja podataka",
            ],
          },
        ],
      },
      {
        id: "extension-backend",
        title: "17.2 Prijenos podataka na backend",
        blocks: [
          {
            type: "paragraph",
            text: "Radi pružanja osnovne funkcionalnosti, ekstenzija šalje potrebne podatke našim backend uslugama na https://backend.postsiva.com. Svi prijenosi podataka šifrovani su protokolima HTTPS/TLS.",
          },
        ],
      },
      {
        id: "extension-collected",
        title: "17.3 Podaci koje prikupljamo putem ekstenzije",
        blocks: [
          {
            type: "list",
            items: [
              "Sadržaj koji odaberete za ponovno objavljivanje: tekst, slike, videozapisi i linkovi iz LinkedIn objava koje odaberete",
              "Osnovni podaci o korištenju: interakcije s ekstenzijom, korištenje funkcija i dnevnici grešaka",
              "Podaci vezani za račun: autentifikacijski tokeni i korisnički ID ako se prijavite putem ekstenzije",
              "Informacije o pregledniku: verzija preglednika i verzija ekstenzije radi kompatibilnosti",
            ],
          },
          {
            type: "paragraph",
            text: "Ne prikupljamo historiju pregledanja van LinkedIn-a, lozinke, privatne poruke niti podatke s drugih web-stranica.",
          },
        ],
      },
      {
        id: "extension-control",
        title: "17.4 Kontrola korisnika",
        blocks: [
          {
            type: "list",
            items: [
              "Deinstalirajte ekstenziju u bilo kojem trenutku putem Chrome postavki",
              "Prekinite povezivanje svog PostSiva računa s ekstenzijom",
              "Zatražite brisanje podataka ekstenzije kontaktiranjem privacy@postsiva.com",
            ],
          },
        ],
      },
    ],
  },
];
