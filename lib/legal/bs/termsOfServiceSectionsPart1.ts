import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

const termsSectionsPart1Bs: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Prihvatanje uslova",
    blocks: [
      {
        type: "paragraph",
        text: 'Ovi Uslovi korištenja ("Uslovi") čine pravno obavezujući ugovor između vas ("Korisnik," "vi" ili "vas") i PostSiva ("Kompanija," "mi," "naš" ili "nas") koji uređuje vaš pristup i korištenje PostSiva platforme, web-stranice i povezanih usluga (zajedno, "Usluga").',
      },
      {
        type: "paragraph",
        text: "Kreiranjem računa, pristupanjem našoj platformi ili korištenjem bilo kojeg dijela naše Usluge, potvrđujete da ste pročitali, razumjeli i pristajete da budete obavezani ovim Uslovima i našom Politikom privatnosti. Ako se ne slažete s ovim Uslovima, ne smijete pristupati niti koristiti našu Uslugu.",
      },
    ],
  },
  {
    id: "service-description",
    title: "2. Opis usluge",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva je sveobuhvatna platforma za upravljanje društvenim mrežama koja pruža sljedeće usluge:",
      },
      {
        type: "list",
        items: [
          "Upravljanje na više platformi: Povežite i upravljajte više naloga na društvenim mrežama iz jedinstvene kontrole table",
          "Zakazivanje sadržaja: Zakazujte objave na raznim platformama društvenih mreža, uključujući TikTok, Instagram, Facebook, Twitter, LinkedIn i YouTube",
          "Analitika i uvidi: Pratite metrike performansi, stope angažmana i analitiku publike",
          "Timska saradnja: Omogućite više korisnika da sarađuju na kreiranju sadržaja i tokovima odobravanja",
          "Kalendar sadržaja: Vizuelno planiranje i organizacija sadržaja za društvene mreže",
        ],
      },
    ],
  },
  {
    id: "user-accounts",
    title: "3. Korisnički računi i registracija",
    blocks: [],
    subsections: [
      {
        id: "eligibility",
        title: "3.1 Pravo na korištenje",
        blocks: [
          {
            type: "list",
            items: [
              "Morate imati najmanje 16 godina da biste kreirali račun",
              "Morate pružiti tačne, aktuelne i potpune podatke tokom registracije",
              "Morate imati pravnu sposobnost za sklapanje obavezujućih ugovora",
              "Poslovne račune moraju registrovati ovlašteni predstavnici",
            ],
          },
        ],
      },
      {
        id: "account-security",
        title: "3.2 Sigurnost računa",
        blocks: [
          {
            type: "list",
            items: [
              "Odgovorni ste za održavanje povjerljivosti podataka za pristup svom računu",
              "Morate nas odmah obavijestiti o bilo kakvom neovlaštenom pristupu ili sigurnosnim incidentima",
              "Odgovorni ste za sve aktivnosti koje se odvijaju pod vašim računom",
              "Preporučujemo uključivanje dvofaktorske autentifikacije radi povećane sigurnosti",
            ],
          },
        ],
      },
      {
        id: "account-restrictions",
        title: "3.3 Ograničenja računa",
        blocks: [
          {
            type: "list",
            items: [
              "Jedna osoba ili entitet ne smije održavati više računa bez ovlaštenja",
              "Računi se ne smiju prenositi, prodavati niti dijeliti s trećim stranama",
              "Lažni ili obmanjujući podaci pri registraciji mogu rezultirati suspenzijom računa",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "social-connections",
    title: "4. Povezivanje naloga na društvenim mrežama",
    blocks: [],
    subsections: [
      {
        id: "authorization",
        title: "4.1 Zahtjevi za ovlaštenje",
        blocks: [
          {
            type: "list",
            items: [
              "Morate biti vlasnik ili imati izričito ovlaštenje za upravljanje povezanim nalozima na društvenim mrežama",
              "Dajete PostSiva dozvolu za pristup i objavljivanje sadržaja u vaše ime",
              "U potpunosti ste odgovorni za sav sadržaj objavljen putem naše platforme",
              "Morate poštovati uslove korištenja svake povezane platforme",
            ],
          },
        ],
      },
      {
        id: "platform-integration",
        title: "4.2 Integracija platformi",
        blocks: [
          {
            type: "list",
            items: [
              "Koristimo zvanične API-je i OAuth protokole za sigurne veze",
              "Pristupni tokeni su šifrovani i sigurno pohranjeni",
              "Dozvole za pristup možete opozvati u bilo kojem trenutku putem postavki računa",
              "Nismo odgovorni za izmjene API-ja ili politika platformi trećih strana",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Politika prihvatljive upotrebe",
    blocks: [
      {
        type: "paragraph",
        text: "Pristajete da NEĆETE koristiti našu Uslugu u bilo koju od sljedećih svrha:",
      },
      {
        type: "list",
        items: [
          "Nezakonit sadržaj: Objavljivanje sadržaja koji krši lokalne, nacionalne ili međunarodne zakone",
          "Štetan sadržaj: Dijeljenje sadržaja koji potiče nasilje, uznemiravanje ili diskriminaciju",
          "Kršenja intelektualne svojine: Povreda autorskih prava, žigova ili drugih prava intelektualne svojine",
          "Spam i zloupotreba: Slanje neželjenih poruka ili učešće u zlostavljačkom ponašanju",
          "Kršenja platformi: Kršenje uslova korištenja povezanih platformi društvenih mreža",
          "Sigurnosne prijetnje: Distribucija malvera, virusa ili pokušaji narušavanja sigurnosti",
          "Lažno predstavljanje: Lažno predstavljanje svog identiteta ili afilijacije",
          "Automatizovana zloupotreba: Korištenje botova ili skripti za manipulaciju metrikama angažmana",
        ],
      },
    ],
  },
  {
    id: "content-ip",
    title: "6. Sadržaj i intelektualna svojina",
    blocks: [],
    subsections: [
      {
        id: "your-content",
        title: "6.1 Vaš sadržaj",
        blocks: [
          {
            type: "list",
            items: [
              "Zadržavate vlasništvo nad svim sadržajem koji kreirate i prenosite",
              "Dajete PostSiva ograničenu licencu za obradu, pohranu i distribuciju vašeg sadržaja koliko je potrebno za pružanje naših usluga",
              "Isključivo ste odgovorni da osigurate da vaš sadržaj ispunjava važeće zakone i politike platformi",
              "Garantujete da imate sva potrebna prava na sadržaj koji prenosite",
            ],
          },
        ],
      },
      {
        id: "our-ip",
        title: "6.2 Naša intelektualna svojina",
        blocks: [
          {
            type: "list",
            items: [
              "PostSiva platforma, softver i tehnologija ostaju naša isključiva svojina",
              "Naši žigovi, logotipi i elementi brenda ne smiju se koristiti bez dozvole",
              "Ne smijete vršiti reverse engineering, dekompilaciju niti pokušavati izdvojiti naš izvorni kod",
            ],
          },
        ],
      },
      {
        id: "content-moderation",
        title: "6.3 Moderacija sadržaja",
        blocks: [
          {
            type: "list",
            items: [
              "Zadržavamo pravo da pregledamo i uklonimo sadržaj koji krši ove Uslove",
              "Uklanjanje sadržaja ne podrazumijeva odgovornost niti obavezu praćenja savog korisničkog sadržaja",
              "Možemo koristiti automatizovane sisteme za otkrivanje kršenja politike",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "subscription",
    title: "7. Pretplata i plaćanja",
    blocks: [],
    subsections: [
      {
        id: "subscription-plans",
        title: "7.1 Planovi pretplate",
        blocks: [
          {
            type: "list",
            items: [
              "Dostupni su različiti nivoi pretplate s različitim funkcionalnostima i ograničenjima",
              "Naknade za pretplatu naplaćuju se unaprijed na mjesečnoj ili godišnjoj osnovi",
              "Periodi besplatnog probnog perioda mogu se ponuditi po našem nahođenju",
              "Enterprise planovi mogu uključivati prilagođene uslove i cijene",
            ],
          },
        ],
      },
      {
        id: "payment-terms",
        title: "7.2 Uslovi plaćanja",
        blocks: [
          {
            type: "list",
            items: [
              "Sve naknade nisu povratne osim ako to zahtijeva važeći zakon",
              "Cijene se mogu mijenjati uz najavu 30 dana unaprijed postojećim pretplatnicima",
              "Neuspješna plaćanja mogu rezultirati suspenzijom usluge ili ukidanjem računa",
              "Odgovorni ste za sve primjenjive poreze i naknade",
            ],
          },
        ],
      },
      {
        id: "cancellation-refunds",
        title: "7.3 Otkazivanje i povrati",
        blocks: [
          {
            type: "list",
            items: [
              "Možete otkazati pretplatu u bilo kojem trenutku putem postavki računa",
              "Otkazivanje stupa na snagu na kraju tekućeg obračunskog perioda",
              "Povrati se ne odobravaju za djelimične obračunske periode",
              "Opcije izvoza podataka dostupne su prije zatvaranja računa",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "availability",
    title: "8. Dostupnost usluge i podrška",
    blocks: [],
    subsections: [
      {
        id: "service-level",
        title: "8.1 Nivo usluge",
        blocks: [
          {
            type: "list",
            items: [
              "Nastojimo održavati dostupnost od 99,9%, ali ne možemo garantirati neprekidnu uslugu",
              "Zakazano održavanje bit će najavljeno unaprijed kad god je to moguće",
              "Hitno održavanje može se dogoditi bez prethodne najave",
              "Prekidi usluge zbog problema s platformama trećih strana van naše su kontrole",
            ],
          },
        ],
      },
      {
        id: "customer-support",
        title: "8.2 Korisnička podrška",
        blocks: [
          {
            type: "list",
            items: [
              "Podrška se pruža putem e-pošte, chata i dokumentacije za pomoć",
              "Vremena odgovora variraju u zavisnosti od nivoa pretplate i složenosti problema",
              "Premium opcije podrške dostupne su za enterprise korisnike",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "data-privacy",
    title: "9. Podaci i privatnost",
    blocks: [
      {
        type: "list",
        items: [
          "Vaša prava na privatnost i naše prakse obrade podataka uređene su našom Politikom privatnosti",
          "Primjenjujemo industrijske standardne sigurnosne mjere radi zaštite vaših podataka",
          "Možete izvesti svoje podatke u bilo kojem trenutku putem kontrole table računa",
          "Periodi zadržavanja podataka navedeni su u našoj Politici privatnosti",
          "Poštujemo GDPR, CCPA i druge primjenjive propise o privatnosti",
        ],
      },
    ],
  },
  {
    id: "termination",
    title: "10. Ukidanje računa",
    blocks: [],
    subsections: [
      {
        id: "termination-by-you",
        title: "10.1 Ukidanje s vaše strane",
        blocks: [
          {
            type: "list",
            items: [
              "Možete ukinuti svoj račun u bilo kojem trenutku putem postavki računa",
              "Opcije izvoza podataka dostupne su prije zatvaranja računa",
              "Naknade za pretplatu se ne vraćaju pri dobrovoljnom ukidanju",
            ],
          },
        ],
      },
      {
        id: "termination-by-us",
        title: "10.2 Ukidanje s naše strane",
        blocks: [
          {
            type: "paragraph",
            text: "Možemo suspendovati ili ukinuti vaš račun ako:",
          },
          {
            type: "list",
            items: [
              "Kršite ove Uslove korištenja ili našu Politiku prihvatljive upotrebe",
              "Učestvujete u prevarantskim ili nezakonitim aktivnostima",
              "Ne platite naknade za pretplatu nakon obavještenja i perioda za ispravku",
              "Predstavljate sigurnosni rizik za našu platformu ili druge korisnike",
            ],
          },
        ],
      },
    ],
  },
];

export { termsSectionsPart1Bs };
