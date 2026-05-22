/**
 * fetch_news.js  –  Automated News Aggregator  –  Premium Backend Pipeline
 *
 * Strategy (κόστος-αποδοτικό):
 *   1. Fetch 50 άρθρα από TechCrunch RSS
 *   2. Αφαίρεση duplicates (βάσει GUID)
 *   3. ΜΟΝΟ 1 κλήση στο Claude:  επιλογή top-20  +  μετάφραση  +  3 bullets
 *   4. Mock Mode αν δεν υπάρχει API key (δωρεάν test)
 *   5. Save στο all_news.json
 *
 * Κόστος εκτίμηση (claude-3-5-haiku): ~$0.01 ανά run
 */

import 'dotenv/config';
import fs   from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import RSSParser from 'rss-parser';
import Anthropic  from '@anthropic-ai/sdk';

// ─── Config ────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  rssUrl       : 'https://techcrunch.com/feed/',
  fetchCount   : 50,   // πόσα να κατεβάσουμε από RSS
  targetSelect : 20,   // πόσα να κρατήσουμε τελικά
  outputFile   : path.join(__dirname, 'all_news.json'),
  // Χρησιμοποιούμε haiku – ταχύτατο & φθηνό για αυτή τη δουλειά
  model        : process.env.CLAUDE_MODEL || 'claude-haiku-4-5',
  maxTokens    : 6000,  // αρκετό για 20 άρθρα με bullets
};

const IS_MOCK = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.trim() === '';

// ─── Logging ───────────────────────────────────────────────────────────────

const log = {
  info : (m) => console.log(`\x1b[36m[INFO]\x1b[0m  ${m}`),
  ok   : (m) => console.log(`\x1b[32m[OK]\x1b[0m    ${m}`),
  warn : (m) => console.log(`\x1b[33m[WARN]\x1b[0m  ${m}`),
  err  : (m) => console.error(`\x1b[31m[ERROR]\x1b[0m ${m}`),
  mock : (m) => console.log(`\x1b[35m[MOCK]\x1b[0m  ${m}`),
  step : (m) => console.log(`\n\x1b[1m▶ ${m}\x1b[0m`),
};

// ─── Utilities ────────────────────────────────────────────────────────────

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z#\d]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text, max = 250) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

async function loadExisting() {
  try {
    const raw = await fs.readFile(CONFIG.outputFile, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function saveNews(articles) {
  await fs.writeFile(CONFIG.outputFile, JSON.stringify(articles, null, 2), 'utf-8');
}

// ─── Mock Mode ────────────────────────────────────────────────────────────

/**
 * Ανιχνεύει τον τύπο άρθρου από τίτλο/categories
 * και επιστρέφει ρεαλιστικά ελληνικά bullets.
 */
function detectArticleType(title = '', categories = []) {
  const t = (title + ' ' + categories.join(' ')).toLowerCase();
  if (/\bai\b|artificial intelligence|machine learning|llm|gpt|claude|gemini|openai|anthropic|neural|chatbot/.test(t)) return 'ai';
  if (/fund|raise|million|billion|series [abcde]|seed|invest|valuation|venture/.test(t)) return 'funding';
  if (/acqui|merger|buy|purchase|takeover|deal/.test(t)) return 'acquisition';
  if (/security|hack|breach|vulnerab|privacy|data leak|ransomware|phishing/.test(t)) return 'security';
  if (/ipo|public|stock|shares|nasdaq|nyse|market cap|wall street/.test(t)) return 'ipo';
  if (/launch|release|announce|new product|unveil|debut|introduces/.test(t)) return 'product';
  if (/layoff|job cut|restructur|shutdown|clos|bankrupt|fired/.test(t)) return 'layoffs';
  if (/regulation|law|bill|court|government|ftc|gdpr|policy|ban/.test(t)) return 'policy';
  if (/apple|google|microsoft|amazon|meta|samsung|nvidia|tesla/.test(t)) return 'bigtech';
  return 'general';
}

const MOCK_TEMPLATES = {
  ai: {
    prefix : 'AI:',
    bullets: [
      '**Ανακάλυψη:** Νέο AI σύστημα παρουσιάζει εντυπωσιακές δυνατότητες σε reasoning και κατανόηση γλώσσας.',
      '**Εφαρμογές:** Η τεχνολογία αναμένεται να αλλάξει τομείς όπως η υγεία, η εκπαίδευση και η παραγωγικότητα.',
      '**Ανταγωνισμός:** Οι μεγάλοι τεχνολογικοί κολοσσοί εντείνουν τον αγώνα δρόμου για υπεροχή στο AI.'
    ],
  },
  funding: {
    prefix : 'Χρηματοδότηση:',
    bullets: [
      '**Επενδυτές:** Κορυφαία venture capital funds συμμετέχουν στον γύρο χρηματοδότησης αξίας εκατομμυρίων.',
      '**Στρατηγική:** Τα κεφάλαια θα χρησιμοποιηθούν για επέκταση σε νέες αγορές και ανάπτυξη προϊόντων.',
      '**Αγορά:** Η αποτίμηση αντικατοπτρίζει τη ζήτηση επενδυτών για καινοτόμες tech λύσεις.'
    ],
  },
  acquisition: {
    prefix : 'Εξαγορά:',
    bullets: [
      '**Συμφωνία:** Η εξαγορά αποτελεί μια από τις σημαντικότερες κινήσεις στον κλάδο για φέτος.',
      '**Συνέργειες:** Η ενοποίηση αναμένεται να δημιουργήσει ισχυρό ανταγωνιστικό πλεονέκτημα.',
      '**Κανονιστικό:** Οι ρυθμιστικές αρχές εξετάζουν τις επιπτώσεις στον ανταγωνισμό της αγοράς.'
    ],
  },
  security: {
    prefix : 'Ασφάλεια:',
    bullets: [
      '**Παραβίαση:** Εντοπίστηκε σοβαρή ευπάθεια που ενδέχεται να επηρεάζει εκατομμύρια χρήστες παγκοσμίως.',
      '**Αντίδραση:** Η εταιρεία εξέδωσε άμεση ανακοίνωση και προχωρά σε επείγουσα ενημέρωση συστημάτων.',
      '**Επίπτωση:** Το περιστατικό ανοίγει εκ νέου τη συζήτηση για τα standards κυβερνοασφάλειας.'
    ],
  },
  ipo: {
    prefix : 'Χρηματιστήριο:',
    bullets: [
      '**Εισαγωγή:** Η εταιρεία κάνει το βήμα προς τις δημόσιες αγορές σε μια κρίσιμη συγκυρία.',
      '**Αποτίμηση:** Οι αναλυτές εκτιμούν αποτίμηση που αντικατοπτρίζει ισχυρές προοπτικές ανάπτυξης.',
      '**Επενδυτές:** Το IPO προσελκύει ενδιαφέρον από θεσμικούς και private equity επενδυτές.'
    ],
  },
  product: {
    prefix : 'Λανσάρισμα:',
    bullets: [
      '**Προϊόν:** Η νέα κυκλοφορία φέρνει καινοτόμα features που απαντούν σε πραγματικές ανάγκες αγοράς.',
      '**Τεχνολογία:** Το προϊόν ενσωματώνει state-of-the-art τεχνολογία για ανώτερη εμπειρία χρήστη.',
      '**Αγορά:** Αναμένεται να ανταγωνιστεί άμεσα τα κυρίαρχα προϊόντα του κλάδου.'
    ],
  },
  layoffs: {
    prefix : 'Αναδιάρθρωση:',
    bullets: [
      '**Κινήσεις:** Η εταιρεία ανακοινώνει μείωση προσωπικού ως μέρος ευρύτερης στρατηγικής αναδιάρθρωσης.',
      '**Αιτίες:** Το δύσκολο μακροοικονομικό περιβάλλον και η ανάγκη κερδοφορίας οδηγούν στην απόφαση.',
      '**Προοπτική:** Η διοίκηση εστιάζει σε βασικούς τομείς για να διασφαλίσει μακροπρόθεσμη βιωσιμότητα.'
    ],
  },
  policy: {
    prefix : 'Νομοθεσία:',
    bullets: [
      '**Ρύθμιση:** Νέα νομοθετική πρωτοβουλία θέτει αυστηρότερα πλαίσια για τις τεχνολογικές εταιρείες.',
      '**Αντίδραση:** Ο κλάδος εκφράζει ανησυχίες για τις επιπτώσεις στην καινοτομία και τον ανταγωνισμό.',
      '**Χρονοδιάγραμμα:** Οι νέοι κανόνες αναμένεται να τεθούν σε ισχύ μέσα στους επόμενους μήνες.'
    ],
  },
  bigtech: {
    prefix : 'Big Tech:',
    bullets: [
      '**Στρατηγική:** Ο τεχνολογικός κολοσσός ανακοινώνει νέα κατεύθυνση που επηρεάζει εκατομμύρια χρήστες.',
      '**Ανταγωνισμός:** Η κίνηση αλλάζει τα δεδομένα στην αγορά και πιέζει τους ανταγωνιστές.',
      '**Οικοσύστημα:** Developers και επιχειρήσεις καλούνται να προσαρμοστούν στη νέα πραγματικότητα.'
    ],
  },
  general: {
    prefix : 'Tech:',
    bullets: [
      '**Εξέλιξη:** Σημαντική ανάπτυξη στον τεχνολογικό κλάδο που αξίζει προσοχής από επαγγελματίες.',
      '**Επίπτωση:** Η εξέλιξη αυτή αναμένεται να επηρεάσει την αγορά τους επόμενους μήνες.',
      '**Τάση:** Αποτελεί μέρος μιας ευρύτερης τάσης μετασχηματισμού στον ψηφιακό κόσμο.'
    ],
  },
};

/** Δημιουργεί mock ελληνικό τίτλο κρατώντας ονόματα & αριθμούς */
function makeMockGreekTitle(engTitle) {
  const parts = engTitle.split(':');
  if (parts.length > 1) {
    // Πχ "OpenAI raises $6B: ..." → κρατάμε entities
    return `[MOCK] ${engTitle.slice(0, 80)}`;
  }
  return `[MOCK] ${engTitle.slice(0, 80)}`;
}

function generateMockArticleData(article) {
  const type    = detectArticleType(article.originalTitle, article.categories);
  const tmpl    = MOCK_TEMPLATES[type];
  return {
    greekTitle : makeMockGreekTitle(article.originalTitle),
    bullets    : tmpl.bullets,
  };
}

// ─── Claude API (Single-Call Strategy) ────────────────────────────────────

/**
 * ΜΟΝΟ 1 API κλήση:
 *   • Επιλέγει τα top-N από τη λίστα
 *   • Επιστρέφει greekTitle + 3 bullets για κάθε επιλεγμένο άρθρο
 *
 * Κόστος: ~$0.01 για 50 inputs → 20 outputs (claude-3-5-haiku)
 */
async function curateAndTranslate(client, articles, targetCount) {
  const articleList = articles
    .map((a, i) => {
      const cats = a.categories.slice(0, 3).join(', ') || 'Tech';
      return `[${i}] TITLE: ${a.originalTitle}\nCATEGORIES: ${cats}\nSNIPPET: ${truncate(a.snippet, 200)}`;
    })
    .join('\n\n---\n\n');

  const prompt = `You are a Senior Tech Editor at a premier tech publication. Your job is to curate and localize tech news for a Greek-speaking professional audience.

From the ${articles.length} TechCrunch articles below, select the ${targetCount} MOST IMPACTFUL ones for a tech/business audience.

SELECTION CRITERIA (strict priority):
1. Major AI/ML breakthroughs or product launches from top labs
2. Significant funding rounds (>$20M), acquisitions, or IPOs
3. Big tech company strategic moves (Apple, Google, Meta, Microsoft, Nvidia, OpenAI, etc.)
4. Important regulatory/policy changes affecting the tech industry
5. Serious security incidents or major data breaches
6. Notable startup milestones, pivots, or shutdowns

EXCLUDE: opinion pieces, minor app updates, listicles, personal essays, sponsored content, minor bug fixes.

ARTICLES:
${articleList}

For each of the ${targetCount} selected articles, provide:
- A compelling Greek title (journalistic, not word-for-word translation — adapt for impact)
- Exactly 3 Greek bullet points in professional tech/business style

Return ONLY a valid JSON array of exactly ${targetCount} objects. No markdown fences, no extra text:
[
  {
    "index": <0-based index from the list above>,
    "greekTitle": "<strong, clean, journalistic Greek title>",
    "bullets": [
      "**ΛέξηΚλειδί1:** <κύριο εύρημα, ≤22 λέξεις>",
      "**ΛέξηΚλειδί2:** <σημαντική λεπτομέρεια ή επίπτωση, ≤22 λέξεις>",
      "**ΛέξηΚλειδί3:** <ευρύτερη σημασία ή προοπτική, ≤22 λέξεις>"
    ]
  }
]

RULES for bullets:
- Each bullet MUST start with a bolded Greek keyword (e.g., **Χρηματοδότηση:**, **Εξαγορά:**, **Ανακάλυψη:**, **Ασφάλεια:**, **Στρατηγική:**)
- Professional tone only, no clickbait
- Greek language throughout`;

  log.info(`Calling Claude (${CONFIG.model}) — 1 API call for ${articles.length} articles → top ${targetCount}`);

  const response = await client.messages.create({
    model      : CONFIG.model,
    max_tokens : CONFIG.maxTokens,
    messages   : [{ role: 'user', content: prompt }],
  });

  const raw     = response.content[0]?.text?.trim() ?? '';
  const jsonStr = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Claude returned invalid JSON: ${e.message}\n\nRaw:\n${raw.slice(0, 500)}`);
  }

  if (!Array.isArray(parsed)) throw new Error('Claude response is not a JSON array');

  return parsed;
}

// ─── Main Pipeline ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  🗞  News Aggregator  —  Smart Fetch Pipeline     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (IS_MOCK) {
    log.mock('No ANTHROPIC_API_KEY found → running in MOCK MODE (free, no API calls)');
    log.mock('Add your key to .env to enable real AI curation & translation\n');
  } else {
    log.info(`Real mode  |  Model: ${CONFIG.model}`);
  }

  // ── Step 1: Fetch RSS ─────────────────────────────────────────────────
  log.step('Step 1/4  —  Fetching RSS feed');
  log.info(`URL: ${CONFIG.rssUrl}  (requesting ~${CONFIG.fetchCount} items)`);

  const parser = new RSSParser({
    customFields: { item: [['media:content', 'mediaContent'], ['dc:creator', 'author']] },
  });

  let feed;
  try {
    feed = await parser.parseURL(CONFIG.rssUrl);
  } catch (e) {
    log.err(`RSS fetch failed: ${e.message}`);
    process.exit(1);
  }

  const rawItems = feed.items.slice(0, CONFIG.fetchCount);
  log.ok(`Fetched ${rawItems.length} items from "${feed.title}"`);

  // ── Step 2: Deduplication ─────────────────────────────────────────────
  log.step('Step 2/4  —  Deduplication');

  const existing    = await loadExisting();
  const existingSet = new Set(existing.map((a) => a.guid));
  log.info(`Existing articles in archive: ${existing.length}`);

  // Normalize raw RSS items into our schema shape (pre-save)
  const candidates = rawItems
    .map((item) => ({
      guid          : item.guid || item.link,
      link          : item.link,
      originalTitle : (item.title || '').trim(),
      publishedAt   : item.isoDate || item.pubDate || new Date().toISOString(),
      author        : item.author || item['dc:creator'] || null,
      imageUrl      : item.mediaContent?.$.url || item.enclosure?.url || null,
      categories    : item.categories || [],
      snippet       : truncate(stripHtml(item.contentSnippet || item.content || item.summary || ''), 300),
    }))
    .filter((a) => !existingSet.has(a.guid));

  if (candidates.length === 0) {
    log.ok('No new articles found — archive is up to date!\n');
    process.exit(0);
  }

  log.ok(`${candidates.length} new articles to process`);

  // ── Step 3: Curation + Translation ────────────────────────────────────
  log.step('Step 3/4  —  AI Curation & Translation');

  const targetCount = Math.min(CONFIG.targetSelect, candidates.length);
  let selectedData  = [];

  if (IS_MOCK) {
    // Mock: take first targetCount, generate fake Greek content
    log.mock(`Selecting first ${targetCount} articles and generating mock Greek content`);
    selectedData = candidates.slice(0, targetCount).map((article, i) => ({
      index : i,
      ...generateMockArticleData(article),
    }));
  } else {
    // Real: 1 API call
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });
    try {
      selectedData = await curateAndTranslate(client, candidates, targetCount);
      log.ok(`Claude selected and translated ${selectedData.length} articles`);
    } catch (e) {
      log.err(`Claude API error: ${e.message}`);
      log.warn('Falling back to mock mode for this run');
      selectedData = candidates.slice(0, targetCount).map((article, i) => ({
        index : i,
        ...generateMockArticleData(article),
      }));
    }
  }

  // ── Step 4: Build & Save ──────────────────────────────────────────────
  log.step('Step 4/4  —  Building articles & saving');

  const newArticles = [];
  const now         = new Date().toISOString();

  for (const item of selectedData) {
    const idx = typeof item.index === 'number' ? item.index : -1;
    if (idx < 0 || idx >= candidates.length) {
      log.warn(`Invalid index ${idx} in Claude response — skipping`);
      continue;
    }

    const base    = candidates[idx];
    const article = {
      guid         : base.guid,
      link         : base.link,
      originalTitle: base.originalTitle,
      greekTitle   : (item.greekTitle || base.originalTitle).trim(),
      bullets      : Array.isArray(item.bullets) && item.bullets.length === 3
        ? item.bullets.map((b) => b.trim())
        : ['**Ενημέρωση:** Δεν υπάρχουν διαθέσιμα bullets.', '—', '—'],
      publishedAt  : base.publishedAt,
      fetchedAt    : now,
      author       : base.author,
      imageUrl     : base.imageUrl,
      categories   : base.categories,
      snippet      : base.snippet,
      isMock       : IS_MOCK,
    };

    newArticles.push(article);
    log.ok(`✓ [${idx}] ${article.greekTitle.slice(0, 60)}…`);
  }

  if (newArticles.length === 0) {
    log.warn('No valid articles to save');
    process.exit(0);
  }

  // Prepend new articles (newest first) & save
  const merged = [...newArticles, ...existing];
  await saveNews(merged);

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  ✅  Saved ${newArticles.length} new articles`);
  console.log(`  📦  Total archive: ${merged.length} articles`);
  if (IS_MOCK) console.log('  ⚠️   Mock mode — add ANTHROPIC_API_KEY for real AI');
  console.log('══════════════════════════════════════════════════\n');
}

main().catch((e) => {
  log.err(`Unhandled error: ${e.message}`);
  console.error(e);
  process.exit(1);
});
