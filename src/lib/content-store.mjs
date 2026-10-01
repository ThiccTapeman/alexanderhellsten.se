import { collectionConfig } from "./content-schema.mjs";

export function contentStore(db) {
  return {
    async list(name) {
      const config = collectionConfig(name);
      const columns = config.fields.map(([field]) => `"${field}"`).join(", ");
      const { rows } = await db.query(`SELECT id, position, version, ${columns} FROM "${name}" ORDER BY position, id`);
      return rows;
    },
    async save(name, input, id = null, version = null) {
      const config = collectionConfig(name);
      const record = config.schema.parse(input);
      const fields = [...config.fields.map(([field]) => field), "position"];
      const values = fields.map((field) => record[field]);
      if (id) {
        const assignments = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
        const { rows } = await db.query(`UPDATE "${name}" SET ${assignments}, version = version + 1, updated_at = now() WHERE id = $${values.length + 1} AND version = $${values.length + 2} RETURNING id`, [...values, id, version]);
        if (!rows.length) return false;
      } else {
        const columns = fields.map((field) => `"${field}"`).join(", ");
        await db.query(`INSERT INTO "${name}" (${columns}) VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})`, values);
      }
      return true;
    },
    async remove(name, id, version) {
      collectionConfig(name);
      const { rows } = await db.query(`DELETE FROM "${name}" WHERE id = $1 AND version = $2 RETURNING id`, [id, version]);
      return rows.length > 0;
    },
  };
}
