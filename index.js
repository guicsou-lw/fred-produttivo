// require('custom-env').env();

import { GetAll, parseAndSend, GetFormFills } from "./src/services/produttivo/service.js"

// const {
//   PORT,
// } = process.env;

// const express = require('express');
// const cors = require('cors');

// const errorHandler = require('./src/_helpers/error-handler');
// const app = express();

// app.set('trust proxy');

// app.use(express.text({ type: 'application/json' }));
// app.use(cors({ origin: '*' }));
// app.use(express.static('public'))

// const controllers = {
//   rd: require('./src/services/rd/rd.controller').router,
//   sheets: require('./src/services/google/controller').router,
//   produttivo: require('./src/services/produttivo/controller').router
// };

// // api routes
// app.use(`/rd`, controllers.rd);
// app.use(`/sheets`, controllers.sheets);
// app.use(`/produttivo`, controllers.produttivo);

// controllers.produttivo();


export async function getAll(req, res, next) {
  try {
    /*await parseAndSend(await GetAll('/works'), 'works')
    await parseAndSend(await GetAll('/work_plans'), 'work_plans')
    await parseAndSend(await GetAll('/resource_places'), 'resource_places')
    await parseAndSend(await GetAll('/forms'), 'forms')
    await parseAndSend(await GetAll('/parts'), 'parts')
    await parseAndSend(await GetAll('/projects'), 'projects')
    await parseAndSend(await GetAll('/services'), 'services')
    await parseAndSend(await GetAll('/tickets'), 'tickets')
    await parseAndSend(await GetAll('/satisfaction_surveys'), 'satisfaction_surveys')*/
    //await parseAndSend(await GetAll('/form_fills'), 'form_fills')
    await GetFormFills()

    console.log("Finalizado")
    return true
  } catch (err) { return new Error('Dados não enviados para a planilha') }
}

await getAll();

// global error handler
// app.use(errorHandler);

// app.listen(PORT, async () => {
//   console.log(`Server listening on port ${PORT}.`);
// });
