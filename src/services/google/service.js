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
    try {
      const response = await this.append([], `${sheetName}!A1`);

      if (response && response.updates && response.updates.updatedRange) {
        return response.updates.updatedRange.match(/\d+/g)[0];
      } else {
        // If we can't get the last row, assume it's 1 (empty sheet)
        return "1";
      }
    } catch (error) {
      console.log('Could not get last row, assuming sheet is empty');
      return "1";
    }
  }

  async append(values, range, options = {}) {
    let retries = 1;
    const maxRetries = 10;

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
        console.error(`Error on attempt ${retries}:`, err.message);

        // Check if it's a rate limit error (429)
        if (err.code === 429 || (err.response && err.response.status === 429)) {
          const waitTime = Math.min(60 * 1000 * Math.pow(2, retries - 1), 300 * 1000); // Exponential backoff, max 5 minutes
          console.log(`Rate limit exceeded. Waiting ${waitTime / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.log('Attempt to append spreadsheet values not successful!');
        }

        retries++;

        if (retries > maxRetries) {
          console.error('Max retries reached. Giving up.');
          throw err;
        }
      }
    } while (retries <= maxRetries);
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
    const maxRetries = 10;

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
        console.error(`Error on attempt ${retries}:`, err.message);

        // Check if it's a rate limit error (429)
        if (err.code === 429 || (err.response && err.response.status === 429)) {
          const waitTime = Math.min(60 * 1000 * Math.pow(2, retries - 1), 300 * 1000); // Exponential backoff, max 5 minutes
          console.log(`Rate limit exceeded. Waiting ${waitTime / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.log('Attempt to batchUpdateValues not successful!');
        }

        retries++;

        if (retries > maxRetries) {
          console.error('Max retries reached. Giving up.');
          throw new Error('Attempt to batchUpdateValues not successful!');
        }
      }
    } while (retries <= maxRetries);
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
