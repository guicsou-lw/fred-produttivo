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

      for (const result of response.results) {
        if (result.field_values.length > 0) {
          const field_value = result.field_values.find(field => field.attachments.length > 1);
          if (field_value) {
            console.log(field_value)
          }
        }
      }

      total_pages = response.meta.total_pages;

      page++; //next page

      if (!total_pages || page > total_pages || page > 3) break;
    }
    while (true);

    return data;
  }
  catch (error) { console.error(error) }
}

async function GetFormFills() {
  let data = [];
  let page = 1;
  let total_pages = "??"
  let sheet;
  let field_values_sheet;
  let attachment_value_sheet;

  const endpoint = '/form_fills'
  const sheet_name = 'form_fills'
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
      data = response.results;

      total_pages = response.meta.total_pages;

      // If page 1, clear google sheet tab!
      if (page === 1) {
        const keys = data?.[0] ? Object.keys(data?.[0]) : [];

        sheet = new GoogleSheets(SPREADSHEET_ID, 'form_fills', [...keys, 'coletado em']);
        await sheet.init()
        await sheet.clearAll()
      }

      // Send page data to google sheet
      const data_values = data?.map(element => {
        element.collected_at = new Date().toISOString();

        return Object.entries(element)
          .map(([key, value]) => typeof value !== 'object' ? value : '') // Transform the remaining entries into an array of values
      }
      );

      const lastRow = await sheet.getLastRow(sheet_name);
      const rangeValues = [spreadsheetRangeValue(data_values, `${sheet_name}!A${lastRow}`)];

      try {
        await sheet.batchUpdateValues(rangeValues);
        console.log('\n==== dados enviados para o Google Sheets ====')
      }
      catch (error) { throw (new Error('Dados não enviados para a planilha')) }

      let data_field_values = [];
      let data_field_value_attachments = [];

      for (const result of response.results) {
        if (result.field_values.length > 0) {
          if (!field_values_sheet) {
            const field_values_keys = Object.keys(result.field_values[0]);

            field_values_sheet = new GoogleSheets(SPREADSHEET_ID, 'form_fill_values', [...field_values_keys, 'coletado em', 'form_fill_id']);
            await field_values_sheet.init()
            await field_values_sheet.clearAll()
          }

          data_field_values.push(...result.field_values?.map(element => {
            element.collected_at = new Date().toISOString();
            element.form_fill_id = result.id;
            return Object.entries(element)
              .map(([key, value]) => typeof value !== 'object' ? value : '') // Transform the remaining entries into an array of values
          }
          ));

          for (const field_value of result.field_values) {
            if (field_value.attachments.length > 0) {
              if (!attachment_value_sheet) {
                const attachment_value_keys = Object.keys(field_value.attachments[0]);
                attachment_value_sheet = new GoogleSheets(SPREADSHEET_ID, 'form_fill_value_attachments', [...attachment_value_keys, 'coletado em', 'form_fill_id', 'form_fill_value_id']);
                await attachment_value_sheet.init()
                await attachment_value_sheet.clearAll()
              }

              data_field_value_attachments.push(...field_value.attachments?.map(element => {
                element.collected_at = new Date().toISOString();
                element.form_fill_id = result.id;
                element.form_fill_value_id = field_value.id;

                return Object.entries(element)
                  .map(([key, value]) => typeof value !== 'object' ? value : '') // Transform the remaining entries into an array of values
              }
              ));
            }


          }
        }
      }

      const lastFormFillRow = await field_values_sheet.getLastRow('form_fill_values');
      const formFillRangeValues = [spreadsheetRangeValue(data_field_values, `form_fill_values!A${lastFormFillRow}`)];

      try {
        await field_values_sheet.batchUpdateValues(formFillRangeValues);
        console.log('\n==== dados enviados para o Google Sheets ====')
      }
      catch (error) { throw (new Error('Dados não enviados para a planilha')) }

      const lastAttachmentRow = await attachment_value_sheet.getLastRow('form_fill_value_attachments');
      const attachmentRangeValues = [spreadsheetRangeValue(data_field_value_attachments, `form_fill_value_attachments!A${lastAttachmentRow}`)];

      try {
        await attachment_value_sheet.batchUpdateValues(attachmentRangeValues);
        console.log('\n==== dados enviados para o Google Sheets ====')
      }
      catch (error) { throw (new Error('Dados não enviados para a planilha')) }

      page++; //next page

      if (!total_pages || page > total_pages || page > 10) break;
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
  parseAndSend,
  GetFormFills
};
