#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const commander_1 = require("commander");
const isbinaryfile_1 = require("isbinaryfile");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const log_update_1 = __importDefault(require("log-update"));
const glob_1 = __importDefault(require("glob"));
const open_1 = __importDefault(require("open"));
const chokidar_1 = __importDefault(require("chokidar"));
const slash_1 = __importDefault(require("slash"));
const package_json_1 = __importDefault(require("../package.json"));
const TrayApi_1 = require("./api/v1/TrayApi");
const utils_1 = require("./libs/utils");
/**
 * Create configure file
 */
commander_1.program
    .command('configure')
    .arguments('[key] [password] [theme_id]')
    .description('Create configuration file', {
    key: 'Api key',
    password: 'Api password',
    theme_id: 'Theme id',
})
    .action((key, password, theme_id) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = [];
    let answers = {
        key,
        password,
        themeId: theme_id,
    };
    if (!answers.key) {
        questions.push({
            type: 'input',
            message: 'Enter api key',
            name: 'key',
        });
    }
    if (!answers.password) {
        questions.push({
            type: 'input',
            message: 'Enter api password',
            name: 'password',
        });
    }
    if (!answers.themeId) {
        questions.push({
            type: 'input',
            message: 'Enter theme id',
            name: 'themeId',
        });
    }
    if (questions.length > 0) {
        const missingAnswers = yield inquirer_1.default.prompt(questions);
        answers = Object.assign(Object.assign({}, answers), missingAnswers);
    }
    const api = new TrayApi_1.TrayApi({
        key: answers.key,
        password: answers.password,
        themeId: answers.themeId,
    });
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Processing]} Verifying data...`);
    const resultCheckConfig = yield api.checkConfiguration();
    if (!resultCheckConfig.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Api key, password or theme id not correctly. Please verify and tray again.`);
        log_update_1.default.done();
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Data verified with success.`);
    log_update_1.default.done();
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Processing]} Creating config.yml file...`);
    const resultSaveFile = yield utils_1.saveConfigFile({
        key: answers.key,
        password: answers.password,
        themeId: answers.themeId,
        previewUrl: resultCheckConfig.previewUrl,
    });
    if (!resultSaveFile.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultSaveFile.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} ${resultSaveFile.message}`);
    log_update_1.default.done();
}));
/**
 * List all themes available at store
 */
commander_1.program
    .command('themes')
    .description('List all themes available at store')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Getting all available themes...`);
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    const { key, password } = resultLoadFile.config;
    const api = new TrayApi_1.TrayApi({ key, password });
    const themesResult = yield api.getThemes();
    if (!themesResult.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${themesResult.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Themes available:`);
    console.table(themesResult.themes);
}));
/**
 * Create a new theme on store
 */
commander_1.program
    .command('new')
    .arguments('<key> <password> <theme_name> [theme_base]')
    .description('Create a new theme in store', {
    key: 'Api key',
    password: 'Api password',
    theme_name: 'Name of the theme',
    theme_base: 'Base theme for this new theme - default: default',
})
    .action((key, password, theme_name, theme_base) => __awaiter(void 0, void 0, void 0, function* () {
    const api = new TrayApi_1.TrayApi({ key, password });
    const resultCheckConfig = yield api.checkConfiguration();
    if (!resultCheckConfig.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Api key or password not correctly. Please verify and tray again.`);
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Creating theme {magenta ${theme_name}} on store...`);
    const resultCreationTheme = theme_base
        ? yield api.createTheme(theme_name, theme_base)
        : yield api.createTheme(theme_name);
    if (!resultCreationTheme.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultCreationTheme.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Theme ${theme_name} created on store.`);
    log_update_1.default.done();
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Creating config file...`);
    const { themeId, previewUrl } = resultCreationTheme;
    const resultSaveFile = yield utils_1.saveConfigFile({
        key,
        password,
        themeId,
        previewUrl,
    });
    if (!resultSaveFile.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultSaveFile.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} ${resultSaveFile.message}`);
    log_update_1.default.done();
}));
/**
 * Clean theme cache on store
 */
commander_1.program
    .command('clean-cache [theme_id]')
    .description('Clean theme cache on store', {
    theme_id: 'Id of theme to clean cache - default: configured theme id',
})
    .action((theme_id) => __awaiter(void 0, void 0, void 0, function* () {
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
        process.exit();
    }
    const { key, password, themeId } = resultLoadFile.config;
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Cleaning cache from configured theme id ${theme_id || themeId}...`);
    const api = new TrayApi_1.TrayApi({ key, password, themeId });
    const cleanCacheResult = theme_id ? yield api.cleanCache(theme_id) : yield api.cleanCache();
    if (!cleanCacheResult.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error from api: ${cleanCacheResult.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Cache from theme with id ${theme_id || themeId} cleaned.`);
    log_update_1.default.done();
}));
/**
 * Delete a theme from store
 */
commander_1.program
    .command('delete-theme')
    .arguments('<theme_id>')
    .description('Delete a theme from store', {
    theme_id: 'Id of theme to remove',
})
    .action((theme_id) => __awaiter(void 0, void 0, void 0, function* () {
    const question = yield inquirer_1.default.prompt({
        type: 'confirm',
        message: 'Do you really want to delete this theme? This action cannot be undone.',
        name: 'confirmDelete',
        default: false,
    });
    if (!question.confirmDelete) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Aborted]} Deletion of theme ${theme_id} was aborted by user.`);
        process.exit();
    }
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
        process.exit();
    }
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Deleting theme with id {magenta ${theme_id}} on store...`);
    const { key, password, themeId } = resultLoadFile.config;
    const api = new TrayApi_1.TrayApi({ key, password, themeId });
    const deleteResult = yield api.deleteTheme(theme_id);
    if (!deleteResult.success) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error from api: ${deleteResult.message}.`);
        log_update_1.default.done();
        process.exit();
    }
    if (deleteResult.message) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Theme with id ${theme_id} deleted with message: ${deleteResult.message}.`);
    }
    else {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Theme with id ${theme_id} deleted.`);
    }
    log_update_1.default.done();
}));
commander_1.program
    .command('download')
    .arguments('[files...]')
    .action((files) => __awaiter(void 0, void 0, void 0, function* () {
    let assets = files;
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
        process.exit();
    }
    const { key, password, themeId } = resultLoadFile.config;
    const api = new TrayApi_1.TrayApi({ key, password, themeId });
    if (!assets.length) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] Listing files that need to be downloaded...`);
        const themeAssetsResults = yield api.getThemeAssets();
        if (!themeAssetsResults.success) {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error from api': ${themeAssetsResults.message}.`);
            process.exit();
        }
        assets = themeAssetsResults.assets.map(({ path }) => path);
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] List retrived.`);
        log_update_1.default.done();
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] Downloading ${themeAssetsResults.quantity} files...`);
        log_update_1.default.done();
    }
    else {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] Downloading ${assets.length} files...`);
        log_update_1.default.done();
    }
    for (const file of assets) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Downloading file '${file}'...`);
        // eslint-disable-next-line no-await-in-loop
        const response = yield api.getThemeAsset(file.startsWith('/') ? file : `/${file}`);
        const { path, content } = response.asset;
        // eslint-disable-next-line no-await-in-loop
        const saveFileResult = yield utils_1.saveAssetFile(path, content);
        if (!saveFileResult.success) {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error when saving file '${file}'. Error: ${saveFileResult.message}.`);
        }
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} File '${file}' downloaded.`);
        log_update_1.default.done();
    }
}));
commander_1.program
    .command('upload')
    .arguments('[files...]')
    .action((files) => __awaiter(void 0, void 0, void 0, function* () {
    let assets = files;
    if (!assets.length) {
        assets = glob_1.default.sync('**/*.*');
        assets = assets.filter((item) => item !== 'config.yml');
    }
    console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] Uploading ${assets.length} files...`);
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
        process.exit();
    }
    const { key, password, themeId } = resultLoadFile.config;
    const api = new TrayApi_1.TrayApi({ key, password, themeId });
    let successAssets = 0;
    let errorAssets = 0;
    for (const asset of assets) {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Uploading file '${asset}'... `);
        const assetStartingWithSlash = asset.startsWith('/') ? asset : `/${asset}`;
        const fileContent = fs_1.readFileSync(`.${assetStartingWithSlash}`);
        const isBinary = isbinaryfile_1.isBinaryFileSync(`.${assetStartingWithSlash}`);
        // eslint-disable-next-line no-await-in-loop
        const sendFileResult = yield api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);
        if (!sendFileResult.success) {
            errorAssets++;
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error when uploading file '${asset}'. Error: ${sendFileResult.message}.`);
            log_update_1.default.done();
        }
        else {
            successAssets++;
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} File '${asset}' uploaded.`);
            log_update_1.default.done();
        }
    }
    console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] Upload process finished. | Sent ${successAssets} files with success. | ${errorAssets} files could not be sent.`);
}));
commander_1.program
    .command('delete-file')
    .alias('rm')
    .arguments('<files...>')
    .action((files) => __awaiter(void 0, void 0, void 0, function* () {
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red Fail} ${resultLoadFile.message}.`);
        process.exit();
    }
    const { key, password, themeId } = resultLoadFile.config;
    const api = new TrayApi_1.TrayApi({ key, password, themeId });
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue Processing} Deleting file '${file}'...`);
        const response = yield api.deleteThemeAsset(file);
        if (!response.success) {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red Fail} Error from api when deleting file '${file}': ${response.message}.`);
        }
        else {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green Complete} File '${file}' deleted.`);
        }
        log_update_1.default.done();
    }));
}));
commander_1.program
    .command('watch')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
        process.exit();
    }
    const { key, password, themeId } = resultLoadFile.config;
    const api = new TrayApi_1.TrayApi({ key, password, themeId });
    const watcher = chokidar_1.default.watch('./', {
        ignored: /(^|[/\\])\../,
        persistent: true,
        ignoreInitial: true,
    });
    watcher
        .on('ready', () => {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] Watching files...`);
    })
        .on('add', (path) => __awaiter(void 0, void 0, void 0, function* () {
        const asset = slash_1.default(path);
        const assetStartingWithSlash = asset.startsWith('/') ? asset : `/${asset}`;
        const fileContent = fs_1.readFileSync(`.${assetStartingWithSlash}`);
        const isBinary = isbinaryfile_1.isBinaryFileSync(`.${assetStartingWithSlash}`);
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Uploading file '${asset}'...`);
        const sendFileResult = yield api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);
        if (!sendFileResult.success) {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error when uploading file '${asset}'. Error: ${sendFileResult.message}.`);
            log_update_1.default.done();
        }
        else {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} File '${asset}' uploaded.`);
            log_update_1.default.done();
        }
    }))
        .on('change', (path) => __awaiter(void 0, void 0, void 0, function* () {
        const asset = slash_1.default(path);
        const assetStartingWithSlash = asset.startsWith('/') ? asset : `/${asset}`;
        const fileContent = fs_1.readFileSync(`.${assetStartingWithSlash}`);
        const isBinary = isbinaryfile_1.isBinaryFileSync(`.${assetStartingWithSlash}`);
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Uploading file '${asset}'...`);
        const sendFileResult = yield api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);
        if (!sendFileResult.success) {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red [Fail]} Error when uploading file '${asset}'. Error: ${sendFileResult.message}.`);
            log_update_1.default.done();
        }
        else {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} File '${asset}' uploaded.`);
            log_update_1.default.done();
        }
    }))
        .on('unlink', (path) => __awaiter(void 0, void 0, void 0, function* () {
        const asset = slash_1.default(path);
        const assetStartingWithSlash = asset.startsWith('/') ? asset : `/${asset}`;
        log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue Processing} Deleting file '${asset}'...`);
        const response = yield api.deleteThemeAsset(assetStartingWithSlash);
        if (!response.success) {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red Fail} Error from api when deleting file '${assetStartingWithSlash}': ${response.message}.`);
        }
        else {
            log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green Complete} File '${assetStartingWithSlash}' deleted.`);
        }
        log_update_1.default.done();
    }))
        .on('addDir', () => {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {yellow [Warn]} Creating empty directory is not supported by Tray API. Ignoring....`);
    })
        .on('unlinkDir', () => {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {yellow [Warn]} Deleting directory is not supported by Tray CLI API. Please delete using admin panel. Ignoring....`);
    })
        .on('error', (error) => {
        console.log(`Watcher error: ${error}`);
    });
}));
commander_1.program
    .command('open')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const resultLoadFile = yield utils_1.loadConfigFile();
    if (!resultLoadFile.success) {
        console.log(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {red Fail} ${resultLoadFile.message}.`);
        process.exit();
    }
    const { previewUrl } = resultLoadFile.config;
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {blue [Processing]} Opening theme preview page...`);
    yield open_1.default(previewUrl, { wait: true });
    log_update_1.default(chalk_1.default `[${utils_1.getCurrentLocalteTime()}] {green [Complete]} Theme preview page opened in default browser.`);
    log_update_1.default.done();
}));
commander_1.program.version(package_json_1.default.version).name('tray');
commander_1.program.parse(process.argv);
