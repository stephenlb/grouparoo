import { connect } from "../connect";
import { validateQuery } from "../validateQuery";
import { getColumns, makeWhereClause, castValue } from "../util";

import {
  ProfilePropertyPluginMethod,
  ProfilePropertyPluginMethodResponse,
} from "@grouparoo/core";

export const profileProperty: ProfilePropertyPluginMethod = async ({
  profile,
  appOptions,
  sourceOptions,
  sourceMapping,
  profilePropertyRuleOptions,
  profilePropertyRuleFilters,
}) => {
  const table = sourceOptions.table;
  const tableCol = Object.keys(sourceMapping)[0];
  const profilePropertyMatch = Object.values(sourceMapping)[0];
  const aggregationMethod = profilePropertyRuleOptions["aggregation method"];
  const column = profilePropertyRuleOptions["column"];

  if (!aggregationMethod || !column) {
    return;
  }

  if (tableCol === column && aggregationMethod === "exact") {
    // don't return userId where userId = userId
    return;
  }

  const client = await connect(appOptions);
  const columns = await getColumns(client, table);
  const profileData = await profile.properties();

  if (!profileData.hasOwnProperty(profilePropertyMatch)) {
    throw `unknown profile property: ${profilePropertyMatch}`;
  }
  const columnValue = profileData[profilePropertyMatch].value;

  let aggSelect = `\`${column}\``;
  switch (aggregationMethod) {
    case "exact":
      break;
    case "average":
      aggSelect = `AVG(${aggSelect})`;
      break;
    case "count":
      aggSelect = `COUNT(${aggSelect})`;
      break;
    case "sum":
      aggSelect = `SUM(${aggSelect})`;
      break;
    case "min":
      aggSelect = `MIN(${aggSelect})`;
      break;
    case "max":
      aggSelect = `MAX(${aggSelect})`;
      break;
    default:
      throw `unknown aggregation method: ${aggregationMethod}`;
  }

  const params = [];
  const types = [];
  let query = `SELECT ${aggSelect} as __result FROM \`${table}\` WHERE`;
  query += makeWhereClause(
    columns,
    tableCol,
    null,
    "=",
    columnValue,
    params,
    types
  );

  for (const i in profilePropertyRuleFilters) {
    let { key, op, match } = profilePropertyRuleFilters[i];
    let sqlOp;
    let transform = null;
    switch (op) {
      case "equals":
        sqlOp = `=`;
        break;
      case "does not equal":
        sqlOp = `!=`;
        break;
      case "contains":
        sqlOp = `LIKE`;
        match = `%${match.toString().toLowerCase()}%`;
        transform = "LOWER";
        break;
      case "does not contain":
        sqlOp = `NOT LIKE`;
        match = `%${match.toString().toLowerCase()}%`;
        transform = "LOWER";
        break;
      case "greater than":
        sqlOp = `>`;
        break;
      case "less than":
        sqlOp = `<`;
        break;
      default:
        throw `unknown filter: ${op}`;
    }

    const filterClause = makeWhereClause(
      columns,
      key,
      transform,
      sqlOp,
      match,
      params,
      types
    );
    query += ` AND ${filterClause}`;
  }

  validateQuery(query);

  const options = { query, params, types };

  let response: ProfilePropertyPluginMethodResponse;
  try {
    const [rows] = await client.query(options);
    if (rows && rows.length > 0) {
      const row: { [key: string]: any } = rows[0];
      response = castValue(row.__result);
    }
  } catch (error) {
    throw new Error(
      `Error with BigQuery SQL Statement: Query - \`${options}\`, Error - ${error}`
    );
  }

  return response;
};
