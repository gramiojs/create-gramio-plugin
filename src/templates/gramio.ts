import { type PreferencesType, uppercaseFirstLetter } from "../utils";

export function getIndex({ pluginName }: PreferencesType) {
	return [
		`import { Plugin } from "gramio";`,
		"",
		`export interface ${uppercaseFirstLetter(pluginName)} {`,
		"",
		"}",
	].join("\n");
}
