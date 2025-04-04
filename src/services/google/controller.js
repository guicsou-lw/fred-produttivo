require('custom-env').env();

const express = require('express');
const router = express.Router();

const { GoogleSheets } = require('.');
const { SPREADSHEET_ID, SPREADSHEET_NAME, SPREADSHEET_SUPPLY_ID, SPREADSHEET_SUPPLY_NAME, SPREADSHEET_BOAENERGIA_ID, SPREADSHEET_BOAENERGIA_NAME, SPREADSHEET_BOAENERGIA_PRODUCTS_NAME } = process.env;

async function clearAll(req, res, next) {
  const default_sheet = new GoogleSheets(
    SPREADSHEET_ID,
    SPREADSHEET_NAME,
    [
      "id da oportunidade",
      "Nome",
      "Empresa/Cliente",
      "Qualificação",
      "Etapa",
      "Funil de vendas",
      "Estado",
      "Motivo de Perda",
      "Valor único",
      "Pausada",
      "Data de criação",
      "Previsão de fechamento",
      "Data da última interação",
      "Data da conclusão",
      "Fonte",
      "Campanha",
      "Responsável",
      "Cidade Oportunidade",
      "Cidade Organização",
      "Key account",
      "Valor por fora",
      "Data de Captura"
    ]
  );

  const supply_sheet = new GoogleSheets(
    SPREADSHEET_SUPPLY_ID,
    SPREADSHEET_SUPPLY_NAME,
    [
      "id da oportunidade",
      "Nome",
      "Empresa/Cliente",
      "Qualificação",
      "Etapa",
      "Funil de vendas",
      "Estado",
      "Motivo de Perda",
      "Valor único",
      "Pausada",
      "Previsão de fechamento",
      "Data de criação",
      "Data da última interação",
      "Data da conclusão",
      "Fonte",
      "Campanha",
      "Responsável",
      "Cidade",
      "kWp",
      "Parecer de acesso liberado em",
      "Previsão de Entrega",
      "Valor recebido",
      "Tipo de instalação",
      "Quantidade de placas",
      "Vendedor",
      "Custo Projetado",
      "Custo Efetivo",
      "Estado da conclusão",
      "Número do projeto",
      "Tipo de Serviço",
      "Data encerramento obra",
      "Qualidade",
      "Segurança do trabalho",
      "Data de Captura"
    ]);

  const boaenergia_sheet = new GoogleSheets(
    SPREADSHEET_BOAENERGIA_ID,
    SPREADSHEET_BOAENERGIA_NAME,
    [
      "id da oportunidade",
      "Nome",
      "Empresa/Cliente",
      "Qualificação",
      "Etapa",
      "Funil de vendas",
      "Estado",
      "Motivo de Perda",
      "Valor único",
      "Pausada",
      "Previsão de fechamento",
      "Data de criação",
      "Data da última interação",
      "Data da conclusão",
      "Fonte",
      "Campanha",
      "Responsável",
      "Nota NPS",
      "Por que da nota NPS?",
      "NPS realizada",
      "Data da NPS",
      "Valor da venda",
      "Concessionária de energia",
      "Nota do comissionamento",
      "Data do comissionamento",
      "Porque?",
      "Número do projeto",
      "Data de captura",
    ]);

  const boaenergia_product_sheet = new GoogleSheets(
    SPREADSHEET_BOAENERGIA_ID,
    SPREADSHEET_BOAENERGIA_PRODUCTS_NAME,
    [
      "Id da oportunidade",
      "Id produto",
      "Nome",
      "Descrição",
      "Preço base",
      "Preço",
      "Quantidade",
      "Desconto",
      "Tipo de desconto",
      "Total",
      "Recorrência",
      "Data de criação"
    ]);

  try {
    await clearSheet(default_sheet);
    await clearSheet(supply_sheet);
    await clearSheet(boaenergia_sheet);
    await clearSheet(boaenergia_product_sheet);
  } catch (err) {
    console.error(err)
  }

  return res.status(200).json(null)
}

async function clearSheet(sheets, res) {
  await sheets.init();

  try {
    await sheets.clearAll();
    console.log(`\n==== planilha do Google Sheets ${sheets.spreadsheetName} resetada ====`)
    return true
  }
  catch (error) { console.error(error) }
}

async function createWebhook(req, res, next) {

  return res.sendStatus(200);
}

// routes
router.head(`/clearAll/${process.env.CALLBACK_HASH}`, createWebhook);
router.post(`/clearAll/${process.env.CALLBACK_HASH}`, clearAll);

module.exports = {
  router
};


