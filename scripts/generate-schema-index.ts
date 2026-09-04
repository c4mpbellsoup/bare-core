import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const schemasDir = path.resolve("schemas");
const outputFile = path.join(schemasDir, "index.ts");

async function findSchemas(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await findSchemas(fullPath)));
		} else if (
			entry.name.endsWith(".schema.json") &&
			entry.name !== "index.schema.json"
		) {
			files.push(fullPath);
		}
	}

	return files;
}

async function main() {
	const schemaFiles = (await findSchemas(schemasDir)).sort();

	const imports = schemaFiles.map((file, i) => {
		const relative =
			"./" + path.relative(schemasDir, file).replaceAll(path.sep, "/");

		return `import schema${i} from '${relative}';`;
	});

	const schemas = schemaFiles.map((_, i) => `\tschema${i},`).join("\n");

	const siteIndex = schemaFiles.findIndex(
		(file) => path.basename(file) === "site.schema.json",
	);

	const output = `${imports.join("\n")}

export const schemas = [
${schemas}
];

export const siteSchema = schema${siteIndex};
`;

	await writeFile(outputFile, output);

	console.log(`Generated ${path.relative(process.cwd(), outputFile)}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
