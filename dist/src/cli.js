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
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const log_update_1 = __importDefault(require("log-update"));
// import chokidar from 'chokidar';
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
    const resultCheckConfig = yield api.checkConfiguration();
    if (!resultCheckConfig.success) {
        console.log(chalk_1.default `{red [Fail]} Api key, password or theme id not correctly. Please verify and tray again.`);
        process.exit();
    }
    const resultSaveFile = yield utils_1.saveConfigFile({
        key: answers.key,
        password: answers.password,
        themeId: answers.themeId,
        previewUrl: resultCheckConfig.previewUrl,
    });
    if (!resultSaveFile.success) {
        console.log(chalk_1.default `{red [Fail]} ${resultSaveFile.message}.`);
        process.exit();
    }
    console.log(chalk_1.default `{green [Complete]} ${resultSaveFile.message}`);
}));
/**
 * List all themes available at store
 */
commander_1.program
    .command('themes')
    .description('List all themes available at store')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const resultLoadFile = yield utils_1.loadConfigFile();
    console.log(resultLoadFile);
    // if (!resultLoadFile.success) {
    //     console.log(chalk`{red [Fail]} ${resultLoadFile.message}.`);
    //     process.exit();
    // }
    // const { key, password,  } = resultLoadFile.config;
    // const api = new TrayApi(config);
    // const themesResult = await api.getThemes();
    // if (!themesResult.success) {
    //     console.log(chalk`{red [Fail]} ${themesResult.message}.`);
    //     process.exit();
    // }
    // console.log(chalk`{green [Complete]} Themes available:`);
    // console.table(themesResult.themes);
}));
// /**
//  * Create a new theme on store
//  */
// program
//     .command('new')
//     .arguments('<key> <password> <theme_name> [theme_base]')
//     .description('Create a new theme in store', {
//         key        : 'Api key',
//         password   : 'Api password',
//         theme_name : 'Name of the theme',
//         theme_base : 'Base theme for this new theme - default: default'
//     })
//     .action(async (key, password, theme_name, theme_base) => {
//         let api = new Api(key, password);
//         let resultCheckConfig = await api.checkConfiguration();
//         if(!resultCheckConfig.success){
//             console.log(chalk`{red [Fail]} Api key or password not correctly. Please verify and tray again.`);
//             process.exit();
//         }
//         log(chalk`{blue [Processing]} Creating theme {magenta ${theme_name}} on store...`);
//         let resultCreationTheme = theme_base ? await api.createTheme(theme_name, theme_base) : await api.createTheme(theme_name);
//         if(!resultCreationTheme.success){
//             log(chalk`{red [Fail]} ${resultCreationTheme.message}.`);
//             log.done();
//             process.exit();
//         }
//         log(chalk`{green [Complete]} Theme ${theme_name} created on store.`);
//         log.done();
//         log(chalk`{blue [Processing]} Creating config file...`);
//         let resultSaveFile = await utils.saveConfigFile(key, password, resultCreationTheme.themeId, resultCreationTheme.previewUrl);
//         if(!resultSaveFile.success){
//             log(chalk`{red [Fail]} ${resultSaveFile.message}.`);
//             log.done();
//             process.exit();
//         }
//         log(chalk`{green [Complete]} ${resultSaveFile.message}`);
//         log.done();
//     });
// /**
//  * Clean theme cache on store
//  */
// program
//     .command('clean-cache [theme_id]')
//     .description('Clean theme cache on store', {
//         theme_id : 'Id of theme to clean cache - default: configured theme id'
//     })
//     .action(async (theme_id) => {
//         let resultLoadFile = await utils.loadConfigFile();
//         if(!resultLoadFile.success){
//             console.log(chalk`{red [Fail]} ${resultLoadFile.message}.`);
//             process.exit();
//         }
//         let config = resultLoadFile.config;
//         log(chalk`{blue [Processing]} Cleaning cache from configured theme id ${theme_id ? theme_id : config.themeId}...`);
//         let api = new Api(config.key, config.password, config.themeId);
//         let cleanCacheResult = theme_id ? await api.cleanCache(theme_id) : await api.cleanCache();
//         if(!cleanCacheResult.success){
//             log(chalk`{red [Fail]} Error from api: ${cleanCacheResult.message}.`);
//             log.done();
//             process.exit();
//         }
//         log(chalk`{green [Complete]} Cache from theme with id ${theme_id ? theme_id : config.themeId} cleaned.`);
//         log.done();
//     });
// /**
//  * Delete a theme from store
//  */
// program
//     .command('delete-theme')
//     .arguments('<theme_id>')
//     .description('Delete a theme from store', {
//         theme_id : 'Id of theme to remove'
//     })
//     .action(async (theme_id) => {
//         let answer = await inquirer.prompt(
//             {
//                 type    : 'confirm',
//                 message : 'Do you really want to delete this theme? This action cannot be undone.',
//                 name    : 'confirmDelete',
//                 default : false,
//             }
//         );
//         if(!answer.confirmDelete){
//             console.log(chalk`{red [Aborted]} Deletion of theme ${theme_id} was aborted by user.`);
//             process.exit();
//         }
//         let resultLoadFile = await utils.loadConfigFile();
//         if(!resultLoadFile.success){
//             console.log(chalk`{red [Fail]} ${resultLoadFile.message}.`);
//             process.exit();
//         }
//         log(chalk`{blue [Processing]} Deleting theme with id {magenta ${theme_id}} on store...`);
//         let config = resultLoadFile.config;
//         let api = new Api(config.key, config.password, config.themeId);
//         let deleteResult = await api.deleteTheme(theme_id);
//         if(!deleteResult.success){
//             log(chalk`{red [Fail]} Error from api: ${deleteResult.message}.`);
//             log.done();
//             process.exit();
//         }
//         log(chalk`{green [Complete]} Theme with id ${theme_id} deleted.`);
//         log.done();
//     });
// const fse = require('fs-extra');
// const path = require('path');
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
commander_1.program.version(package_json_1.default.version).name('tray');
commander_1.program.parse(process.argv);
