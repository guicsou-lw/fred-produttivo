require('custom-env').env();

const moment = require('moment');

const { GetAll, SendToSheet, GetPipelines } = require('./rd.service');

const date_format = "DD[/]MM[/]YYYY";

function processData(value, key, date_format = "DD[/]MM[/]YYYY") {
  if (value === null || value === undefined) {
    return 'n/a';
  } else if (typeof value === 'object' && value.hasOwnProperty('name')) {
    // Handle objects with a 'name' property (e.g., organization, deal_stage)
    return value.name;
  } else if (key.includes('date') && value) {
    // Handle date fields
    return moment(value).format(date_format);
  } else if (typeof value === 'object' && value.hasOwnProperty('value')) {
    // Handle objects with a 'value' property
    return Array.isArray(value.value)
      ? value.value.length > 0
        ? value.value[0]
        : 'n/a'
      : value.value || 'n/a';
  } else {
    // Handle other types of values
    return value;
  }
}

async function ParseDefaultDeals(deals, organizations, pipelines, city_id, key_id, opportunity_id, company_id, separated_price) {
  console.log('\n==== parseando oportunidades =====\n');

  let parsed_data = {};

  try {
    for (const deal of deals) {
      const {
        id,
        name,
        organization,
        rating,
        deal_stage,
        amount_unique,
        hold,
        created_at,
        updated_at,
        closed_at,
        deal_lost_reason,
        deal_source,
        campaign,
        user,
        win,
        prediction_date,
        deal_custom_fields,
      } = deal;

      const city = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == city_id);
      const key = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == key_id);
      const opportunity = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == opportunity_id);
      const company = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == company_id);
      const organization_city = organizations[organization?.id]?.custom_fields?.find(({ custom_field_id }) => custom_field_id == city_id);
      const separated_value = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == separated_price);

      parsed_data[`${id}`] = {
        id: id,
        name: name || `n/a`,
        client: organization ? organization.name : `n/a`,
        rating: rating || `n/a`,
        deal_stage: deal_stage ? deal_stage.name : `n/a`,
        funnel: pipelines[`${deal_stage.id}`] || `n/a`,
        status: win ? 'vendida' : (win === false ? 'perdida' : 'em andamento'),
        deal_lost_reason: deal_lost_reason ? deal_lost_reason.name : `n/a`,
        amount_unique: amount_unique || `n/a`,
        hold: hold || `n/a`,
        created_at: created_at ? moment(created_at).format(date_format) : `n/a`,
        updated_at: updated_at ? moment(updated_at).format(date_format) : `n/a`,
        closed_at: closed_at ? moment(closed_at).format(date_format) : `n/a`,
        source: deal_source ? deal_source.name : `n/a`,
        campaign: campaign ? campaign.name : `n/a`,
        in_charge: user ? user.name : `n/a`,
        city: city ? city.value : `n/a`,
        organization_city: organization_city ? organization_city.value : 'n/a',
        key: key ? `${key.value}` : `n/a`,
        opportunity: opportunity ? `${opportunity.value}` : `n/a`,
        company: company ? `${company.value}` : `n/a`,
        collected_at: moment(new Date()).format(`${date_format} HH:mm`) || `n/a`,
        prediction_date: prediction_date ? moment(prediction_date).format(date_format) : 'n/a',
        separated_value: separated_value ? separated_value.value : `n/a`,
      }
    }
  }
  catch (error) { console.error(error) }

  parsed_data = Object.values(parsed_data).map((data) => {
    const {
      id,
      name,
      client,
      rating,
      deal_stage,
      funnel,
      status,
      deal_lost_reason,
      amount_unique,
      hold,
      created_at,
      prediction_date,
      updated_at,
      closed_at,
      source,
      campaign,
      in_charge,
      city,
      organization_city,
      key,
      collected_at,
      separated_value
    } = data;

    return [id, name, client, rating, deal_stage, funnel, status, deal_lost_reason, amount_unique, hold, created_at, prediction_date, updated_at, closed_at, source, campaign, in_charge, city, organization_city, key, separated_value, collected_at]
  });

  return parsed_data
}

async function ParseSupplyDeals(deals, pipelines) {
  const {
    SUPPLY_KWP_ID,
    SUPPLY_ACCESS_ID,
    SUPPLY_DELIVERY_ID,
    SUPPLY_VALUE_ID,
    SUPPLY_OPPORTUNITY_ID,
    SUPPLY_COMPANY_ID,
    SUPPLY_CITY_ID,
    SUPPLY_INSTALLATION_TYPE,
    SUPPLY_QUANTITY,
    SUPPLY_SELLER,
    SUPPLY_COST_PROJECTED,
    SUPPLY_COST_EFFECTIVE,
    SUPPLY_CONCLUSION_STATE,
    SUPPLY_PROJECT_NUMBER,
    SUPPLY_SERVICE_TYPE,
    SUPPLY_CONSTRUCTION_ETA,
    SUPPLY_WORK_SECURITY,
    SUPPLY_QUALITY
  } = process.env;

  console.log('\n==== parseando oportunidades =====\n');

  let parsed_data = {};

  const date_format = "DD[/]MM[/]YYYY"

  try {
    for (const deal of deals) {

      const {
        id,
        name,
        organization,
        rating,
        deal_stage,
        amount_unique,
        hold,
        created_at,
        updated_at,
        closed_at,
        deal_lost_reason,
        deal_source,
        campaign,
        user,
        win,
        prediction_date,
        deal_custom_fields,
      } = deal;

      const opportunity = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_OPPORTUNITY_ID);
      const company = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_COMPANY_ID);
      const kwp = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_KWP_ID);
      const access = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_ACCESS_ID);
      const delivery = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_DELIVERY_ID);
      const value = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_VALUE_ID);
      const city = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_CITY_ID);
      const installation_type = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_INSTALLATION_TYPE);
      const quantity = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_QUANTITY);
      const seller = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_SELLER);
      const cost_projected = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_COST_PROJECTED);
      const cost_efective = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_COST_EFFECTIVE);
      const conclusion_state = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_CONCLUSION_STATE);
      const project_number = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_PROJECT_NUMBER);
      const service_type = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_SERVICE_TYPE);
      const construction_eta = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_CONSTRUCTION_ETA);
      const security = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_WORK_SECURITY);
      const quality = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == SUPPLY_QUALITY);

      parsed_data[`${id}`] = {
        id: id,
        name: name || `n/a`,
        client: organization ? organization.name : `n/a`,
        rating: rating || `n/a`,
        deal_stage: deal_stage ? deal_stage.name : `n/a`,
        funnel: pipelines[`${deal_stage.id}`] || `n/a`,
        status: win ? 'vendida' : (win === false ? 'perdida' : 'em andamento'),
        deal_lost_reason: deal_lost_reason ? deal_lost_reason.name : `n/a`,
        amount_unique: amount_unique || `n/a`,
        hold: hold || `n/a`,
        created_at: created_at ? moment(created_at).format(date_format) : `n/a`,
        updated_at: updated_at ? moment(updated_at).format(date_format) : `n/a`,
        closed_at: closed_at ? moment(closed_at).format(date_format) : `n/a`,
        source: deal_source ? deal_source.name : `n/a`,
        campaign: campaign ? campaign.name : `n/a`,
        in_charge: user ? user.name : `n/a`,
        opportunity: opportunity ? `${opportunity.value}` : `n/a`,
        company: company ? `${company.value}` : `n/a`,
        collected_at: moment(new Date()).format(`${date_format} HH:mm`) || `n/a`,
        city: city ? city.value : 'n/a',
        kwp: kwp ? kwp.value : 'n/a',
        access: access ? access.value : 'n/a',
        delivery: delivery ? delivery.value : 'n/a',
        value: value ? value.value : 'n/a',
        prediction_date: prediction_date ? moment(prediction_date).format(date_format) : 'n/a',
        installation_type: installation_type ? installation_type.value : 'n/a',
        quantity: quantity ? quantity.value : 'n/a',
        seller: seller ? seller.value : 'n/a',
        cost_projected: cost_projected ? cost_projected.value : 'n/a',
        cost_efective: cost_efective ? cost_efective.value : 'n/a',
        conclusion_state: conclusion_state ? conclusion_state.value : 'n/a',
        project_number: project_number ? project_number.value : 'n/a',
        service_type: service_type ? service_type.value : 'n/a',
        construction_eta: construction_eta?.value ? construction_eta.value : 'n/a',
        quality: quality?.value ? quality.value : 'n/a',
        security: security?.value ? security.value : 'n/a',
      }
    }
  }
  catch (error) { console.error('ERROR', error) }

  parsed_data = Object.values(parsed_data).map((data) => {
    const {
      id,
      name,
      client,
      rating,
      deal_stage,
      funnel,
      status,
      deal_lost_reason,
      amount_unique,
      hold,
      created_at,
      updated_at,
      closed_at,
      source,
      campaign,
      in_charge,
      city,
      kwp,
      access,
      delivery,
      value,
      collected_at,
      prediction_date,
      installation_type,
      quantity,
      seller,
      cost_projected,
      cost_efective,
      conclusion_state,
      project_number,
      service_type,
      construction_eta,
      quality,
      security
    } = data;

    return [id, name, client, rating, deal_stage, funnel, status, deal_lost_reason, amount_unique, hold, prediction_date, created_at, updated_at, closed_at, source, campaign, in_charge, city, kwp, access, delivery, value, installation_type, quantity, seller, cost_projected, cost_efective, conclusion_state, project_number, service_type, construction_eta, quality, security, collected_at]
  });
  return parsed_data
}

// Pós venda
async function ParseBoaEnergiaDeals(deals, pipelines) {
  const {
    BOAENERGIA_NOTA_NPS,
    BOAENERGIA_PQ_NOTA_NPS,
    BOAENERGIA_NPS_REALIZADA,
    BOAENERGIA_DATA_NPS,
    BOAENERGIA_VALOR_VENDA,
    BOAENERGIA_CONCESSIONÁRIA_ENERGIA,
    BOAENERGIA_NOTA_COMISSIONAMENTO,
    BOAENERGIA_DATA_COMISSIONAMENTO,
    BOAENERGIA_PORQUE,
    BOAENERGIA_PROJECT_NUMBER,
  } = process.env;

  console.log('\n==== parseando oportunidades =====\n');

  let parsed_data = {};

  const date_format = "DD[/]MM[/]YYYY"

  try {
    for (const deal of deals) {

      const {
        id,
        name,
        organization,
        rating,
        deal_stage,
        amount_unique,
        hold,
        created_at,
        updated_at,
        closed_at,
        deal_lost_reason,
        deal_source,
        campaign,
        user,
        win,
        prediction_date,
        deal_custom_fields,
      } = deal;

      const nota_nps = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_NOTA_NPS);
      const pq_nota_nps = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_PQ_NOTA_NPS);
      const nps_realizada = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_NPS_REALIZADA);
      const data_nps = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_DATA_NPS);
      const valor_venda = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_VALOR_VENDA);
      const concessionaria_energia = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_CONCESSIONÁRIA_ENERGIA);
      const nota_comissionamento = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_NOTA_COMISSIONAMENTO);
      const data_comissionamento = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_DATA_COMISSIONAMENTO);
      const porque = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_PORQUE);
      const project_number = deal_custom_fields.find(({ custom_field_id }) => custom_field_id == BOAENERGIA_PROJECT_NUMBER);

      parsed_data[`${id}`] = {
        id: id,
        name: name || `n/a`,
        client: organization ? organization.name : `n/a`,
        rating: rating || `n/a`,
        deal_stage: deal_stage ? deal_stage.name : `n/a`,
        funnel: pipelines[`${deal_stage.id}`] || `n/a`,
        status: win ? 'vendida' : (win === false ? 'perdida' : 'em andamento'),
        deal_lost_reason: deal_lost_reason ? deal_lost_reason.name : `n/a`,
        amount_unique: amount_unique || `n/a`,
        hold: hold || `n/a`,
        created_at: created_at ? moment(created_at).format(date_format) : `n/a`,
        updated_at: updated_at ? moment(updated_at).format(date_format) : `n/a`,
        closed_at: closed_at ? moment(closed_at).format(date_format) : `n/a`,
        source: deal_source ? deal_source.name : `n/a`,
        campaign: campaign ? campaign.name : `n/a`,
        prediction_date: prediction_date ? moment(prediction_date).format(date_format) : 'n/a',
        in_charge: user ? user.name : `n/a`,
        collected_at: moment(new Date()).format(`${date_format} HH:mm`) || `n/a`,
        nota_nps: nota_nps?.value ? nota_nps.value : 'n/a',
        pq_nota_nps: pq_nota_nps?.value ? pq_nota_nps.value : 'n/a',
        nps_realizada: Array.isArray(nps_realizada?.value)
          ? nps_realizada?.value?.length > 0
            ? nps_realizada.value[0]
            : 'n/a'
          : nps_realizada?.value
            ? nps_realizada.value
            : 'n/a',
        data_nps: data_nps?.value ? data_nps.value : 'n/a',
        valor_venda: valor_venda?.value ? valor_venda.value : 'n/a',
        concessionaria_energia: concessionaria_energia?.value ? concessionaria_energia.value : 'n/a',
        nota_comissionamento: Array.isArray(nota_comissionamento?.value)
          ? nota_comissionamento?.value?.length > 0
            ? nota_comissionamento.value[0]
            : 'n/a'
          : nota_comissionamento?.value
            ? nota_comissionamento.value
            : 'n/a',
        data_comissionamento: data_comissionamento?.value ? data_comissionamento.value : 'n/a',
        porque: porque?.value ? porque.value : 'n/a',
        project_number: project_number?.value ? project_number.value : 'n/a',
      }
    }
  }
  catch (error) { console.error('ERROR', error) }

  parsed_data = Object.values(parsed_data).map((data) => {
    const {
      id,
      name,
      client,
      rating,
      deal_stage,
      funnel,
      status,
      deal_lost_reason,
      amount_unique,
      hold,
      created_at,
      updated_at,
      closed_at,
      source,
      campaign,
      in_charge,
      collected_at,
      prediction_date,
      nota_nps,
      pq_nota_nps,
      nps_realizada,
      data_nps,
      valor_venda,
      concessionaria_energia,
      nota_comissionamento,
      data_comissionamento,
      porque,
      project_number
    } = data;

    return [id, name, client, rating, deal_stage, funnel, status, deal_lost_reason, amount_unique, hold, prediction_date, created_at, updated_at, closed_at, source, campaign, in_charge, nota_nps, pq_nota_nps, nps_realizada, data_nps, valor_venda, concessionaria_energia, nota_comissionamento, data_comissionamento, porque, project_number, collected_at]
  });

  return parsed_data
}

async function ParseBoaEnergiaProducts(deals) {
  let parsed_data = [];

  try {
    for (const deal of deals) {
      const { id, deal_products } = deal;
      for (product of deal_products) {
        const { id: product_id, name, description, base_price, created_at, price, amount, recurrence, discount, discount_type, total } = product

        parsed_data.push([id, product_id, name, description, base_price, price, amount, discount, discount_type, total, recurrence, created_at]);
      }
    }
  }
  catch (error) { console.error(error) }

  return parsed_data;
}

async function InitDefault(token, city_id, key_id, opportunity_id, company_id, separated_value) {

  console.log(`\n==== iniciando coleta =====`);

  try {
    const organizations = await GetAll(token, 'organizations');
    const organizations_hashmap = {};

    organizations.forEach((element) => {
      organizations_hashmap[element.id] = element;
    })

    const pipelines = await GetPipelines(token);
    const pipelines_hashmap = ParseStagesFromPipelines(pipelines);

    const deals = await GetAll(token, 'deals');
    const parsed_deals = await ParseDefaultDeals(deals, organizations_hashmap, pipelines_hashmap, city_id, key_id, opportunity_id, company_id, separated_value);
    await SendToSheet(parsed_deals);

    console.log('\n==== coleta finalizada =====');
  }
  catch (error) { console.error(error) }

  return true
}

async function InitSupply(token, spreadsheet_id, spreadsheet_name) {
  console.log(`\n==== iniciando coleta =====`);

  try {
    const pipelines = await GetPipelines(token);
    const pipelines_hashmap = ParseStagesFromPipelines(pipelines);

    const deals = await GetAll(token, 'deals');
    const parsed_deals = await ParseSupplyDeals(deals, pipelines_hashmap);
    await SendToSheet(parsed_deals, spreadsheet_id, spreadsheet_name);

    console.log('\n==== coleta finalizada =====');
  }
  catch (error) { console.error(error) }

  return true
}

async function InitBoaEnergia(token, spreadsheet_id, spreadsheet_name) {
  console.log(`\n==== iniciando coleta =====`);

  try {
    const pipelines = await GetPipelines(token);
    const pipelines_hashmap = ParseStagesFromPipelines(pipelines);

    const deals = await GetAll(token, 'deals');
    const parsed_deals = await ParseBoaEnergiaDeals(deals, pipelines_hashmap);
    const parsed_products = await ParseBoaEnergiaProducts(deals);
    await SendToSheet(parsed_deals, spreadsheet_id, spreadsheet_name);
    await SendToSheet(parsed_products, spreadsheet_id, process.env.SPREADSHEET_BOAENERGIA_PRODUCTS_NAME,);

    console.log('\n==== coleta finalizada =====');
  }
  catch (error) { throw (new Error('coleta não realizada')) }

  return true
}

function ParseStagesFromPipelines(pipelines) {
  const hashmap = {};

  pipelines?.forEach((element) => {
    const { deal_stages } = element;
    deal_stages.forEach((stage) => {
      hashmap[stage.id] = element.name;
    })
  })

  return hashmap;
}


module.exports = {
  InitDefault,
  InitSupply,
  InitBoaEnergia,
  ParseStagesFromPipelines
};
