require('custom-env').env();

const { google } = require('googleapis');

class GoogleSheets {
  spreadsheetId;
  spreadsheetName;
  header;
  TOKEN_PATH;
  SCOPES;
  instance;

  constructor(
    spreadsheetId,
    spreadsheetName,
    header,
    token_path = 'token.json',
    scopes = ['https://www.googleapis.com/auth/spreadsheets'],
  ) {
    this.spreadsheetId = spreadsheetId;
    this.spreadsheetName = spreadsheetName;
    this.TOKEN_PATH = token_path;
    this.SCOPES = scopes;
    this.header = header || ["id da oportunidade", "Nome", "Empresa/Cliente", "Qualificação", "Etapa", "Funil de vendas", "Estado", "Motivo de Perda", "Valor único", "Pausada", "Data de criação", "Previsão de fechamento", "Data da última interação", "Data da conclusão", "Fonte", "Campanha", "Responsável", "Cidade Oportunidade", "Cidade Organização", "Key account", "Data de Captura"];
  }

  async init() {
    const authClient = await this.auth.getClient();

    this.instance = google.sheets({ version: 'v4', auth: authClient });
  }

  get auth() {
    const options = {
      keyFile: this.TOKEN_PATH,
      scopes: this.SCOPES,
    };

    return new google.auth.GoogleAuth(options);
  }

  async getLastRow(sheetName) {

    const { updates } = await this.append([], `${sheetName}!A1`);

    return updates.updatedRange.match(/\d+/g)[0];
  }

  async append(values, range, options = {}) {
    let retries = 1;

    const auth = this.auth;
    const spreadsheetId = this.spreadsheetId;

    const request = {
      ...options,

      auth,
      spreadsheetId,
      range,

      valueInputOption: 'USER_ENTERED',

      resource: {
        values: values,
      },
    };

    do {
      try {
        console.log(`Trying to append spreadsheet values (${retries})...`);
        const {
          data: response,
        } = await this.instance.spreadsheets.values.append(request);
        console.log(`successfully connected...\n`);

        return response
      } catch (err) {
        retries++;
        console.error(err)
        console.log('Attempt to append spreadsheet values not sucessful!');
      }
    } while (retries <= 10);
  }

  async batchUpdateSheet(requests, options = {}) {
    let retries = 1;

    const auth = this.auth;
    const spreadsheetId = this.spreadsheetId;

    const request = {
      ...options,

      auth,
      spreadsheetId,

      resource: {
        requests,
      },
    };

    do {
      try {
        console.log(`Trying to batchUpdateSheet (${retries})...`);
        const { data: response } = await this.instance.spreadsheets.batchUpdate(
          request,
        );
        console.log(`successfully connected...\n`);

        return response;
      } catch (err) {
        retries++;
        console.log('Attempt to batchUpdateSheet not sucessful!');
      }
    } while (retries <= 10);
  }

  async clearAll() {
    const request = {
      spreadsheetId: this.spreadsheetId,
      range: `${this.spreadsheetName}!A:ZZ`,
    };

    const sheetInfo = await this.instance.spreadsheets.get({
      auth: this.auth,
      spreadsheetId: this.spreadsheetId,
    });

    const sheetExists = sheetInfo.data.sheets.some(sheet => sheet.properties.title === this.spreadsheetName);

    if (sheetExists) {
      console.log(`Tab "${this.spreadsheetName}" already exists.`);
    } else {
      // Create a new sheet (tab)
      await this.instance.spreadsheets.batchUpdate({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: this.spreadsheetName,
                },
              },
            },
          ],
        },
      });

      console.log(`Tab "${this.spreadsheetName}" created.`);
    }

    try {
      await this.instance.spreadsheets
        .values
        .clear(request)

      await this.batchUpdateValues([spreadsheetRangeValue([this.header], `${this.spreadsheetName}`)]);
    } catch (err) {
      console.error(err);
      console.log('Attempt to clear sheet not sucessful!');
    }
  }

  async batchUpdateValues(data, options = {}) {
    let retries = 1;

    const auth = this.auth;
    const spreadsheetId = this.spreadsheetId;

    const request = {
      ...options,

      auth,
      spreadsheetId,

      resource: {
        data,
        valueInputOption: 'USER_ENTERED',
      },

      includeValuesInResponse: false,
    };

    do {
      try {
        console.log(`Trying to batchUpdateValues (${retries})...`);
        const {
          data: response,
        } = await this.instance.spreadsheets.values.batchUpdate(request);
        console.log(`successfully connected...\n`);

        return response;
      } catch (err) {
        retries++;
        console.error(err);
        throw (new Error('Attempt to batchUpdateValues not sucessful!'))
      }
    } while (retries <= 10);
  }

  async getSheetID(sheetName, options = {}) {
    let retries = 1;

    const auth = this.auth;
    const spreadsheetId = this.spreadsheetId;

    const request = {
      ...options,

      auth,
      spreadsheetId,

      ranges: [sheetName],
      includeGridData: false,
    };

    do {
      try {
        console.log(`Trying to getSheetID (${retries})...`);
        const { data: response } = await this.instance.spreadsheets.get(
          request,
        );
        console.log(`successfully connected...\n`);

        return response.sheets[0].properties.sheetId;
      } catch (err) {
        retries++;
        console.log('Attempt to getSheetID not sucessful!');
      }
    } while (retries <= 10);
  }

  /**
   * inserts column or row in spreadsheet grid
   */
  async insertInGrid(
    sheetId,
    { startIndex, endIndex },
    dimension = 'COLUMNS',
  ) {
    let retries = 1;

    const request = {
      insertDimension: {
        range: {
          dimension,
          sheetId: sheetId,
          startIndex: startIndex,
          endIndex: endIndex,
        },
        inheritFromBefore: false,
      },
    };

    do {
      try {
        console.log(`Trying to insertInGrid (${retries})...`);
        const response = await this.batchUpdateSheet([request]);
        console.log(`successfully connected...\n`);

        return response;
      } catch (err) {
        retries++;
        console.log('Attempt to insertInGrid not sucessful!');
      }
    } while (retries <= 10);
  }
}

function spreadsheetRangeValue(data, range) {
  const values = [...data];

  return {
    range,
    values,
    majorDimension: 'ROWS',
  };
}

module.exports = {
  GoogleSheets,
  spreadsheetRangeValue,
};
