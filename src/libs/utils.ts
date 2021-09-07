import { existsSync, mkdirSync, readFileSync, promises as fsp } from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';
import { dirname, extname } from 'path';

import yaml from 'yaml';
import chalk from 'chalk';
import log from 'log-update';

const { readFile, writeFile } = fsp;

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

export function saveConfigFile({ key, password, themeId, previewUrl }: IConfigFile) {
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

            const { ':api_key': key, ':password': password, ':theme_id': themeId, ':preview_url': previewUrl } = config;

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

type LogMessageType = 'info' | 'pending' | 'success' | 'warning' | 'error';

export function logMessage(type: LogMessageType, message: string, done: boolean = false) {
    let color;
    let label;

    switch (type) {
        case 'pending':
            color = 'blue';
            label = 'Processing';

            break;
        case 'success':
            color = 'green';
            label = 'Complete';

            break;
        case 'warning':
            color = 'yellow';
            label = 'Warn';

            break;
        case 'error':
            color = 'red';
            label = 'Fail';

            break;
        default:
            color = '';
            label = '';

            break;
    }

    if (color) {
        log(chalk`[${getCurrentLocalteTime()}] {${color} [${label}]} ${message}`);
    } else {
        log(chalk`[${getCurrentLocalteTime()}] ${message}`);
    }

    if (done) {
        log.done();
    }
}

export function checkFileUploadPermission (filename: string) {
    const allowedExtensions = [
        '.css',
        '.eot',
        '.gif',
        '.html',
        '.jpeg',
        '.jpg',
        '.js',
        '.json',
        '.png',
        '.svg',
        '.ttf',
        '.woff',
        '.woff2'
    ];

    const allowedFolders = [
        'configs',
        'css',
        'elements',
        'img',
        'js',
        'layouts',
        'pages'
    ]

    const ignoredFolders = [
        '.idea',
        '.vscode',
        'node_modules',
        'dist'
    ]

    const allowedParentFolders = [
        'css',
        'elements',
        'img',
        'js'
    ]

    const extension = extname(filename);
    const parentFolder = dirname(filename).split('/')[0];

    if ( ignoredFolders.includes(parentFolder) ) {
        return { isAllowed: false };
    }

    if (!allowedExtensions.includes(extension)) {
        return {
            isAllowed: false,
            message: `File extension not allowed (${chalk.magenta(extension)})`
        };
    }

    if (!allowedFolders.includes(parentFolder)) {
        return {
            isAllowed: false,
            message: `You cannot create or upload to this folder (${chalk.magenta(parentFolder)})`
        };
    }

    if (
        dirname(filename).split('/').length > 1
        && !allowedParentFolders.includes(parentFolder)
    ) {
        return {
            isAllowed: false,
            message: `You cannot create subfolders in this folder (${chalk.magenta(parentFolder)})`
        };
    }
    
    return { isAllowed: true };
}

export function prepareToUpload (filename: string) {
    const assetStartingWithSlash = filename.startsWith('/') ? filename : `/${filename}`;
    const fileContent = readFileSync(`.${assetStartingWithSlash}`);
    const isBinary = isBinaryFileSync(`.${assetStartingWithSlash}`);

    return {
        assetStartingWithSlash: assetStartingWithSlash,
        fileContent: fileContent,
        isBinary: isBinary
    }
}