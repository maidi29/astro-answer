var express = require('express');
var router = express.Router();
const openAiController = require('../controllers/OpenAiController');
const { body, validationResult} = require('express-validator');

const zodiacs = ['capricorn','aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo','virgo', 'libra','scorpio', 'sagittarius'];

router.post('/horoscope', body('zodiac').notEmpty().custom((input) => zodiacs.includes(input)),
    async(req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      await openAiController.generateHoroscope(req, res);
});

router.post('/question', body('question').notEmpty().isLength({min: 5, max: 300}),
    async(req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      await openAiController.getAnswer(req, res);
});

module.exports = router;
