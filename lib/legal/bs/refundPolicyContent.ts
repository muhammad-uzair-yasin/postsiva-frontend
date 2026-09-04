import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";

export const refundPolicyDocumentBs: LegalDocument = {
  title: "Politika povrata",
  lastUpdated: "18. juni 2026.",
  effectiveDate: "18. juni 2026.",
  intro:
    'Ova Politika povrata objašnjava kako PostSiva ("mi," "naš" ili "nas") postupa s plaćanjima pretplate, otkazivanjima i zahtjevima za povrat za našu platformu za upravljanje društvenim mrežama i povezane usluge. Ova politika treba se čitati zajedno s našim Uslovima korištenja i Politikom privatnosti.',
  notice:
    "Kupovinom PostSiva pretplate potvrđujete da ste pročitali, razumjeli i pristajete na ovu Politiku povrata.",
  toc: [
    { id: "introduction", label: "1. Uvod" },
    { id: "scope", label: "2. Obuhvat i primjenjivost" },
    { id: "billing", label: "3. Planovi pretplate i naplata" },
    { id: "free-trial", label: "4. Besplatni probni periodi" },
    { id: "cancellation", label: "5. Politika otkazivanja" },
    { id: "eligibility", label: "6. Pravo na povrat" },
    { id: "non-refundable", label: "7. Stavke koje se ne vraćaju" },
    { id: "how-to-request", label: "8. Kako zatražiti povrat" },
    { id: "processing", label: "9. Rok obrade povrata" },
    { id: "chargebacks", label: "10. Chargebackovi i sporovi o plaćanju" },
    { id: "plan-changes", label: "11. Izmjene plana i snižavanja" },
    { id: "service-outages", label: "12. Prekidi usluge" },
    { id: "contact", label: "13. Kontakt informacije" },
  ],
  sections: [
    {
      id: "introduction",
      title: "1. Uvod",
      blocks: [
        {
          type: "paragraph",
          text: "PostSiva nudi pristup putem pretplate našoj jedinstvenoj platformi za upravljanje društvenim mrežama, uključujući zakazivanje sadržaja, analitiku, AI-podržane tokove rada, alate za timsku saradnju i integracije s glavnim društvenim mrežama. Ova Politika povrata utvrđuje uslove pod kojima se plaćanja mogu vratiti i kako se postupa s otkazivanjima.",
        },
      ],
    },
    {
      id: "scope",
      title: "2. Obuhvat i primjenjivost",
      blocks: [
        {
          type: "paragraph",
          text: "Ova politika se primjenjuje na sve plaćene pretplate kupljene direktno putem PostSiva web-stranice ili ovlaštenih kanala naplate, uključujući mjesečne i godišnje planove (Starter, Creator, Agency i Enterprise nivoi). Pokriva naknade za pretplatu, kupovine dodataka koje naplaćuje PostSiva i primjenjive poreze naplaćene pri naplati.",
        },
        {
          type: "paragraph",
          text: "Ova politika ne pokriva naknade platformi trećih strana, kupovine u app store-ovima obrađene van PostSiva, niti usluge koje pružaju integrisani partneri po vlastitim uslovima naplate.",
        },
      ],
    },
    {
      id: "billing",
      title: "3. Planovi pretplate i naplata",
      blocks: [
        {
          type: "list",
          items: [
            "Naknade za pretplatu naplaćuju se unaprijed na početku svakog obračunskog ciklusa (mjesečno ili godišnje)",
            "Sve cijene su prikazane u USD osim ako nije drugačije navedeno pri naplati",
            "Plaćanje se sigurno obrađuje putem naših ovlaštenih partnera za plaćanje (npr. Stripe, PayPal)",
            "Neuspješna ili odbijena plaćanja mogu rezultirati privremenom suspenzijom usluge dok se plaćanje ne riješi",
            "Odgovorni ste da vaši podaci za naplatu budu aktuelni i tačni",
          ],
        },
      ],
    },
    {
      id: "free-trial",
      title: "4. Besplatni probni periodi",
      blocks: [
        {
          type: "paragraph",
          text: "PostSiva može po našem nahođenju ponuditi besplatne probne periode za podobne planove. Tokom besplatnog probnog perioda možete pristupiti određenim funkcijama bez naplate dok probni period ne istekne.",
        },
        {
          type: "list",
          items: [
            "Ako ne otkažete prije isteka probnog perioda, vaš odabrani plaćeni plan će započeti i način plaćanja bit će automatski naplaćen",
            "Samo jedan besplatni probni period po korisniku ili organizaciji osim ako PostSiva drugačije ne odobri",
            "Možemo zahtijevati važeći način plaćanja na evidenciji da biste započeli probni period",
            "Tokom aktivnog besplatnog probnog perioda nema naplata osim ako rano ne pređete na plaćeni plan",
          ],
        },
      ],
    },
    {
      id: "cancellation",
      title: "5. Politika otkazivanja",
      blocks: [
        {
          type: "paragraph",
          text: "Možete otkazati pretplatu u bilo kojem trenutku putem postavki računa pod Postavke → Naplata, ili kontaktiranjem support@postsiva.com.",
        },
        {
          type: "list",
          items: [
            "Otkazivanje stupa na snagu na kraju tekućeg obračunskog perioda",
            "Zadržavate pristup plaćenim funkcijama do kraja plaćenog perioda",
            "Nakon otkazivanja neće biti dodatnih naplata, osim ako ponovo ne aktivirate ili ne kupite novi plan",
            "Otkazivanje automatski ne briše vaš račun niti povezane profile na društvenim mrežama",
            "Preporučujemo da izvezete podatke prije isteka pretplate",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      title: "6. Pravo na povrat",
      blocks: [
        {
          type: "paragraph",
          text: "Kao opšte pravilo, sve naknade za pretplatu nisu povratne nakon što je obračunski period započeo. Međutim, PostSiva može izdati povrate u sljedećim okolnostima:",
        },
        {
          type: "list",
          items: [
            "Duplicirane ili greškom obrađene naplate od strane PostSiva ili našeg pružaoca plaćanja",
            "Neovlaštene transakcije koje su odmah prijavljene i potvrđene od strane našeg tima za naplatu",
            "Produžena nedostupnost usluge uzrokovana isključivo PostSiva infrastrukturom (vidi Odjeljak 12)",
            "Gdje je povrat obavezan prema primjenjivim propisima o zaštiti potrošača ili plaćanjima u vašoj jurisdikciji",
            "Po isključivom nahođenju PostSiva zbog dokumentovanih grešaka u naplati ili izuzetnih okolnosti",
          ],
        },
        {
          type: "note",
          text: "Zahtjevi za povrat moraju biti podneseni u roku od 14 dana od datuma naplate osim ako duži period nije obavezan zakonom u vašoj regiji.",
        },
      ],
    },
    {
      id: "non-refundable",
      title: "7. Stavke koje se ne vraćaju",
      blocks: [
        {
          type: "paragraph",
          text: "Sljedeće nije podobno za povrat:",
        },
        {
          type: "list",
          items: [
            "Djelimični obračunski periodi nakon otkazivanja (uključujući neiskorištene dane u mjesečnom ili godišnjem ciklusu)",
            "Naknade za pretplatu nakon što ste koristili plaćene funkcije tokom obračunskog perioda",
            "Krediti za dodatke, AI paketi korištenja ili jednokratne kupovine nakon isporuke ili potrošnje",
            "Naknade nastale zbog ograničenja API-ja platformi trećih strana ili ograničenja računa",
            "Porezi, naknade za konverziju valuta ili bankovne naknade koje nameće vaša finansijska institucija",
            "Računi ukinuti zbog kršenja naših Uslova korištenja ili Politike prihvatljive upotrebe",
          ],
        },
      ],
    },
    {
      id: "how-to-request",
      title: "8. Kako zatražiti povrat",
      blocks: [
        {
          type: "paragraph",
          text: "Da biste zatražili povrat, kontaktirajte naš tim za naplatu sa sljedećim podacima:",
        },
        {
          type: "list",
          items: [
            "Adresa e-pošte računa povezana s vašom PostSiva pretplatom",
            "Datum i iznos sporne naplate",
            "Referentni broj transakcije ili fakture (ako je dostupan)",
            "Jasan opis razloga za zahtjev za povrat",
          ],
        },
        {
          type: "paragraph",
          text: 'E-pošta: billing@postsiva.com ili support@postsiva.com s predmetom "Zahtjev za povrat — [E-pošta vašeg računa]". Pregledat ćemo vaš zahtjev i odgovoriti u roku od 5 radnih dana.',
        },
      ],
    },
    {
      id: "processing",
      title: "9. Rok obrade povrata",
      blocks: [
        {
          type: "list",
          items: [
            "Odobreni povrati obrađuju se na izvorni način plaćanja korišten pri kupovini",
            "Povrati se obično pojave u roku od 5–10 radnih dana, zavisno od vaše banke ili izdavača kartice",
            "Ako izvorni način plaćanja nije dostupan, možemo ponuditi kredit na računu ili alternativni način povrata",
            "Primit ćete potvrdu e-poštom kada se povrat pokrene",
          ],
        },
      ],
    },
    {
      id: "chargebacks",
      title: "10. Chargebackovi i sporovi o plaćanju",
      blocks: [
        {
          type: "paragraph",
          text: "Podstičemo vas da nas kontaktirate na billing@postsiva.com prije pokretanja chargebacka kod banke ili pružaoca plaćanja. Chargebackovi otvoreni bez prethodnog pokušaja rješavanja mogu rezultirati privremenom suspenzijom računa dok se spor ne istraži.",
        },
        {
          type: "list",
          items: [
            "Procesorima plaćanja ćemo, kada je to potrebno, pružiti evidencije transakcija i dnevnike korištenja usluge",
            "Prevarantski chargebackovi mogu dovesti do trajnog ukidanja računa",
            "Razriješeni chargebackovi u korist PostSiva mogu obnoviti neizmirene salde pretplate",
          ],
        },
      ],
    },
    {
      id: "plan-changes",
      title: "11. Izmjene plana i snižavanja",
      blocks: [
        {
          type: "list",
          items: [
            "Nadogradnje stupaju na snagu odmah; bit će vam naplaćen proporcionalni iznos za ostatak obračunskog ciklusa",
            "Snižavanja stupaju na snagu na početku sljedećeg obračunskog ciklusa",
            "Za snižavanja tokom aktivnog obračunskog perioda ne izdaju se povrati niti krediti",
            "Izmjene godišnjih planova mogu biti podložne dodatnim uslovima prikazanim pri naplati",
          ],
        },
      ],
    },
    {
      id: "service-outages",
      title: "12. Prekidi usluge",
      blocks: [
        {
          type: "paragraph",
          text: "Ako PostSiva doživi materijalni prekid usluge koji traje duže od 72 uzastopna sata zbog problema unutar naše kontrole (isključujući zakazano održavanje, prekide API-ja platformi trećih strana ili događaje više sile), podobni korisnici na pogođenim plaćenim planovima mogu zatražiti proporcionalni kredit ili povrat za pogođeni period.",
        },
        {
          type: "paragraph",
          text: "Prekidi uzrokovani povezanim društvenim mrežama, internetskim pružaocima usluga ili problemima konfiguracije na strani korisnika nisu obuhvaćeni ovim odjeljkom.",
        },
      ],
    },
    {
      id: "contact",
      title: "13. Kontakt informacije",
      blocks: [
        {
          type: "paragraph",
          text: "Za pitanja o naplati, povratu ili otkazivanju, kontaktirajte:",
        },
        {
          type: "list",
          items: [
            "Naplata i povrati: billing@postsiva.com",
            "Opšta podrška: support@postsiva.com",
            "Pravno odjeljenje: legal@postsiva.com",
          ],
        },
        {
          type: "paragraph",
          text: "PostSiva — Odjeljenje za naplatu. Radno vrijeme odgovora: ponedjeljak–petak, 9:00 – 18:00 (UTC). Ciljamo odgovoriti na sve upite o povratu u roku od 5 radnih dana.",
        },
      ],
    },
  ],
  footer:
    "© 2026 PostSiva. Sva prava zadržana. Ova Politika povrata može se s vremena na vrijeme ažurirati. Bitne izmjene bit će objavljene na ovoj stranici s ažuriranim datumom stupanja na snagu.",
};
