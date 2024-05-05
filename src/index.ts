#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { prompt } from "enquirer";
import minimist from "minimist";
import task from "tasuku";

import {
	getIndex,
	getInstallCommands,
	getPackageJson,
	getReadme,
	getTSConfig,
} from "./templates";
import {
	Preferences,
	type PreferencesType,
	createOrFindDir,
	detectPackageManager,
	exec,
} from "./utils";

const args = minimist(process.argv.slice(2));
const preferences = new Preferences();

const packageManager = detectPackageManager();

const dir = args._.at(0);
if (!dir)
	throw new Error(
		`Specify the folder like this - ${packageManager} create gramio DIR-NAME`,
	);

const projectDir = path.resolve(`${process.cwd()}/`, dir);

createOrFindDir(projectDir).then(async () => {
	preferences.dir = dir;
	preferences.packageManager = packageManager;

	const { pluginName } = await prompt<{ pluginName: string }>({
		type: "input",
		name: "pluginName",
		message: "Enter the name of the plugin: (without gramio prefix)",
	});
	preferences.pluginName = pluginName.toLowerCase();

	const { storage } = await prompt<{ storage: boolean }>({
		type: "toggle",
		name: "storage",
		initial: "no",
		message: "Will your plugin use storage?",
	});
	preferences.storage = storage;

	const { linter } = await prompt<{ linter: PreferencesType["linter"] }>({
		type: "select",
		name: "linter",
		message: "Select linters/formatters:",
		choices: ["None", "ESLint", "Biome"],
	});
	preferences.linter = linter;

	const { others } = await prompt<{ others: PreferencesType["others"] }>({
		type: "multiselect",
		name: "others",
		message: "Select others tools: (Space to select, Enter to continue)",
		choices: ["Husky"],
	});
	preferences.others = others;

	if (!others.includes("Husky")) {
		const { git } = await prompt<{ git: boolean }>({
			type: "toggle",
			name: "git",
			initial: "yes",
			message: "Create an empty Git repository?",
		});
		preferences.git = git;
	} else preferences.git = true;

	await task("Generating a template...", async ({ setTitle }) => {
		if (linter === "ESLint")
			await fs.writeFile(
				`${projectDir}/.eslintrc`,
				JSON.stringify({ extends: ["standard-with-typescript"] }, null, 2),
			);
		await fs.writeFile(
			`${projectDir}/package.json`,
			getPackageJson(preferences),
		);
		await fs.writeFile(`${projectDir}/tsconfig.json`, getTSConfig());
		await fs.writeFile(`${projectDir}/README.md`, getReadme(preferences));
		await fs.writeFile(
			`${projectDir}/.gitignore`,
			["dist", "node_modules", ".env"].join("\n"),
		);

		await fs.mkdir(`${projectDir}/src`);
		await fs.writeFile(`${projectDir}/src/index.ts`, getIndex(preferences));

		setTitle("Template generation is complete!");
	});

	const commands = getInstallCommands(preferences);

	for await (const command of commands) {
		await task(command, async () => {
			await exec(command, {
				cwd: projectDir,
			});
		});
	}
});
