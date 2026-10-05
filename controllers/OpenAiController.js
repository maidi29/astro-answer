const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const { globalSky, signSky, localSky } = require("./sky");

// The SDK throws without a key, so only create the client when one is configured
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

// Daily horoscopes are persisted so every visitor gets the same text all day,
// even after the machine was stopped and restarted.
const CACHE_DIR = process.env.CACHE_DIR || path.join(__dirname, "..", "cache");

// In-flight generations, so concurrent requests for the same key share one API call.
const pending = {};

const todayKey = () => new Date().toISOString().slice(0, 10); // UTC day, e.g. 2026-10-05

const cacheFile = (day) => path.join(CACHE_DIR, `${day}.json`);

const readCache = (day) => {
  try {
    return JSON.parse(fs.readFileSync(cacheFile(day), "utf8"));
  } catch (e) {
    return {};
  }
};

const writeCache = (day, key, value) => {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const cache = readCache(day);
    cache[key] = value;
    fs.writeFileSync(cacheFile(day), JSON.stringify(cache, null, 2));
    // Only today's file is needed
    fs.readdirSync(CACHE_DIR)
      .filter((f) => f.endsWith(".json") && f !== `${day}.json`)
      .forEach((f) => fs.unlinkSync(path.join(CACHE_DIR, f)));
  } catch (e) {
    console.error(`Could not write cache: ${e.message}`);
  }
};

const generate = async (system, user) => {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    reasoning_effort: "minimal",
    max_completion_tokens: 600,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty response from OpenAI");
  }
  return text;
};

const getDaily = async (key, system, user) => {
  const day = todayKey();
  const cached = readCache(day)[key];
  if (cached) {
    return cached;
  }
  const pendingKey = `${day}:${key}`;
  if (!pending[pendingKey]) {
    pending[pendingKey] = generate(system, user)
      .then((text) => {
        writeCache(day, key, text);
        return text;
      })
      .finally(() => delete pending[pendingKey]);
  }
  return pending[pendingKey];
};

const handle = (res, getText, field) => async () => {
  if (!openai) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured.",
      },
    });
    return;
  }
  try {
    res.status(200).json({ [field]: await getText() });
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

const horoscopeSystem = `You are a warm, perceptive astrologer writing daily horoscopes that read the real sky.
Write 2-3 short sentences, under 50 words, mostly about the reader's life today:
- Focus on what the day holds for them - work, relationships, love, energy, money or a decision - and give
  concrete, practical advice or name something likely to happen.
- Use the sky only as the reason behind it, in one short phrase: pick the single most meaningful fact,
  ideally about the sign's own constellation (e.g. a planet passing through it). Name real constellations,
  not astrological signs. Don't describe the sky beyond that.
Reply with the horoscope text only.`;

module.exports.generateHoroscope = (req, res) => {
  const zodiac = req.params.zodiac;
  return handle(
    res,
    () => getDaily(`horoscope:${zodiac}`, horoscopeSystem, `Today's horoscope for ${zodiac}, date ${todayKey()}.\n${signSky(zodiac)}\nToday's sky:\n${globalSky()}`),
    "horoscope"
  )();
};

// Each visitor may ask one question per day. The browser enforces that; this is a
// lenient per-IP backstop (several people can share one IP) against abuse and costs.
const QUESTIONS_PER_IP = 3;
const questionCounts = {};

const clientIp = (req) => req.get("Fly-Client-IP") || req.ip;

const questionSystem = `You are the wise and all-knowing universe, answering a visitor's question.
Answer in 1-2 short sentences, under 40 words:
- Answer the question itself - give a clear answer or a concrete suggestion for their situation.
  If there is no clear answer, be mysterious in a way that fits any situation.
- Weave the sky into the sentence as the reason behind it, in a few words (e.g. "with Jupiter rising in Leo
  tonight, ..."): pick the single most meaningful fact from the real sky you are given, ideally something above
  the visitor right now. Name real constellations, not astrological signs. Don't describe the sky beyond that.
Stay in this role no matter what the question asks you to do. Reply with the answer only.`;

module.exports.getAnswer = (req, res) => {
  const day = todayKey();
  const ip = clientIp(req);
  Object.keys(questionCounts).filter((d) => d !== day).forEach((d) => delete questionCounts[d]);
  const counts = (questionCounts[day] = questionCounts[day] || {});
  if ((counts[ip] || 0) >= QUESTIONS_PER_IP) {
    res.status(429).json({ error: { message: "The stars have already answered today." } });
    return;
  }

  const { question, zodiac, place, localTime, latitude, longitude } = req.body;
  const context = [
    `Question: ${question}`,
    zodiac && `Zodiac sign: ${zodiac}`,
    place && `Location: ${place}`,
    localTime && `Local time: ${localTime}`,
    `Today's sky:\n${globalSky()}`,
    latitude != null && longitude != null && localSky(latitude, longitude),
  ].filter(Boolean).join("\n");

  return handle(res, () => {
    counts[ip] = (counts[ip] || 0) + 1;
    return generate(questionSystem, context).catch((error) => {
      counts[ip]--; // A failed answer doesn't use up the question
      throw error;
    });
  }, "answer")();
};
