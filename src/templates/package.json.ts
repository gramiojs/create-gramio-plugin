import { dependencies } from "../deps";
import { type PreferencesType, pmExecuteMap } from "../utils";

export function getPackageJson({
	packageManager,
	linter,
	others,
	pluginName,
}: PreferencesType) {
	const sample = {
		name: `gramio-${pluginName}`,
		version: "0.0.1",
		description: "Plugin for GramIO",
		keywords: ["gramio", "gramio-plugin"],
		scripts: {
			dev:
				packageManager === "bun"
					? "bun  --watch src/index.ts"
					: `${pmExecuteMap[packageManager]} tsx watch src/index.ts`,
		} as Record<string, string>,
		dependencies: {
			gramio: dependencies.gramio,
		} as Record<keyof typeof dependencies, string>,
		devDependencies: {
			typescript: dependencies.typescript,
		} as Record<keyof typeof dependencies, string>,
	};

	if (packageManager === "bun")
		sample.devDependencies["@types/bun"] = dependencies["@types/bun"];
	else sample.devDependencies["@types/node"] = dependencies["@types/node"];

	if (linter === "Biome") {
		sample.scripts.lint = `${pmExecuteMap[packageManager]} @biomejs/biome check src`;
		sample.scripts["lint:fix"] = `${packageManager} run lint --apply`;
		sample.devDependencies["@biomejs/biome"] = dependencies["@biomejs/biome"];
	}
	if (linter === "ESLint") {
		sample.scripts.lint = `${pmExecuteMap[packageManager]} eslint \"src/**/*.ts\"`;
		sample.scripts["lint:fix"] =
			`${packageManager} eslint \"src/**/*.ts\" --fix`;
		sample.devDependencies.eslint = dependencies.eslint;
		sample.devDependencies["eslint-config-love"] =
			dependencies["eslint-config-love"];
		sample.devDependencies["eslint-plugin-promise"] =
			dependencies["eslint-plugin-promise"];
		sample.devDependencies["eslint-plugin-import"] =
			dependencies["eslint-plugin-import"];
		sample.devDependencies["eslint-plugin-n"] = dependencies["eslint-plugin-n"];
		sample.devDependencies["@typescript-eslint/eslint-plugin"] =
			dependencies["@typescript-eslint/eslint-plugin"];
	}

	if (others.includes("Husky")) {
		sample.devDependencies.husky = dependencies.husky;
		sample.scripts.prepare = "husky";
	}

	return JSON.stringify(sample, null, 2);
}
