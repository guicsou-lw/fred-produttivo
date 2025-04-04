require('custom-env').env();

const axios = require('axios');

const { GoogleSheets, spreadsheetRangeValue } = require('../google');

const { SPREADSHEET_ID, SPREADSHEET_NAME, PRODUTTIVO_LOGIN, PRODUTTIVO_TOKEN, PRODUTTIVO_REGISTER } = process.env;

const base_url = `https://app.produttivo.com.br`

async function parseAndSend(data, sheet_name) {

  // Removes nested objects
  // const filtered_data = data?.map(element => Object.fromEntries(
  //   Object.entries(element).filter(([key, value]) =>
  //     typeof value !== 'object'
  //   )
  // ));

  const data_values = data?.map(element => {
    element.collected_at = new Date().toISOString();

    return Object.entries(element)
      .map(([key, value]) => typeof value !== 'object' ? value : '') // Transform the remaining entries into an array of values
  }
  );

  const keys = data?.[0] ? Object.keys(data?.[0]) : [];

  const sheet = new GoogleSheets(
    SPREADSHEET_ID,
    sheet_name,
    keys
  );

  await sheet.init()

  await sheet.clearAll()

  const lastRow = await sheet.getLastRow(sheet_name);
  const rangeValues = [spreadsheetRangeValue(data_values, `${sheet_name}!A${lastRow}`)];

  try {
    await sheet.batchUpdateValues(rangeValues);
    console.log('\n==== dados enviados para o Google Sheets ====')
  }
  catch (error) { throw (new Error('Dados não enviados para a planilha')) }
}

async function SendToSheet(data, spreadsheet_id = SPREADSHEET_ID, spreadsheet_name = SPREADSHEET_NAME) {
  const sheets = new GoogleSheets(spreadsheet_id);
  await sheets.init();
  await sheets.clearAll();

  const sheetName = spreadsheet_name;
  const lastRow = await sheets.getLastRow(sheetName);
  const rangeValues = [spreadsheetRangeValue(data, `${sheetName}!A${lastRow}`)];

  try {
    await sheets.batchUpdateValues(rangeValues);
    console.log('\n==== dados enviados para o Google Sheets ====')
  }
  catch (error) { throw (new Error('Dados não enviados para a planilha')) }
}

async function GetRequest(endpoint) {
  const url = `${base_url}${endpoint}`;

  try {
    console.log(`Colentando dados [${endpoint}]`)
    const response = (await axios.get(`${url}`, {
      headers: {
        'Content-Type': "application/json",
        "accept": "application/json",
        "X-Auth-Login": PRODUTTIVO_LOGIN,
        "X-Auth-Register": PRODUTTIVO_REGISTER,
        "X-Auth-Token": PRODUTTIVO_TOKEN
      }
    })).data;

    return response;
  }
  catch (error) { console.error(error) }
}

async function PostRequest(endpoint, data) {
  const url = `${base_url}${endpoint}`;

  try {
    console.log(`Enviando dados [${endpoint}]`)
    const response = (await axios.post(`${url}`,
      data,
      {
        headers: {
          'Content-Type': "application/json",
          "accept": "application/json",
          "X-Auth-Login": PRODUTTIVO_LOGIN,
          "X-Auth-Register": PRODUTTIVO_REGISTER,
          "X-Auth-Token": PRODUTTIVO_TOKEN
        }
      })).data;

    return response[endpoint];
  }
  catch (error) { console.error(error) }
}

async function GetAll(endpoint, from_page = 1) {
  let data = [];
  let page = from_page;
  let total_pages = "??"

  const url = `${base_url}${endpoint}`;

  try {
    do {
      console.log(`Colentando dados [${endpoint}] da pagina ${page}/${total_pages}`)
      const response = (await axios.get(`${url}?page=${page}`, {
        headers: {
          'Content-Type': "application/json",
          "accept": "application/json",
          "X-Auth-Login": PRODUTTIVO_LOGIN,
          "X-Auth-Register": PRODUTTIVO_REGISTER,
          "X-Auth-Token": PRODUTTIVO_TOKEN
        }
      })).data;
      data.push(...response.results);

      total_pages = response.meta.total_pages;

      page++; //next page

      if (!total_pages || page > total_pages) break;
    }
    while (true);

    return data;
  }
  catch (error) { console.error(error) }
}


module.exports = {
  GetAll,
  GetRequest,
  PostRequest,
  SendToSheet,
  parseAndSend
};
