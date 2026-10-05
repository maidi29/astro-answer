// Describes the real sky in plain words, so the AI can ground its answers in it
const Astronomy = require("astronomy-engine");

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const DAY = 24 * 60 * 60 * 1000;

// The real constellation behind each sign and the ecliptic longitude of its middle.
// The signs have drifted from the constellations over the centuries, so these differ.
const SIGN_CONSTELLATIONS = {
  aries: { name: "Aries", center: 41 },
  taurus: { name: "Taurus", center: 72 },
  gemini: { name: "Gemini", center: 104 },
  cancer: { name: "Cancer", center: 128 },
  leo: { name: "Leo", center: 156 },
  virgo: { name: "Virgo", center: 196 },
  libra: { name: "Libra", center: 230 },
  scorpio: { name: "Scorpius", center: 245 },
  sagittarius: { name: "Sagittarius", center: 283 },
  capricorn: { name: "Capricornus", center: 314 },
  aquarius: { name: "Aquarius", center: 340 },
  pisces: { name: "Pisces", center: 10 },
};

const longitude = (body, date) => Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;

const signOf = (body, date) => SIGNS[Math.floor(longitude(body, date) / 30) % 12];

const constellationOf = (body, date) => {
  const eq = Astronomy.EquatorFromVector(Astronomy.GeoVector(body, date, true));
  return Astronomy.Constellation(eq.ra, eq.dec).name;
};

// Constellation on the ecliptic at a given longitude, e.g. the one opposite the Sun
const constellationAt = (elon) => {
  const vector = Astronomy.VectorFromSphere(new Astronomy.Spherical(0, elon, 1), new Date());
  const eq = Astronomy.EquatorFromVector(Astronomy.RotateVector(Astronomy.Rotation_ECL_EQJ(), vector));
  return Astronomy.Constellation(eq.ra, eq.dec).name;
};

const isRetrograde = (body, date) => {
  if (body === "Sun" || body === "Moon") return false;
  // Longitude decreasing over a day (accounting for the 360° wrap)
  const delta = (longitude(body, date) - longitude(body, new Date(date.getTime() - DAY)) + 540) % 360 - 180;
  return delta < 0;
};

const moonPhase = (date) => {
  const angle = Astronomy.MoonPhase(date);
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  return names[Math.round(angle / 45) % 8];
};

// When a constellation can be seen, from its angle to the Sun along the ecliptic
const visibility = (center, date) => {
  const fromSun = (center - longitude("Sun", date) + 360) % 360;
  if (fromSun < 25 || fromSun > 335) return "hidden in the Sun's glare, not visible at night right now";
  if (fromSun <= 150) return "visible in the evening sky after sunset";
  if (fromSun >= 210) return "visible in the morning sky before dawn";
  return "visible all night, highest around midnight";
};

// Location independent: same for everyone on this day
const globalSky = (date = new Date()) => {
  const positions = BODIES.map((body) =>
    `${body} in the sign ${signOf(body, date)}, in front of the constellation ${constellationOf(body, date)}${isRetrograde(body, date) ? " (retrograde)" : ""}`
  );
  const midnight = constellationAt((longitude("Sun", date) + 180) % 360);
  return [
    `Moon phase: ${moonPhase(date)}.`,
    `Positions: ${positions.join("; ")}.`,
    `Highest in the sky at midnight: the constellation ${midnight}.`,
  ].join("\n");
};

// What the real constellation of a zodiac sign is doing today
const signSky = (zodiac, date = new Date()) => {
  const constellation = SIGN_CONSTELLATIONS[zodiac];
  const guests = BODIES.filter((body) => constellationOf(body, date) === constellation.name);
  return [
    `The constellation ${constellation.name} is ${visibility(constellation.center, date)}.`,
    `Passing through ${constellation.name} right now: ${guests.length ? guests.join(", ") : "no planets, Sun or Moon"}.`,
  ].join("\n");
};

// What is actually above the horizon for the visitor right now
const localSky = (latitude, longitude, date = new Date()) => {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const altitude = (body) => {
    const eq = Astronomy.Equator(body, date, observer, true, true);
    return Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal").altitude;
  };
  const visible = BODIES.filter((body) => body !== "Sun" && altitude(body) > 0)
    .map((body) => `${body} (in ${constellationOf(body, date)})`);
  const daytime = altitude("Sun") > 0;
  return `It is ${daytime ? "daytime" : "night"} there. Above the horizon right now: ${visible.length ? visible.join(", ") : "no planets and no Moon"}.`;
};

module.exports = { globalSky, signSky, localSky };
