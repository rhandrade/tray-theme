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

/*
    Checks whether the folder should be ignored.
    Does not log any messages
*/
function validateShouldUploadFile (parentFolder: string) {
    const ignoredFolders = [
        '.idea',
        '.vscode',
        'node_modules',
        'dist'
    ]

    if ( ignoredFolders.includes(parentFolder) ) {
        return {
            isAllowed: false,
            message: null
        };
    }

    return { isAllowed: true };  
}

/*
    Checks whether the file extension is allowed
*/
function validateExtension (extension: string) {
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

    if (!allowedExtensions.includes(extension)) {
        return {
            isAllowed: false,
            message: `File extension not allowed (${chalk.magenta(extension)})`
        };
    }

    return { isAllowed: true };  
}

/*
    Checks whether the folder accepts uploads at all
*/
function validateShouldUploadToFolder (parentFolder: string) {
    const allowedFolders = [
        'configs',
        'css',
        'elements',
        'img',
        'js',
        'layouts',
        'pages'
    ]

    if (!allowedFolders.includes(parentFolder)) {
        return {
            isAllowed: false,
            message: `You cannot create or upload to this folder (${chalk.magenta(parentFolder)})`
        };
    }

    return { isAllowed: true };  
}

/*
    Checks whether the folder allow the creation of subfolders
*/
function validateCanHaveSubfolders (filePath: string) {
    const parentFolder = filePath.split('/')[0];

    const allowedParentFolders = [
        'css',
        'elements',
        'img',
        'js'
    ]

    /*
        If the filePath has more than one element separated by slashes,
        it means the upload would happen on a subfolder
    */
    if (
        filePath.split('/').length > 1
        && !allowedParentFolders.includes(parentFolder)
    ) {
        return {
            isAllowed: false,
            message: `You cannot create subfolders in this folder (${chalk.magenta(parentFolder)})`
        };
    }

    return { isAllowed: true };  
}

/*
    FILE UPLOAD VALIDATION
    Performs several checks to identify whether the file should be uploaded.
*/
export function validateFileIsAllowed (filename: string) {
    const extension = extname(filename);
    const filePath = dirname(filename);
    const parentFolder = filePath.split('/')[0];

    const shouldUploadValidation = validateShouldUploadFile(parentFolder);

    if ( !shouldUploadValidation.isAllowed ) {
        return shouldUploadValidation;
    }    

    const extensionValidation = validateExtension(extension);

    if ( !extensionValidation.isAllowed ) {
        return extensionValidation;
    }

    const shouldUploadToFolderValidation = validateShouldUploadToFolder(parentFolder);

    if ( !shouldUploadToFolderValidation.isAllowed ) {
        return shouldUploadToFolderValidation;
    }

    const canHaveSubfoldersValidation = validateCanHaveSubfolders(filePath);

    if ( !canHaveSubfoldersValidation.isAllowed ) {
        return canHaveSubfoldersValidation;
    }

    return { isAllowed: true };
}

/*
    PREPARE TO UPLOAD
    Converts all of the file's data to a format that the API can accept
*/
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