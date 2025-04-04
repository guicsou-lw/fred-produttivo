require('custom-env').env();

const express = require('express');
const router = express.Router();

const produttivo_service = require('./service');

export async function getAll(req, res, next) {
  try {
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/works'), 'works')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/work_plans'), 'work_plans')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/resource_places'), 'resource_places')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/forms'), 'forms')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/parts'), 'parts')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/projects'), 'projects')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/services'), 'services')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/tickets'), 'tickets')
    await produttivo_service.parseAndSend(await produttivo_service.GetAll('/satisfaction_surveys'), 'satisfaction_surveys')
    //await produttivo_service.parseAndSend(await produttivo_service.GetAll('/form_fills'), 'form_fills')

    return res.status(200).json(work_plans)
  } catch (err) { return next(err) }
}

async function createWebhook(req, res, next) {
  return res.sendStatus(200);
}

// routes (cada rota é de uma conta do RD Station)
router.head(`/${process.env.CALLBACK_HASH}`, createWebhook);
router.get(`/${process.env.CALLBACK_HASH}`, getAll);

module.exports = {
  router
};

/*

Work_plans
* account_id
* resource_place_id
* form_id
* project_id (nullable)
* last_ticket_id
* last_work_id (nullable)

Works
* form_id
* account_id
* project_id
* account_member_ids[]
* resource_place_id
* ticket_ids
* account_members_works ??

Resource_Places
* account_id
* parent_id


Form
* account_id
* form_sections

Form Fills
* work_id
* resource_id (nullable)
* project_id (nullable)

Parts
* account_id

Project
* account_id

Satisfaction Surveys
* work_id
* resource_place_id
* satisfaction_preference_id

Services
* account_id

Tickets
* account_id
* work_id
* resource_place_id


*/