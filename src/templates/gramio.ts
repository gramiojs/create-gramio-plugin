import { type PreferencesType, uppercaseFirstLetter } from "../utils";

export function getIndex({ pluginName, storage }: PreferencesType) {
	return [
		`import { Plugin } from "gramio";`,
		storage
			? `import { type Storage, inMemoryStorage } from "@gramio/storage";`
			: "",
		"",
		`export interface ${uppercaseFirstLetter(pluginName)}Options {`,
		storage ? "	storage?: Storage" : "// TODO:",
		"}",
		"",
		`export function ${pluginName}(options?: ${uppercaseFirstLetter(
			pluginName,
		)}Options) {`,
		storage ? "const storage = options?.storage ?? inMemoryStorage()" : "",
		"",
		`return new Plugin("gramio-${pluginName}")`,
		"}",
	].join("\n");
}
