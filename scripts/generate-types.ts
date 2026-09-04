import { compile } from "json-schema-to-typescript";
import fs from "node:fs/promises";
import path from "node:path";

const schemaPath = path.resolve("schemas/site.schema.json");
const typesPath = path.resolve("types.ts");

async function generateTypes() {
	const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));

	const types = await compile(schema, schema.title ?? "Site", {
		cwd: path.dirname(schemaPath),
	});

	await fs.mkdir(path.dirname(typesPath), { recursive: true });
	await fs.writeFile(typesPath, types);
}

generateTypes();
