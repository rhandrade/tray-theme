import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";

interface IConfigFile {
    key: string;
    password: string;
    themeId: number;
    previewUrl: string;
}

interface IConfigFileLoaded {
    api_key: string;
    password: string;
    theme_id: number;
    preview_url: string;
}

export function saveConfigFile({ key, password, themeId, previewUrl }: IConfigFile) {
    const fileDataAsObject = {
        api_key: key,
        theme_id: themeId,
        preview_url: previewUrl,
        password,
    };

    const configFileData = yaml.dump(fileDataAsObject, {
        forceQuotes: true,
    });

    return writeFile("config.yml", configFileData)
        .then(() => ({
            success: true,
            message: "Configuration file created with success.",
        }))
        .catch((error) => ({
            success: false,
            message: `Unable to create config file. ${error}`,
        }));
}

export async function loadConfigFile(){

    return readFile("config.yml", { encoding: "utf8" })
        .then((data) => {
            const config = yaml.load(data) as IConfigFileLoaded;

            const { api_key: key, password, theme_id: themeId, preview_url: previewUrl } = config;

            return {
                key,
                password,
                themeId,
                previewUrl,
            };
        })
        .catch((error) => ({
            success: false,
            message: `Unable to load config file. ${error}`,
        }));
}
