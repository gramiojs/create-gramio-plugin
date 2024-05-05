import { type PreferencesType, pmExecuteMap } from "../utils";

export function getInstallCommands({
	packageManager,
	linter,
	git,
	others,
}: PreferencesType) {
	const commands: string[] = [];
	if (git) commands.push("git init");

	commands.push(`${packageManager} install`);
	if (others.includes("Husky") && linter !== "None")
		commands.push(`echo "${packageManager} run lint:fix" > .husky/pre-commit`);

	if (linter === "Biome")
		commands.push(`${pmExecuteMap[packageManager]} @biomejs/biome init`);
	if (linter !== "None") commands.push(`${packageManager} run lint:fix`);

	return commands;
}
