import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

export const privacyPolicySectionsPart1Bs: LegalSection[] = [
  {
    id: "about",
    title: "1. O PostSiva",
    blocks: [
      {
        type: "paragraph",
        text: 'PostSiva ("mi," "naš" ili "nas") je sveobuhvatna platforma za upravljanje društvenim mrežama koja omogućava preduzećima, kreatorima sadržaja i marketinškim profesionalcima da upravljaju više naloga na društvenim mrežama iz jedinstvene kontrole table. Naša usluga omogućava korisnicima da zakazuju sadržaj, analiziraju performanse i pojednostave tokove rada na društvenim mrežama na platformama uključujući TikTok, Instagram, Facebook, Twitter, LinkedIn, YouTube i druge.',
      },
    ],
  },
  {
    id: "information-collected",
    title: "2. Podaci koje prikupljamo",
    blocks: [],
    subsections: [
      {
        id: "account-information",
        title: "2.1 Podaci o računu",
        blocks: [
          {
            type: "list",
            items: [
              "Adresa e-pošte i kontakt podaci",
              "Podaci o profilu (ime, kompanija, naziv radnog mjesta)",
              "Podaci za pristup računu i autentifikaciju",
              "Podaci o naplati i detalji plaćanja",
              "Preferencije pretplate i korištenja",
            ],
          },
        ],
      },
      {
        id: "social-media-data",
        title: "2.2 Podaci o nalozima na društvenim mrežama",
        blocks: [
          {
            type: "list",
            items: [
              "OAuth pristupni tokeni s povezanih platformi društvenih mreža",
              "Javni podaci o profilu s povezanih naloga",
              "Podaci o sadržaju (objave, slike, videozapisi, natpisi)",
              "Preferencije zakazivanja i objavljivanja",
              "Analitički podaci i metrike performansi",
              "Uvidi u publiku i statistike angažmana",
            ],
          },
        ],
      },
      {
        id: "usage-data",
        title: "2.3 Podaci o korištenju i tehnički podaci",
        blocks: [
          {
            type: "list",
            items: [
              "Statistike korištenja platforme i iskorištenost funkcija",
              "Podaci o uređaju i detalji preglednika",
              "IP adrese i podaci o lokaciji",
              "Datoteke dnevnika i izvještaji o greškama",
              "Informacije o performansama i dijagnostici",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "3. Kako koristimo vaše podatke",
    blocks: [
      {
        type: "paragraph",
        text: "Vaše podatke obrađujemo u sljedeće svrhe:",
      },
      {
        type: "list",
        items: [
          "Pružanje usluga upravljanja društvenim mrežama i zakazivanja",
          "Objavljivanje sadržaja na vašim povezanim nalozima na društvenim mrežama",
          "Generisanje analitičkih izvještaja i uvida u performanse",
          "Olakšavanje timske saradnje i upravljanja tokovima rada",
          "Obrada plaćanja, upravljanje pretplatama i pružanje korisničke podrške",
          "Analiza obrazaca korištenja radi unapređenja funkcija i korisničkog iskustva",
          "Slanje ažuriranja o usluzi, sigurnosnih upozorenja i marketinških komunikacija (uz saglasnost)",
          "Ispunjavanje regulatornih zahtjeva i zaštita od prevare",
        ],
      },
    ],
  },
  {
    id: "platform-integration",
    title: "4. Integracija s platformama društvenih mreža",
    blocks: [
      {
        type: "list",
        items: [
          "Zahtijevamo samo minimalne dozvole potrebne za naše usluge",
          "OAuth tokeni su šifrovani i sigurno pohranjeni",
          "Poštujemo postavke privatnosti i uslove svake povezane platforme",
          "Možete prekinuti povezivanje naloga u bilo kojem trenutku putem kontrole table",
          "Ne pristupamo privatnim porukama niti ličnim podacima van našeg djelokruga",
          "Objavljivanje sadržaja vrši se samo uz vaše izričito ovlaštenje",
        ],
      },
    ],
  },
  {
    id: "data-sharing",
    title: "5. Dijeljenje i otkrivanje podataka",
    blocks: [
      {
        type: "paragraph",
        text: "Ne prodajemo, ne iznajmljujemo niti ne trgujemo vašim ličnim podacima. Podatke možemo dijeliti samo u sljedećim okolnostima:",
      },
      {
        type: "list",
        items: [
          "Povezane platforme: S platformama društvenih mreža radi objavljivanja vašeg sadržaja",
          "Pružaoci usluga: S pouzdanim trećim stranama koje pomažu u pružanju usluge (procesori plaćanja, pružaoci hostinga)",
          "Zakonski zahtjevi: Kada to zahtijeva zakon, sudski nalog ili radi zaštite naših prava",
          "Poslovni prijenosi: U vezi sa spajanjima, akvizicijama ili prodajom imovine (uz obavještenje)",
          "Saglasnost: Uz vašu izričitu dozvolu za određene svrhe",
        ],
      },
    ],
  },
  {
    id: "data-security",
    title: "6. Sigurnost podataka",
    blocks: [
      {
        type: "list",
        items: [
          "Šifriranje: Podaci šifrovani u prijenosu (TLS 1.3) i u mirovanju (AES-256)",
          "Kontrole pristupa: Pristup zasnovan na ulogama s višefaktorskom autentifikacijom",
          "Infrastruktura: Siguran cloud hosting s redovnim sigurnosnim revizijama",
          "Praćenje: Sigurnosno praćenje 24/7 i odgovor na incidente",
          "Usklađenost: Praksa certificirana prema SOC 2 Type II i ISO 27001",
          "Redovna ažuriranja: Kontinuirane sigurnosne zakrpe i procjene ranjivosti",
        ],
      },
    ],
  },
  {
    id: "data-retention",
    title: "7. Zadržavanje podataka",
    blocks: [
      {
        type: "list",
        items: [
          "Aktivni računi: Podaci se zadržavaju dok je vaš račun aktivan",
          "Podaci o sadržaju: Pohranjeni radi funkcionalnosti usluge i analitike (do 2 godine)",
          "Analitički podaci: Agregirani podaci zadržani radi poslovnih uvida (do 5 godina)",
          "Obrisani računi: Lični podaci se brišu u roku od 30 dana od zatvaranja računa",
          "Zakonski zahtjevi: Neki podaci mogu se zadržati duže radi usklađenosti",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    title: "8. Vaša prava i kontrole",
    blocks: [
      {
        type: "list",
        items: [
          "Pristup: Zatražite kopiju svojih ličnih podataka",
          "Ispravka: Ažurirajte ili ispravite netačne podatke",
          "Brisanje: Zatražite brisanje svojih ličnih podataka",
          "Prenosivost: Izvezite svoje podatke u formatu čitljivom mašinom",
          "Ograničenje: Ograničite način na koji obrađujemo vaše podatke",
          "Prigovor: Prigovorite obradi zasnovanoj na legitimnim interesima",
          "Povlačenje: Povucite saglasnost za određene aktivnosti obrade",
        ],
      },
    ],
  },
  {
    id: "third-party-services",
    title: "9. Usluge trećih strana",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva se integriše s raznim platformama društvenih mreža i uslugama:",
      },
      {
        type: "list",
        items: [
          "Društvene platforme: TikTok, Instagram, Facebook, Twitter, LinkedIn, YouTube, Pinterest",
          "Procesori plaćanja: Stripe, PayPal za sigurnu obradu plaćanja",
          "Analitičke usluge: Google Analytics za uvide u korištenje",
          "Cloud usluge: AWS, Cloudflare za hosting i isporuku sadržaja",
        ],
      },
      {
        type: "paragraph",
        text: "Svaka usluga treće strane ima vlastitu politiku privatnosti koja uređuje njihove prakse obrade podataka.",
      },
    ],
  },
];
