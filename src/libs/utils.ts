import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
// import yaml from 'js-yaml';
import yaml from 'yaml';
import { dirname } from 'path';

interface IConfigFile {
    key: string;
    password: string;
    themeId: number;
    previewUrl: string;
}

interface IConfigFileLoaded {
    ':api_key': string;
    ':password': string;
    ':theme_id': number;
    ':preview_url': string;
}

export function saveConfigFile({
    key, password, themeId, previewUrl,
}: IConfigFile) {

    const fileDataAsObject: IConfigFileLoaded = {
        ':api_key': key,
        ':password': password,
        ':theme_id': themeId,
        ':preview_url': previewUrl,
    };

    const configFileData = yaml.stringify(fileDataAsObject);

    return writeFile('config.yml', configFileData)
        .then(() => ({
            success: true,
            message: 'Configuration file created with success.',
        }))
        .catch((error) => ({
            success: false,
            message: `Unable to create config file. ${error}`,
        }));

}

export async function loadConfigFile() {

    return readFile('config.yml', { encoding: 'utf8' })
        .then((data) => {

            const config = yaml.parse(data) as IConfigFileLoaded;

            const {
                ':api_key': key, ':password': password, ':theme_id': themeId, ':preview_url': previewUrl,
            } = config;

            return {
                success: true,
                config: {
                    key,
                    password,
                    themeId,
                    previewUrl,
                },
            };

        })
        .catch((error) => ({
            success: false,
            message: `Unable to load config file. ${error}`,
        }));

}

export function getCurrentLocalteTime() {

    return new Date().toLocaleTimeString();

}

export async function saveAssetFile(path: string, data: Buffer) {

    const fileDirname = dirname(path);

    if (!existsSync(fileDirname)) {

        mkdirSync(fileDirname, { recursive: true });

    }

    return writeFile(path, data)
        .then(() => ({ success: true }))
        .catch((error) => ({
            success: false,
            message: `Unable to create '${path}' file. ${error}`,
        }));

}
