import { compile } from "json-schema-to-typescript";
import fs from "node:fs/promises";
import path from "node:path";

const schemasDir = path.resolve("schemas");
const typesDir = path.resolve("types");

async function generateTypes() {
  await fs.rm(typesDir, { recursive: true, force: true });

  async function processDirectory(directory: string, relative = "") {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath, path.join(relative, entry.name));
        continue;
      }

      if (!entry.name.endsWith(".schema.json")) {
        continue;
      }

      const schema = JSON.parse(await fs.readFile(fullPath, "utf8"));

			const type = await compile(schema, schema.title ?? "GeneratedType", {
				cwd: path.dirname(fullPath),
      });

      const outputDirectory = path.join(typesDir, relative);
      await fs.mkdir(outputDirectory, { recursive: true });

      const outputName = entry.name.replace(".schema.json", ".ts");

      await fs.writeFile(path.join(outputDirectory, outputName), type);
    }
  }

  await processDirectory(schemasDir);
}

generateTypes();
