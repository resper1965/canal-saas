import { getAuthTables } from "better-auth/db";
import { auth } from "./generate-schema.js";

async function run() {
  const tables = getAuthTables(auth.options);

  for (const [, value] of Object.entries(tables)) {
    console.log(`CREATE TABLE IF NOT EXISTS "${value.modelName}" (`);
    const cols = [];
    for (const [fKey, fValue] of Object.entries(value.fields)) {
      let type = "TEXT";
      if (fValue.type === "boolean" || fValue.type === "number") type = "INTEGER";
      let col = `  "${fValue.fieldName || fKey}" ${type}`;
      // Use 'optional' (not 'isOptional') per better-auth DB field API
      if (!fValue.optional) col += " NOT NULL";
      // Use 'unique' (not 'isUnique') per better-auth DB field API
      if (fValue.unique) col += " UNIQUE";
      if (fValue.references) {
        col += ` REFERENCES "${fValue.references.model}"("${fValue.references.field}") ON DELETE CASCADE`;
      }
      cols.push(col);
    }
    console.log(cols.join(",\n"));
    console.log(");\n");
  }
}
run();

