import chalk from 'chalk';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage } from '../libs/utils';

export function deleteFile() {
    program
        .command('delete-file')
        .alias('rm')
        .arguments('<files...>')
        .action(async (files: string[]) => {
            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit();
            }

            const { key, password, themeId } = resultLoadFile.config;

            const api = new TrayApi({ key, password, themeId });

            files.forEach(async (file) => {
                logMessage('pending', `Deleting file ${chalk.magenta(file)}...`);

                const response: any = await api.deleteThemeAsset(file);

                if (!response.success) {
                    logMessage(
                        'error',
                        `Error from api when deleting file ${chalk.magenta(file)}: ${response.message}.`,
                        true
                    );
                } else if (response.message) {
                    logMessage(
                        'success',
                        `File ${chalk.magenta(file)} deleted with message: ${response.message}`,
                        true
                    );
                } else {
                    logMessage('success', `File ${chalk.magenta(file)} deleted.`, true);
                }
            });
        });
}
