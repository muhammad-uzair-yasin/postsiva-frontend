import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";

export const referralPolicyDocumentBs: LegalDocument = {
  title: "Politika programa preporuka",
  lastUpdated: "14. juli 2026.",
  effectiveDate: "14. juli 2026.",
  intro:
    'Ova Politika programa preporuka objašnjava kako PostSiva ("mi," "naš" ili "nas") nagrađuje korisnike koji preporuče nove klijente. Treba je čitati zajedno s našim Uslovima korištenja i Politikom privatnosti.',
  notice:
    "Učešće u programu Refer & Earn znači da pristajete na ova pravila. Program možemo izmijeniti ili ukinuti u bilo kojem trenutku.",
  toc: [
    { id: "overview", label: "1. Pregled" },
    { id: "eligibility", label: "2. Pravo na učešće" },
    { id: "rewards", label: "3. Novčane nagrade" },
    { id: "milestone", label: "4. Prekretnica Pro mjeseca" },
    { id: "withdrawals", label: "5. Isplate" },
    { id: "prohibited", label: "6. Zabranjeno ponašanje" },
    { id: "changes", label: "7. Izmjene" },
    { id: "contact", label: "8. Kontakt" },
  ],
  sections: [
    {
      id: "overview",
      title: "1. Pregled",
      blocks: [
        {
          type: "paragraph",
          text: "Podobni korisnici dobijaju jedinstveni link za preporuku. Kada se novi klijent registruje putem tog linka i dovrši prvu plaćenu pretplatu, možete zaraditi novčani kredit u svom Postsiva novčaniku preporuka.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "2. Pravo na učešće",
      blocks: [
        {
          type: "list",
          items: [
            "Morate imati verifikovan Postsiva račun.",
            "Preporučena osoba mora biti novi Postsiva korisnik pripisan vašem linku pri registraciji.",
            "Samo-preporuke (korištenje vlastitog linka za račune koje kontrolišete) nisu dozvoljene.",
            "Svaki preporučeni korisnik može biti pripisan samo jednom.",
          ],
        },
      ],
    },
    {
      id: "rewards",
      title: "3. Novčane nagrade",
      blocks: [
        {
          type: "list",
          items: [
            "Starter plan ($10/mj): $0.25 USD po kvalifikovanom prvom plaćanju.",
            "Pro plan ($29/mj): $1.00 USD po kvalifikovanom prvom plaćanju.",
            "Nagrade se primjenjuju samo na prvi uspješni plaćeni mjesec preporučenog korisnika — ne na obnove.",
            "Krediti se dodaju nakon uspješne potvrde plaćanja (bez perioda čekanja).",
            "Godišnje naplate zarađuju isti fiksni iznos (ne množi se s 12).",
          ],
        },
      ],
    },
    {
      id: "milestone",
      title: "4. Prekretnica Pro mjeseca",
      blocks: [
        {
          type: "paragraph",
          text: "Nakon što ostvarite 10 kreditovanih plaćenih preporuka, dobijate jednokratno pravo na jednomjesečni Postsiva Pro bez naknade, uz novčane nagrade. Ako već imate aktivnu plaćenu Pro pretplatu kada dostignete prekretnicu, evidentiramo prekretnicu kao iskorištenu bez dodavanja dodatnog prava.",
        },
      ],
    },
    {
      id: "withdrawals",
      title: "5. Isplate",
      blocks: [
        {
          type: "list",
          items: [
            "Minimalni saldo za isplatu: $25.00 USD.",
            "Isplate se obrađuju ručno nakon što podnesete zahtjev s podacima za isplatu.",
            "Možemo pregledati zahtjeve i odbiti one koji djeluju prevarantski ili nepotpuni.",
            "Obrada se obično vrši u serijama (npr. mjesečno); rok nije garantovan.",
          ],
        },
      ],
    },
    {
      id: "prohibited",
      title: "6. Zabranjeno ponašanje",
      blocks: [
        {
          type: "paragraph",
          text: "Ne smijete kreirati lažne račune, koristiti ukradene načine plaćanja, spamovati niti na drugi način zloupotrebljavati program. Možemo poništiti kredite, zamrznuti novčanike, odbiti isplate ili suspendovati račune zbog zloupotrebe.",
        },
      ],
    },
    {
      id: "changes",
      title: "7. Izmjene",
      blocks: [
        {
          type: "paragraph",
          text: "Iznosi nagrada, ponude prekretnica i pravila isplate mogu se mijenjati. Bitna ažuriranja bit će odražena na ovoj stranici i/ili u obavještenjima u proizvodu.",
        },
      ],
    },
    {
      id: "contact",
      title: "8. Kontakt",
      blocks: [
        {
          type: "paragraph",
          text: "Pitanja o preporukama ili isplatama: support@postsiva.com",
        },
      ],
    },
  ],
  footer: "© 2026 PostSiva. Sva prava zadržana.",
};
