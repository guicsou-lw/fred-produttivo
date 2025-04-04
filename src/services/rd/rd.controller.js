require('custom-env').env();

const express = require('express');
const router = express.Router();

const {
  SOLAR_TOKEN,
  SOLAR_CITY_ID,
  SOLAR_KEY_ID,
  SOLAR_OPPORTUNITY_ID,
  SOLAR_COMPANY_ID,
  SOLAR_SEPARATED_VALUE,
  GM_TOKEN,
  GM_CITY_ID,
  GM_OPPORTUNITY_ID,
  GM_COMPANY_ID,
  GM_KEY_ID,
  GM_SEPARATED_VALUE,
  SUPPLY_TOKEN,
  SPREADSHEET_SUPPLY_ID,
  SPREADSHEET_SUPPLY_NAME,
  BOAENERGIA_TOKEN,
  SPREADSHEET_BOAENERGIA_ID,
  SPREADSHEET_BOAENERGIA_NAME,
} = process.env;

const rdParser = require('./rd.parsers');

// Endpoint para a coleta da conta Solar
async function initSolar(req, res, next) {
  try { await rdParser.InitDefault(SOLAR_TOKEN, SOLAR_CITY_ID, SOLAR_KEY_ID, SOLAR_OPPORTUNITY_ID, SOLAR_COMPANY_ID, SOLAR_SEPARATED_VALUE) }
  catch (err) { return next(err) }

  return res.status(200).json(null)
}

// Endpoint para a coleta da conta GM
async function initGM(req, res, next) {
  try { await rdParser.InitDefault(GM_TOKEN, GM_CITY_ID, GM_KEY_ID, GM_OPPORTUNITY_ID, GM_COMPANY_ID, GM_SEPARATED_VALUE); }
  catch (err) { return next(err) }

  return res.status(200).json(null)
}

// Endpoint para a coleta da conta Supply
async function initSupply(req, res, next) {
  try { await rdParser.InitSupply(SUPPLY_TOKEN, SPREADSHEET_SUPPLY_ID, SPREADSHEET_SUPPLY_NAME); }
  catch (err) { return next(err) }

  return res.status(200).json(null)
}

async function createWebhook(req, res, next) {
  return res.sendStatus(200);
}

// Endpoint para a coleta da conta Supply
async function initBoaEnergia(req, res, next) {
  try { await rdParser.InitBoaEnergia(BOAENERGIA_TOKEN, SPREADSHEET_BOAENERGIA_ID, SPREADSHEET_BOAENERGIA_NAME); }
  catch (err) { return res.status(400).json(err) }

  return res.status(200).json(null)
}

async function createWebhook(req, res, next) {
  return res.sendStatus(200);
}

// routes (cada rota é de uma conta do RD Station)
router.head(`/solar/${process.env.CALLBACK_HASH}`, createWebhook);
router.post(`/solar/${process.env.CALLBACK_HASH}`, initSolar);

router.head(`/gm/${process.env.CALLBACK_HASH}`, createWebhook);
router.post(`/gm/${process.env.CALLBACK_HASH}`, initGM);

router.head(`/supply/${process.env.CALLBACK_HASH}`, createWebhook);
router.post(`/supply/${process.env.CALLBACK_HASH}`, initSupply);

router.head(`/boaenergia/${process.env.CALLBACK_HASH}`, createWebhook);
router.post(`/boaenergia/${process.env.CALLBACK_HASH}`, initBoaEnergia);

module.exports = {
  router
};


