#! /usr/bin/env node

import { program } from 'commander';
import { readFile } from 'fs/promises';
import chalk from 'chalk';
import inquirer from 'inquirer';
import log from 'log-update';
import glob from 'glob';
import { isBinaryFileSync } from 'isbinaryfile';
// import chokidar from 'chokidar';

import { readFileSync } from 'fs';
import packageConfig from '../package.json';
import { TrayApi } from './api/v1/TrayApi';

import {
    saveConfigFile, loadConfigFile, getCurrentLocalteTime, saveAssetFile,
} from './libs/utils';

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

            log(
                chalk`[${getCurrentLocalteTime()}] {red [Fail]} Api key, password or theme id not correctly. Please verify and tray again.`,
            );
            process.exit();

        }

        const resultSaveFile = await saveConfigFile({
            key: answers.key,
            password: answers.password,
            themeId: answers.themeId,
            previewUrl: resultCheckConfig.previewUrl,
        });

        if (!resultSaveFile.success) {

            console.log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultSaveFile.message}.`);
            process.exit();

        }

        console.log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} ${resultSaveFile.message}`);

    });

/**
 * List all themes available at store
 */
program
    .command('themes')
    .description('List all themes available at store')
    .action(async () => {

        log(chalk`[${getCurrentLocalteTime()}] {blue [Processing]} Getting all available themes...`);

        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {

            log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
            log.done();
            process.exit();

        }

        const { key, password } = resultLoadFile.config;

        const api = new TrayApi({ key, password });
        const themesResult: any = await api.getThemes();

        if (!themesResult.success) {

            log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${themesResult.message}.`);
            log.done();
            process.exit();

        }

        log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} Themes available:`);
        console.table(themesResult.themes);

    });

/**
 * Create a new theme on store
 */
program
    .command('new')
    .arguments('<key> <password> <theme_name> [theme_base]')
    .description('Create a new theme in store', {
        key: 'Api key',
        password: 'Api password',
        theme_name: 'Name of the theme',
        theme_base: 'Base theme for this new theme - default: default',
    })
    .action(async (key, password, theme_name, theme_base) => {

        const api = new TrayApi({ key, password });
        const resultCheckConfig: any = await api.checkConfiguration();

        if (!resultCheckConfig.success) {

            console.log(
                chalk`[${getCurrentLocalteTime()}] {red [Fail]} Api key or password not correctly. Please verify and tray again.`,
            );
            process.exit();

        }

        log(chalk`[${getCurrentLocalteTime()}] {blue [Processing]} Creating theme {magenta ${theme_name}} on store...`);

        const resultCreationTheme: any = theme_base
            ? await api.createTheme(theme_name, theme_base)
            : await api.createTheme(theme_name);

        if (!resultCreationTheme.success) {

            log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultCreationTheme.message}.`);
            log.done();
            process.exit();

        }

        log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} Theme ${theme_name} created on store.`);
        log.done();

        log(chalk`[${getCurrentLocalteTime()}] {blue [Processing]} Creating config file...`);

        const { themeId, previewUrl } = resultCreationTheme;

        const resultSaveFile = await saveConfigFile({
            key,
            password,
            themeId,
            previewUrl,
        });

        if (!resultSaveFile.success) {

            log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultSaveFile.message}.`);
            log.done();
            process.exit();

        }

        log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} ${resultSaveFile.message}`);
        log.done();

    });

/**
 * Clean theme cache on store
 */
program
    .command('clean-cache [theme_id]')
    .description('Clean theme cache on store', {
        theme_id: 'Id of theme to clean cache - default: configured theme id',
    })
    .action(async (theme_id) => {

        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {

            console.log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
            process.exit();

        }

        const { key, password, themeId } = resultLoadFile.config;

        log(
            chalk`[${getCurrentLocalteTime()}] {blue [Processing]} Cleaning cache from configured theme id ${
                theme_id || themeId
            }...`,
        );

        const api = new TrayApi({ key, password, themeId });
        const cleanCacheResult = theme_id ? await api.cleanCache(theme_id) : await api.cleanCache();

        if (!cleanCacheResult.success) {

            log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} Error from api: ${cleanCacheResult.message}.`);
            log.done();
            process.exit();

        }

        log(
            chalk`[${getCurrentLocalteTime()}] {green [Complete]} Cache from theme with id ${
                theme_id || themeId
            } cleaned.`,
        );
        log.done();

    });

/**
 * Delete a theme from store
 */
program
    .command('delete-theme')
    .arguments('<theme_id>')
    .description('Delete a theme from store', {
        theme_id: 'Id of theme to remove',
    })
    .action(async (theme_id) => {

        const question = await inquirer.prompt({
            type: 'confirm',
            message: 'Do you really want to delete this theme? This action cannot be undone.',
            name: 'confirmDelete',
            default: false,
        });

        if (!question.confirmDelete) {

            console.log(
                chalk`[${getCurrentLocalteTime()}] {red [Aborted]} Deletion of theme ${theme_id} was aborted by user.`,
            );
            process.exit();

        }

        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {

            console.log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
            process.exit();

        }

        log(
            chalk`[${getCurrentLocalteTime()}] {blue [Processing]} Deleting theme with id {magenta ${theme_id}} on store...`,
        );

        const { key, password, themeId } = resultLoadFile.config;

        const api = new TrayApi({ key, password, themeId });
        const deleteResult: any = await api.deleteTheme(theme_id);

        if (!deleteResult.success) {

            log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} Error from api: ${deleteResult.message}.`);
            log.done();
            process.exit();

        }

        if (deleteResult.message) {

            log(
                chalk`[${getCurrentLocalteTime()}] {green [Complete]} Theme with id ${theme_id} deleted with message: ${
                    deleteResult.message
                }.`,
            );

        } else {

            log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} Theme with id ${theme_id} deleted.`);

        }

        log.done();

    });

program
    .command('download')
    .arguments('[files...]')
    .action(async (files) => {

        let assets = files;

        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {

            console.log(chalk`[${getCurrentLocalteTime()}] {red Fail} ${resultLoadFile.message}.`);
            process.exit();

        }

        const { key, password, themeId } = resultLoadFile.config;

        const api = new TrayApi({ key, password, themeId });

        if (!assets.length) {

            log(chalk`[${getCurrentLocalteTime()}] {blue Processing} Listing files that need to be downloaded...`);

            const themeAssetsResults: any = await api.getThemeAssets();

            if (!themeAssetsResults.success) {

                log(chalk`[${getCurrentLocalteTime()}] {red Fail} Error from api': ${themeAssetsResults.message}.`);
                process.exit();

            }
            assets = themeAssetsResults.assets.map(({ path }) => path);

            log(chalk`[${getCurrentLocalteTime()}] {green Complete} List retrived.`);
            log.done();

            log(chalk`[${getCurrentLocalteTime()}] Downloading ${themeAssetsResults.quantity} files...`);
            log.done();

        } else {

            log(chalk`[${getCurrentLocalteTime()}] Downloading ${assets.length} files...`);
            log.done();

        }

        assets.forEach(async (file: string) => {

            log(chalk`[${getCurrentLocalteTime()}] {blue Processing} Downloading file '${file}'...`);

            const response: any = await api.getThemeAsset(file.startsWith('/') ? file : `/${file}`);

            const { path, content } = response.asset;

            const saveFileResult: any = await saveAssetFile(path, content);

            if (!saveFileResult.success) {

                log(
                    chalk`[${getCurrentLocalteTime()}] {red Fail} Error when saving file '${file}'. Error: ${
                        saveFileResult.message
                    }.`,
                );

            }

            log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} File '${file}' downloaded.`);
            log.done();

        });

    });

program
    .command('upload')
    .arguments('[files...]')
    .action(async (files: string[]) => {

        let assets = files;

        if (!assets.length) {

            assets = glob.sync('**/*.*');
            assets = assets.filter((item) => item !== 'config.yml');

        }

        console.log(chalk`[${getCurrentLocalteTime()}] Uploading ${assets.length} files...`);

        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {

            console.log(chalk`[${getCurrentLocalteTime()}] {red [Fail]} ${resultLoadFile.message}.`);
            process.exit();

        }

        const { key, password, themeId } = resultLoadFile.config;
        const api = new TrayApi({ key, password, themeId });

        let successAssets = 0;
        let errorAssets = 0;

        for (const asset of assets) {

            log(chalk`[${getCurrentLocalteTime()}] {blue [Processing]} Uploading file '${asset}'... `);

            const assetStartingWithSlash = asset.startsWith('/') ? asset : `/${asset}`;

            const fileContent = readFileSync(`.${assetStartingWithSlash}`);
            const isBinary = isBinaryFileSync(`.${assetStartingWithSlash}`);

            // eslint-disable-next-line no-await-in-loop
            const sendFileResult: any = await api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);

            if (!sendFileResult.success) {

                errorAssets++;

                log(
                    chalk`[${getCurrentLocalteTime()}] {red [Fail]} Error when uploading file '${asset}'. Error: ${
                        sendFileResult.message
                    }.`,
                );
                log.done();

            } else {

                successAssets++;

                log(chalk`[${getCurrentLocalteTime()}] {green [Complete]} File '${asset}' uploaded.`);
                log.done();

            }

        }

        console.log(chalk`[${getCurrentLocalteTime()}] Upload process finished. | Sent ${successAssets} files with success. | ${errorAssets} files could not be sent.`);

    });

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
                    }.`,
                );

            } else {

                log(chalk`[${getCurrentLocalteTime()}] {green Complete} File '${file}' deleted.`);

            }

            log.done();

        });

    });

program.version(packageConfig.version).name('tray');

program.parse(process.argv);
