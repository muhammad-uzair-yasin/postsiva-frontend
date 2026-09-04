export type SuggestedFeedCategory =
  | "news"
  | "business"
  | "finance"
  | "technology"
  | "ai"
  | "marketing"
  | "science"
  | "sports"
  | "entertainment"
  | "health"
  | "travel"
  | "design"
  | "development";

export type SuggestedFeedCountry =
  | "global"
  | "pk"
  | "usa"
  | "ba"
  | "gb"
  | "ca"
  | "au"
  | "jp"
  | "de"
  | "fr"
  | "sa"
  | "tr"
  | "sg"
  | "ng"
  | "ps"
  | "hr"
  | "rs"
  | "me"
  | "al"
  | "xk"
  | "id"
  | "my"
  | "bd"
  | "eg"
  | "ma";

export interface SuggestedRssFeed {
  name: string;
  url: string;
  blurb: string;
  category: SuggestedFeedCategory;
  country: SuggestedFeedCountry;
}

function feed(
  name: string,
  url: string,
  blurb: string,
  category: SuggestedFeedCategory,
  country: SuggestedFeedCountry = "global",
): SuggestedRssFeed {
  return { name, url, blurb, category, country };
}

/** Curated RSS feeds users can one-click subscribe to. */
export const SUGGESTED_RSS_FEEDS = [
  feed("BBC News", "https://feeds.bbci.co.uk/news/rss.xml", "World & UK news", "news"),
  feed("The Guardian", "https://www.theguardian.com/world/rss", "World news", "news"),
  feed("USA - NPR News", "https://feeds.npr.org/1001/rss.xml", "US public radio", "news", "usa"),
  feed("USA - NPR National", "https://feeds.npr.org/1003/rss.xml", "US national news", "news", "usa"),
  feed("NPR World", "https://feeds.npr.org/1004/rss.xml", "World news", "news"),
  feed("USA - PBS NewsHour", "https://www.pbs.org/newshour/feeds/rss/headlines", "US headlines", "news", "usa"),
  feed("USA - NYTimes US", "https://rss.nytimes.com/services/xml/rss/nyt/US.xml", "US news", "news", "usa"),
  feed("UK - BBC UK", "https://feeds.bbci.co.uk/news/uk/rss.xml", "UK news", "news", "gb"),
  feed("UK - Sky News", "https://feeds.skynews.com/feeds/rss/home.xml", "UK headlines", "news", "gb"),
  feed("UK - The Independent", "https://www.independent.co.uk/news/rss", "UK news", "news", "gb"),
  feed("Canada - CBC Canada", "https://www.cbc.ca/cmlink/rss-canada", "Canada news", "news", "ca"),
  feed("Australia - ABC Top Stories", "https://www.abc.net.au/news/feed/51120/rss.xml", "Australia news", "news", "au"),
  feed("Australia - ABC Just In", "https://www.abc.net.au/news/feed/52498/rss.xml", "Australia latest", "news", "au"),
  feed("Australia - SMH", "https://www.smh.com.au/rss/feed.xml", "Australia headlines", "news", "au"),
  feed("Japan - NHK World", "https://www3.nhk.or.jp/rss/news/cat0.xml", "Japan & world", "news", "jp"),
  feed("Germany - Spiegel International", "https://www.spiegel.de/international/index.rss", "Germany & world", "news", "de"),
  feed("France - France24", "https://www.france24.com/en/rss", "France & world", "news", "fr"),
  feed("France - Le Monde EN", "https://www.lemonde.fr/rss/en_continu.xml", "France news", "news", "fr"),
  feed("Saudi - Arab News", "https://www.arabnews.com/rss.xml", "Saudi & regional", "news", "sa"),
  feed("Turkey - Daily Sabah", "https://www.dailysabah.com/rssFeed/latest-news", "Turkey news", "news", "tr"),
  feed("Singapore - CNA", "https://www.channelnewsasia.com/rssfeeds/8395884", "Singapore news", "news", "sg"),
  feed("Nigeria - Premium Times", "https://www.premiumtimesng.com/feed", "Nigeria news", "news", "ng"),
  feed("Palestine - Middle East Monitor", "https://www.middleeastmonitor.com/feed/", "Palestine & region", "news", "ps"),
  feed("Palestine - Mondoweiss", "https://mondoweiss.net/feed/", "Palestine analysis", "news", "ps"),
  feed("Palestine - Global Voices", "https://globalvoices.org/-/world/middle-east-north-africa/palestine/feed/", "Palestine stories", "news", "ps"),
  feed("Croatia - Total Croatia News", "https://total-croatia-news.com/feed/", "Croatia news", "news", "hr"),
  feed("Serbia - Balkan Insight", "https://balkaninsight.com/category/bi/serbia/feed/", "Serbia news", "news", "rs"),
  feed("Montenegro - Balkan Insight", "https://balkaninsight.com/category/bi/montenegro/feed/", "Montenegro news", "news", "me"),
  feed("Albania - Balkan Insight", "https://balkaninsight.com/category/bi/albania/feed/", "Albania news", "news", "al"),
  feed("Kosovo - Balkan Insight", "https://balkaninsight.com/category/bi/kosovo/feed/", "Kosovo news", "news", "xk"),
  feed("Indonesia - Antara EN", "https://en.antaranews.com/rss/news.xml", "Indonesia news", "news", "id"),
  feed("Indonesia - Global Voices", "https://globalvoices.org/-/world/east-asia/indonesia/feed/", "Indonesia stories", "news", "id"),
  feed("Malaysia - Global Voices", "https://globalvoices.org/-/world/east-asia/malaysia/feed/", "Malaysia stories", "news", "my"),
  feed("Bangladesh - Daily Star", "https://www.thedailystar.net/rss.xml", "Bangladesh news", "news", "bd"),
  feed("Bangladesh - Global Voices", "https://globalvoices.org/-/world/south-asia/bangladesh/feed/", "Bangladesh stories", "news", "bd"),
  feed("Egypt - Global Voices", "https://globalvoices.org/-/world/middle-east-north-africa/egypt/feed/", "Egypt stories", "news", "eg"),
  feed("Morocco - Global Voices", "https://globalvoices.org/-/world/middle-east-north-africa/morocco/feed/", "Morocco stories", "news", "ma"),
  feed("VOA USA", "https://www.voanews.com/api/zqboml-vomx-tpeivmy", "US news", "news", "usa"),
  feed("VOA South & Central Asia", "https://www.voanews.com/api/z_-mqyl-vomx-tpevyvqv", "Pakistan region", "news", "pk"),
  feed("VOA Europe", "https://www.voanews.com/api/zjbovl-vomx-tpebvmr", "Europe & Bosnia", "news", "ba"),
  feed("PK - Dawn", "https://www.dawn.com/feeds/home", "Pakistan news", "news", "pk"),
  feed("PK - Express Tribune", "https://tribune.com.pk/feed/home", "Pakistan headlines", "news", "pk"),
  feed("PK - Express Tribune Latest", "https://tribune.com.pk/feed/latest", "Pakistan latest", "news", "pk"),
  feed("PK - Express Tribune Pakistan", "https://tribune.com.pk/feed/pakistan", "Pakistan news", "news", "pk"),
  feed("PK - Geo News", "https://www.geo.tv/rss/1/1", "Pakistan news", "news", "pk"),
  feed("PK - ARY News", "https://arynews.tv/feed/", "Pakistan headlines", "news", "pk"),
  feed("BA - N1 Bosnia", "https://n1info.ba/feed/", "Bosnia headlines", "news", "ba"),
  feed("BA - Haber", "https://haber.ba/feed", "Bosnia news", "news", "ba"),

  feed("Financial Times", "https://www.ft.com/rss/home", "Business & economy", "business"),
  feed("Forbes Business", "https://www.forbes.com/business/feed/", "Business leaders", "business"),
  feed("Entrepreneur", "https://www.entrepreneur.com/latest.rss", "Startups & growth", "business"),
  feed("Fast Company", "https://www.fastcompany.com/rss.xml", "Innovation & work", "business"),
  feed("Fortune", "https://fortune.com/feed/", "Business & leadership", "business", "usa"),
  feed("BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml", "Global business", "business"),
  feed("NPR Business", "https://feeds.npr.org/1006/rss.xml", "Business news", "business", "usa"),
  feed("VOA Economy", "https://www.voanews.com/api/zyboql-vomx-tpetvmi", "Economy news", "business"),
  feed("USA - Inc.", "https://www.inc.com/rss", "Business & startups", "business", "usa"),
  feed("PK - Dawn Business", "https://www.dawn.com/feeds/business", "Pakistan business", "business", "pk"),
  feed("PK - Business Recorder", "https://www.brecorder.com/feeds/latest-news", "Pakistan business", "business", "pk"),
  feed("PK - Express Tribune Business", "https://tribune.com.pk/feed/business", "Pakistan business", "business", "pk"),
  feed("BA - Akta", "https://www.akta.ba/rss", "Bosnia business", "business", "ba"),

  feed("WSJ Markets", "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", "Markets & finance", "finance"),
  feed("MarketWatch", "https://www.marketwatch.com/rss/topstories", "Markets & business", "finance", "usa"),
  feed("CNBC Markets", "https://www.cnbc.com/id/10001147/device/rss/rss.html", "Market updates", "finance", "usa"),
  feed("SEC Press Releases", "https://www.sec.gov/news/pressreleases.rss", "Markets & regulation", "finance", "usa"),
  feed("CNBC Investing", "https://www.cnbc.com/id/15839069/device/rss/rss.html", "Investing news", "finance", "usa"),
  feed("Federal Reserve Press", "https://www.federalreserve.gov/feeds/press_all.xml", "Economic releases", "finance", "usa"),

  feed("The Verge", "https://www.theverge.com/rss/index.xml", "Tech & culture", "technology"),
  feed("TechCrunch", "https://techcrunch.com/feed/", "Startups & tech", "technology"),
  feed("Wired", "https://www.wired.com/feed/rss", "Science & tech", "technology"),
  feed("Hacker News", "https://hnrss.org/frontpage", "Tech discussion", "technology"),
  feed("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index", "Tech analysis", "technology"),
  feed("Engadget", "https://www.engadget.com/rss.xml", "Consumer tech", "technology"),
  feed("TechRadar", "https://www.techradar.com/rss", "Tech news", "technology"),
  feed("Mashable Tech", "https://mashable.com/feeds/rss/tech", "Digital culture", "technology"),
  feed("ZDNET", "https://www.zdnet.com/news/rss.xml", "Business tech", "technology"),
  feed("NPR Technology", "https://feeds.npr.org/1019/rss.xml", "Technology news", "technology", "usa"),
  feed("VOA Technology", "https://www.voanews.com/api/zyritl-vomx-tpettmq", "Technology news", "technology"),
  feed("PK - Express Tribune Technology", "https://tribune.com.pk/feed/technology", "Pakistan tech", "technology", "pk"),

  feed("VentureBeat AI", "https://venturebeat.com/category/ai/feed/", "AI industry", "ai"),
  feed("Google AI Blog", "https://blog.google/technology/ai/rss/", "AI product news", "ai"),
  feed("OpenAI Blog", "https://openai.com/news/rss.xml", "AI updates", "ai"),
  feed("AI News", "https://www.artificialintelligence-news.com/feed/", "AI industry news", "ai"),
  feed("MarkTechPost", "https://www.marktechpost.com/feed/", "AI research news", "ai"),
  feed("Machine Learning Mastery", "https://machinelearningmastery.com/feed/", "ML tutorials", "ai"),
  feed("NVIDIA Blog", "https://blogs.nvidia.com/feed/", "AI and GPU news", "ai", "usa"),
  feed("NVIDIA Developer", "https://developer.nvidia.com/blog/feed/", "AI developer news", "ai", "usa"),
  feed("The Gradient", "https://thegradient.pub/rss/", "AI research essays", "ai"),
  feed("Sebastian Raschka", "https://magazine.sebastianraschka.com/feed", "Machine learning", "ai"),

  feed("HubSpot Marketing", "https://blog.hubspot.com/marketing/rss.xml", "Marketing strategy", "marketing"),
  feed("Social Media Examiner", "https://www.socialmediaexaminer.com/feed/", "Social marketing", "marketing"),
  feed("Social Media Today", "https://www.socialmediatoday.com/feeds/news/", "Social media news", "marketing"),
  feed("Buffer Blog", "https://buffer.com/resources/feed/", "Social media strategy", "marketing"),
  feed("Hootsuite Blog", "https://blog.hootsuite.com/feed/", "Social media management", "marketing"),
  feed("Sprout Social Insights", "https://sproutsocial.com/insights/feed/", "Social media insights", "marketing"),
  feed("Agorapulse Blog", "https://www.agorapulse.com/blog/feed/", "Social media tips", "marketing"),
  feed("Tailwind Blog", "https://www.tailwindapp.com/blog/feed", "Pinterest & Instagram tips", "marketing"),
  feed("Planable Blog", "https://planable.io/blog/feed/", "Social media workflow", "marketing"),
  feed("Adweek Social Pro Daily", "https://www.adweek.com/category/social-pro-daily/feed/", "Social platform news", "marketing", "usa"),
  feed("Social Media Explorer", "https://socialmediaexplorer.com/feed/", "Social media trends", "marketing"),
  feed("Ignite Social Media", "https://www.ignitesocialmedia.com/feed/", "Social strategy", "marketing"),
  feed("Convince & Convert", "https://www.convinceandconvert.com/feed/", "Social content strategy", "marketing"),
  feed("Neal Schaffer", "https://nealschaffer.com/feed/", "Social media marketing", "marketing"),
  feed("Jenns Trends", "https://www.jennstrends.com/feed/", "Instagram marketing", "marketing"),
  feed("Mention Blog", "https://mention.com/en/blog/feed/", "Social listening", "marketing"),
  feed("Metricool Blog", "https://metricool.com/feed/", "Social analytics", "marketing"),
  feed("Loomly Blog", "https://blog.loomly.com/feed/", "Social planning", "marketing"),
  feed("LinkedIn Marketing Blog", "https://www.linkedin.com/business/marketing/blog.rss", "LinkedIn marketing", "marketing"),
  feed("Meta Business News", "https://www.facebook.com/business/news/rss", "Meta business updates", "marketing"),
  feed("Marketing Brew", "https://marketingbrew.com/feed.xml", "Marketing news", "marketing"),
  feed("Search Engine Land", "https://searchengineland.com/feed", "Search marketing", "marketing"),
  feed("Adweek", "https://www.adweek.com/feed/", "Advertising news", "marketing"),
  feed("MarTech", "https://martech.org/feed/", "Marketing tech", "marketing"),

  feed("NASA News", "https://www.nasa.gov/rss/dyn/breaking_news.rss", "Space & science", "science"),
  feed("ScienceDaily Top", "https://www.sciencedaily.com/rss/top.xml", "Science headlines", "science"),
  feed("ScienceDaily All", "https://www.sciencedaily.com/rss/all.xml", "All science news", "science"),
  feed("ScienceDaily Science", "https://www.sciencedaily.com/rss/top/science.xml", "Science research", "science"),
  feed("ScienceDaily Technology", "https://www.sciencedaily.com/rss/matter_energy/technology.xml", "Science tech", "science"),
  feed("ScienceDaily Environment", "https://www.sciencedaily.com/rss/top/environment.xml", "Environment research", "science"),
  feed("ScienceDaily Society", "https://www.sciencedaily.com/rss/top/society.xml", "Society research", "science"),
  feed("NPR Science", "https://feeds.npr.org/1007/rss.xml", "Science news", "science", "usa"),
  feed("NPR Climate", "https://feeds.npr.org/1167/rss.xml", "Climate news", "science", "usa"),
  feed("VOA Science & Health", "https://www.voanews.com/api/ztbopl-vomx-tpekvmm", "Science & health", "science"),
  feed("USGS Significant Earthquakes", "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.atom", "Earthquake alerts", "science", "usa"),

  feed("ESPN Top", "https://www.espn.com/espn/rss/news", "Sports headlines", "sports", "usa"),
  feed("ESPN NBA", "https://www.espn.com/espn/rss/nba/news", "NBA news", "sports", "usa"),
  feed("ESPN NFL", "https://www.espn.com/espn/rss/nfl/news", "NFL news", "sports", "usa"),
  feed("BBC Sport", "https://feeds.bbci.co.uk/sport/rss.xml", "Sports news", "sports"),
  feed("CBS Sports", "https://www.cbssports.com/rss/headlines/", "US sports", "sports", "usa"),
  feed("CBS Sports NFL", "https://www.cbssports.com/rss/headlines/nfl/", "NFL headlines", "sports", "usa"),
  feed("Sky Sports Football", "https://www.skysports.com/rss/12040", "Football news", "sports"),
  feed("PK - Express Tribune Sports", "https://tribune.com.pk/feed/sports", "Pakistan sports", "sports", "pk"),

  feed("Variety", "https://variety.com/feed/", "Entertainment business", "entertainment", "usa"),
  feed("Hollywood Reporter", "https://www.hollywoodreporter.com/feed/", "Hollywood news", "entertainment", "usa"),
  feed("Rolling Stone", "https://www.rollingstone.com/feed/", "Music & culture", "entertainment", "usa"),
  feed("Mashable Entertainment", "https://mashable.com/feeds/rss/entertainment", "Pop culture", "entertainment"),
  feed("Deadline", "https://deadline.com/feed/", "Entertainment industry", "entertainment", "usa"),
  feed("Billboard", "https://www.billboard.com/feed/", "Music news", "entertainment", "usa"),
  feed("PK - Express Tribune Entertainment", "https://tribune.com.pk/feed/entertainment", "Pakistan entertainment", "entertainment", "pk"),

  feed("NPR Health", "https://feeds.npr.org/1128/rss.xml", "Health news", "health", "usa"),
  feed("WHO News", "https://www.who.int/rss-feeds/news-english.xml", "Global health", "health"),
  feed("CDC Newsroom", "https://tools.cdc.gov/api/v2/resources/media/132608.rss", "US public health", "health", "usa"),
  feed("FDA Press Releases", "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml", "US health notices", "health", "usa"),
  feed("ScienceDaily Health", "https://www.sciencedaily.com/rss/health_medicine.xml", "Health research", "health"),
  feed("PK - Express Tribune Health", "https://tribune.com.pk/feed/health", "Pakistan health", "health", "pk"),

  feed("BBC Travel", "https://www.bbc.com/travel/feed.rss", "Travel stories", "travel"),
  feed("Conde Nast Traveler", "https://www.cntraveler.com/feed/rss", "Travel inspiration", "travel", "usa"),
  feed("The Points Guy", "https://thepointsguy.com/feed/", "Travel rewards", "travel"),
  feed("Nomadic Matt", "https://www.nomadicmatt.com/feed/", "Budget travel", "travel"),

  feed("Smashing Magazine", "https://www.smashingmagazine.com/feed/", "Design & UX", "design"),
  feed("Nielsen Norman Group", "https://www.nngroup.com/feed/rss/", "UX research", "design"),
  feed("Creative Bloq", "https://www.creativebloq.com/feeds.xml", "Creative design", "design"),
  feed("Webdesigner Depot", "https://www.webdesignerdepot.com/feed/", "Web design", "design"),

  feed("CSS-Tricks", "https://css-tricks.com/feed/", "Frontend CSS", "development"),
  feed("Dev.to", "https://dev.to/feed", "Developer posts", "development"),
  feed("GitHub Blog", "https://github.blog/feed/", "Developer platform", "development"),
  feed("Mozilla Hacks", "https://hacks.mozilla.org/feed/", "Web platform", "development"),
  feed("Microsoft DevBlogs", "https://devblogs.microsoft.com/feed/", "Developer news", "development", "usa"),
  feed("Stack Overflow Blog", "https://stackoverflow.blog/feed/", "Developer culture", "development"),
  feed("SitePoint", "https://www.sitepoint.com/sitepoint.rss", "Web development", "development"),
] as const satisfies readonly SuggestedRssFeed[];

export function normalizeFeedUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    const path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.protocol}//${u.host.toLowerCase()}${path}${u.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
