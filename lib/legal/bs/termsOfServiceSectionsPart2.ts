import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

const termsSectionsPart2Bs: LegalSection[] = [
  {
    id: "disclaimers",
    title: "11. Odricanja i garancije",
    blocks: [
      {
        type: "list",
        items: [
          'Naša Usluga se pruža "kakva jeste" bez garancija bilo koje vrste',
          "Ne garantiramo uspješno objavljivanje na svim platformama društvenih mreža",
          "Platforme trećih strana mogu bez najave mijenjati svoje API-je, politike ili uslove",
          "Nismo odgovorni za performanse sadržaja, stope angažmana ili poslovne rezultate",
          "Internetska povezanost i kompatibilnost uređaja mogu utjecati na funkcionalnost usluge",
        ],
      },
    ],
  },
  {
    id: "liability",
    title: "12. Ograničenje odgovornosti",
    blocks: [
      {
        type: "paragraph",
        text: "U maksimalnoj mjeri dozvoljenoj važećim zakonom:",
      },
      {
        type: "list",
        items: [
          "Naša ukupna odgovornost ograničena je na iznos koji ste platili za Uslugu u 12 mjeseci koji prethode potraživanju",
          "Nismo odgovorni za indirektne, slučajne, posljedične ili kaznene štete",
          "Nismo odgovorni za gubitke uzrokovane radnjama ili politikama platformi trećih strana",
          "Prekid poslovanja, izgubljena dobit ili gubitak podataka isključeni su iz naše odgovornosti",
          "Neke jurisdikcije ne dozvoljavaju ograničenja odgovornosti, pa se ona možda neće primjenjivati na vas",
        ],
      },
    ],
  },
  {
    id: "indemnification",
    title: "13. Naknada štete",
    blocks: [
      {
        type: "paragraph",
        text: "Pristajete da nadoknadite štetu, branite i oslobodite PostSiva, njene službenike, direktore, zaposlene i agente od svih potraživanja, šteta, gubitaka ili troškova (uključujući razumne advokatske naknade) koji proizlaze iz:",
      },
      {
        type: "list",
        items: [
          "Vašeg korištenja Usluge ili kršenja ovih Uslova",
          "Sadržaja koji objavljujete ili dijelite putem naše platforme",
          "Vašeg kršenja prava trećih strana ili važećih zakona",
          "Neovlaštenog pristupa vašem računu uslijed vaše nemarnosti",
        ],
      },
    ],
  },
  {
    id: "third-party",
    title: "14. Platforme i usluge trećih strana",
    blocks: [
      {
        type: "list",
        items: [
          "Naša Usluga se integriše s raznim platformama društvenih mreža i uslugama trećih strana",
          "Svaka platforma ima vlastite uslove korištenja, politike privatnosti i politike prihvatljive upotrebe",
          "Morate poštovati sve primjenjive uslove i politike trećih strana",
          "Nismo odgovorni za izmjene, prekide rada ili kršenja politike platformi trećih strana",
          "Integracije platformi mogu biti izmijenjene ili ukinute u zavisnosti od dostupnosti API-ja",
        ],
      },
    ],
  },
  {
    id: "dispute-resolution",
    title: "15. Rješavanje sporova",
    blocks: [],
    subsections: [
      {
        id: "informal-resolution",
        title: "15.1 Neformalno rješavanje",
        blocks: [
          {
            type: "paragraph",
            text: "Prije pokretanja formalnih postupaka, strane se slažu da pokušaju rješavanje u dobroj vjeri putem direktne komunikacije.",
          },
        ],
      },
      {
        id: "arbitration",
        title: "15.2 Obavezujuća arbitraža",
        blocks: [
          {
            type: "list",
            items: [
              "Sporovi će se rješavati putem obavezujuće arbitraže umjesto sudskih postupaka",
              "Arbitraža će se voditi prema važećim arbitražnim pravilima",
              "Odustaje se od kolektivnih tužbi i suđenja pred porotom",
              "Neke jurisdikcije možda neće sprovoditi arbitražne klauzule",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "changes",
    title: "16. Izmjene uslova",
    blocks: [
      {
        type: "list",
        items: [
          "Možemo periodično ažurirati ove Uslove kako bismo odrazili izmjene usluge ili pravne zahtjeve",
          "Bitne izmjene bit će saopćene putem e-pošte i obavještenja na platformi",
          "Nastavak korištenja Usluge nakon izmjena predstavlja prihvatanje novih Uslova",
          "Možete ukinuti svoj račun ako se ne slažete s ažuriranim Uslovima",
        ],
      },
    ],
  },
  {
    id: "governing-law",
    title: "17. Mjerodavno pravo i nadležnost",
    blocks: [
      {
        type: "list",
        items: [
          "Ovi Uslovi uređeni su važećim zakonima u jurisdikciji u kojoj PostSiva posluje",
          "Međunarodni korisnici mogu imati dodatna prava prema lokalnim zakonima",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "18. Kontakt informacije",
    blocks: [
      {
        type: "paragraph",
        text: "Za pitanja o ovim Uslovima korištenja ili pravnim stvarima:",
      },
      {
        type: "list",
        items: [
          "Pravno odjeljenje: legal@postsiva.com",
          "Opšta podrška: support@postsiva.com",
          "Poslovni upiti: business@postsiva.com",
          "Službenik za usklađenost: compliance@postsiva.com",
        ],
      },
    ],
  },
  {
    id: "linkedin",
    title: "Integracije trećih strana (LinkedIn)",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva se integriše s LinkedIn putem zvaničnih API-ja kako bi pružila funkcije objavljivanja i upravljanja sadržajem.",
      },
      {
        type: "paragraph",
        text: "Povezivanjem svog LinkedIn naloga pristajete da:",
      },
      {
        type: "list",
        items: [
          "Ovlašćujete PostSiva da pristupa LinkedIn podacima samo za dozvoljene radnje",
          "Ostajete odgovorni za sav sadržaj objavljen putem vašeg LinkedIn naloga",
          "PostSiva djeluje kao tehnička platforma, a ne kao vlasnik sadržaja",
        ],
      },
    ],
    subsections: [
      {
        id: "linkedin-responsibilities",
        title: "Obaveze korisnika",
        blocks: [
          {
            type: "list",
            items: [
              "Koristite PostSiva u skladu s LinkedIn politikama",
              "Ne objavljujte obmanjujući, uvredljiv ili zabranjeni sadržaj",
              "Osigurajte da imate odgovarajuća prava za objavljivanje sadržaja u ime stranica ili profila",
            ],
          },
          {
            type: "note",
            text: "PostSiva nije odgovorna za kršenja sadržaja ili ograničenja računa koje nameće LinkedIn.",
          },
        ],
      },
      {
        id: "linkedin-api",
        title: "Korištenje API-ja i ograničenja",
        blocks: [
          {
            type: "list",
            items: [
              "Pristup LinkedIn API-ju zavisi od odobrenja i dostupnosti LinkedIn-a",
              "Funkcije se mogu mijenjati ili ograničavati na osnovu ažuriranja LinkedIn politike",
              "PostSiva ne garantira neprekidan pristup API-ju",
            ],
          },
        ],
      },
      {
        id: "linkedin-termination",
        title: "Prekid pristupa",
        blocks: [
          {
            type: "paragraph",
            text: "PostSiva zadržava pravo da suspenduje ili opozove LinkedIn integraciju ako se otkrije zloupotreba i da postupi po LinkedIn zahtjevima povezanim s provođenjem politike. Korisnici mogu prekinuti LinkedIn integraciju u bilo kojem trenutku.",
          },
        ],
      },
      {
        id: "linkedin-disclaimer",
        title: "Odricanje",
        blocks: [
          {
            type: "note",
            text: "PostSiva je nezavisna platforma i nije povezana s, podržana niti sponzorisana od strane LinkedIn-a. LinkedIn je registrovani žig LinkedIn Corporation.",
          },
        ],
      },
    ],
  },
];

export { termsSectionsPart2Bs };
