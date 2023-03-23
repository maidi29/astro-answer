const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const horoscopes = {};

module.exports.generateHoroscope = async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured.",
      },
    });
    return;
  }

  const zodiac = req.body.zodiac;

  const nowDate = new Date();
  const today = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
  if(!horoscopes[today]) {
    horoscopes[today] = {};
  }
  if (horoscopes[today][zodiac]) {
    res.status(200).json({horoscope: horoscopes[today][zodiac]});
    return;
  }
  try {
    let horoscope = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: horoscopePrompt(zodiac),
      temperature: 1,
      max_tokens: 2048,
    });
    horoscope = horoscope.data.choices[0].text;
    horoscopes[today][zodiac] = horoscope;
    res.status(200).json({horoscope});
    } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
};

const horoscopePrompt = (zodiac) => {
  return `Generate a horoscope for today for a zodiac sign. Include star constellations for reasoning. Do 2-4 short sentences.
  Zodiac sign: ${zodiac}
  Horocope:`;
};



module.exports.getAnswer = async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured.",
      },
    });
    return;
  }

  const question = req.body.question;

  try {
    let answer = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: questionPrompt(question),
      temperature: 1,
      max_tokens: 2048,
    });
    answer = answer.data.choices[0].text;
    res.status(200).json({answer});
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
};

const questionPrompt = (question) => {
  return `Answer my question as a wise and all-knowing universe, whose vast expanse holds the secrets of the past, present, and future. 
  You can give concrete answers or suggestions. If you don't know you can give mysterious and vague answers that can match any situation.
Question: Should I quit my job?
Answer: It is written in the stars that a new job will bring many opportunities for advancement and success.
Question: How should I call my guinea pig?
Answer: Orion would be a suitable name for your guinea pig, as it possesses it's power and radiance.
Question: ${question};
Answer: `
};

