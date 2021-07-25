#! /usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import log from 'log-update';
// import chokidar from 'chokidar';

import packageConfig from '../package.json';
import { TrayApi } from './api/v1/TrayApi';

import { saveConfigFile, loadConfigFile, getCurrentLocalteTime } from './libs/utils';

/**
 * Create configure file
 */
program
    .command('configure')
    .arguments('[key] [password] [theme_id]')
    .description('Create configuration file', {
        key: 'Api key',
        password: 'Api password',
        theme_id: 'Theme id',
    })
    .action(async (key, password, theme_id) => {
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
            const missingAnswers = await inquirer.prompt(questions);
            answers = { ...answers, ...missingAnswers };
        }

        const api = new TrayApi({
            key: answers.key,
            password: answers.password,
            themeId: answers.themeId,
        });

        const resultCheckConfig: any = await api.checkConfiguration();

        if (!resultCheckConfig.success) {
            console.log(chalk`{red [Fail]} Api key, password or theme id not correctly. Please verify and tray again.`);
            process.exit();
        }

        const resultSaveFile = await saveConfigFile({
            key: answers.key,
            password: answers.password,
            themeId: answers.themeId,
            previewUrl: resultCheckConfig.previewUrl,
        });

        if (!resultSaveFile.success) {
            console.log(chalk`{red [Fail]} ${resultSaveFile.message}.`);
            process.exit();
        }

        console.log(chalk`{green [Complete]} ${resultSaveFile.message}`);
    });

/**
 * List all themes available at store
 */
program
    .command('themes')
    .description('List all themes available at store')
    .action(async () => {
        const resultLoadFile: any = await loadConfigFile();

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
    });

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

program
    .command('delete-file')
    .alias('rm')
    .arguments('<files...>')
    .action(async (files: string[]) => {
        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {
            console.log(chalk`[${getCurrentLocalteTime()}] {red Fail} ${resultLoadFile.message}.`);
            process.exit();
        }

        const { key, password, themeId } = resultLoadFile.config;

        const api = new TrayApi({ key, password, themeId });

        files.forEach(async (file) => {
            log(chalk`[${getCurrentLocalteTime()}] {blue Processing} Deleting file '${file}'...`);

            const response: any = await api.deleteThemeAsset(file);

            if (!response.success) {
                log(
                    chalk`[${getCurrentLocalteTime()}] {red Fail} Error from api when deleting file '${file}': ${
                        response.message
                    }.`
                );
            } else {
                log(chalk`[${getCurrentLocalteTime()}] {green Complete} File '${file}' deleted.`);
            }

            log.done();
        });
    });

program.version(packageConfig.version).name('tray');

program.parse(process.argv);