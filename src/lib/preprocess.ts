export type SentimentLabel = "Positif" | "Negatif" | "Netral";

const POS_WORDS = new Set([
  "bagus", "mantap", "senang", "bahagia", "hebat", "keren", "positif", "sukses", "baik",
]);

const NEG_WORDS = new Set([
  "buruk", "jelek", "sedih", "marah", "kecewa", "parah", "negatif", "gagal", "benci",
]);

// stopword ringkas (boleh kamu tambah)
const STOPWORDS_ID = new Set([
  "yang","dan","di","ke","dari","ini","itu","atau","untuk","pada","dengan","karena","juga",
  "saya","aku","kamu","dia","mereka","kita","kami","nya","lah","kok","ya","yah","dong",
]);

export function cleanText(input: string): string {
  if (!input) return "";
  let t = input.toLowerCase();
  t = t.replace(/https?:\/\/\S+/g, " "); // url
  t = t.replace(/@\w+/g, " ");          // mention
  t = t.replace(/#/g, " ");             // hashtag symbol
  t = t.replace(/[^a-zA-Z\s]/g, " ");   // non-letters
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

export function removeStopwords(clean: string): string {
  if (!clean) return "";
  const tokens = clean.split(" ").filter(Boolean);
  const kept = tokens.filter((w) => !STOPWORDS_ID.has(w));
  return kept.join(" ");
}

export function scoreSentiment(clean: string): number {
  if (!clean) return 0;
  const tokens = clean.split(" ").filter(Boolean);
  let score = 0;
  for (const w of tokens) {
    if (POS_WORDS.has(w)) score += 1;
    if (NEG_WORDS.has(w)) score -= 1;
  }
  return score;
}

export function labelFromScore(score: number): SentimentLabel {
  if (score > 0) return "Positif";
  if (score < 0) return "Negatif";
  return "Netral";
}
