import inquirer from 'inquirer';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { saveConfigFile, logMessage } from '../libs/utils';

/**
 * Create configure file
 */
export function configure() {
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

            logMessage('pending', 'Verifying data...');

            const resultCheckConfig: any = await api.checkConfiguration();

            if (!resultCheckConfig.success) {
                logMessage('error', 'Api key, password or theme id not correctly. Please verify and tray again.', true);
                process.exit();
            }

            logMessage('success', 'Data verified with success.', true);
            logMessage('pending', 'Creating config.yml file...');

            const resultSaveFile = await saveConfigFile({
                key: answers.key,
                password: answers.password,
                themeId: answers.themeId,
                previewUrl: resultCheckConfig.previewUrl,
            });

            logMessage(!resultSaveFile.success ? 'error' : 'success', resultSaveFile.message, true);
        });
}
