import inquirer from 'inquirer';
import chalk from 'chalk';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage } from '../libs/utils';

/**
 * Delete a theme from store
 */
export function deleteTheme() {
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
                logMessage(
                    'info',
                    `${chalk.red('[Abordted]')} Deletion of theme ${theme_id} was aborted by user.`,
                    true
                );
                process.exit();
            }

            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit(1);
            }

            logMessage('pending', `Deleting theme with id ${chalk.magenta(theme_id)} on store...`);

            const { key, password, themeId } = resultLoadFile.config;

            const api = new TrayApi({ key, password, themeId });
            const deleteResult: any = await api.deleteTheme(theme_id);

            if (!deleteResult.success) {
                logMessage('error', `Error from api: ${deleteResult.message}`, true);
                process.exit(1);
            }

            if (deleteResult.message) {
                logMessage('success', `Theme with id ${theme_id} deleted with message: ${deleteResult.message}`, true);
            } else {
                logMessage('success', `Theme with id ${theme_id} deleted.`, true);
            }
        });
}
