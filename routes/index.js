var express = require('express');
var router = express.Router();
const openAiController = require('../controllers/OpenAiController');
const { body, param, validationResult} = require('express-validator');

const zodiacs = ['capricorn','aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo','virgo', 'libra','scorpio', 'sagittarius'];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/horoscope/:zodiac', param('zodiac').isIn(zodiacs), validate, openAiController.generateHoroscope);

// Only called by outdated extension versions, which show the returned text as is
const UPDATE_MESSAGE = 'Astro Answer has a new version with a fresh look. Chrome will update this extension automatically '
    + 'within a few hours - or open chrome://extensions, turn on Developer mode and click "Update".';
router.post('/horoscope', (req, res) => res.json({horoscope: UPDATE_MESSAGE}));
router.post('/question', (req, res) => res.json({answer: UPDATE_MESSAGE}));

router.post('/ask',
    body('question').isString().trim().isLength({min: 5, max: 300}),
    body('zodiac').optional({nullable: true}).isIn(zodiacs),
    body('place').optional({nullable: true}).isString().trim().isLength({max: 100}),
    body('localTime').optional({nullable: true}).isString().trim().isLength({max: 100}),
    body('latitude').optional({nullable: true}).isFloat({min: -90, max: 90}).toFloat(),
    body('longitude').optional({nullable: true}).isFloat({min: -180, max: 180}).toFloat(),
    validate, openAiController.getAnswer);

module.exports = router;
