require('custom-env').env();

const axios = require('axios');

const { GoogleSheets, spreadsheetRangeValue } = require('../google');

const { SPREADSHEET_ID, SPREADSHEET_NAME } = process.env;

const base_url = `https://crm.rdstation.com/api/v1`

async function SendToSheet(data, spreadsheet_id = SPREADSHEET_ID, spreadsheet_name = SPREADSHEET_NAME) {

  const sheets = new GoogleSheets(spreadsheet_id);
  await sheets.init();

  const sheetName = spreadsheet_name;
  const lastRow = await sheets.getLastRow(sheetName);
  const rangeValues = [spreadsheetRangeValue(data, `${sheetName}!A${lastRow}`)];

  try {
    await sheets.batchUpdateValues(rangeValues);
    console.log('\n==== dados enviados para o Google Sheets ====')
  }
  catch (error) { throw (new Error('Dados não enviados para a planilha')) }
}

async function GetAll(token, endpoint, from_page = 1) {
  let data = [];
  let page = from_page;

  const params = `token=${token}&limit=100`
  const url = `${base_url}/${endpoint}?${params}`;

  try {
    do {
      console.log(`Colentando dados [${endpoint}] da pagina ${page}`)
      const response = (await axios.get(`${url}&page=${page}`)).data;
      data.push(...response[endpoint]);
      page++;
      if (!response.has_more) break;
    }
    while (true);

    return data;
  }
  catch (error) { console.error(error) }
}

async function GetPipelines(token) {
  const params = `token=${token}`
  const url = `${base_url}/deal_pipelines?${params}`;

  try {
    console.log(`Colentando dados [deal_pipelines]`)
    const response = await axios.get(`${url}`);
    return response.data
  }
  catch (error) { console.error(error) }
}

module.exports = {
  GetAll,
  SendToSheet,
  GetPipelines
};
