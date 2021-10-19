import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage } from '../libs/utils';

/**
 * List all themes available at store
 */
export function themes() {
    program
        .command('themes')
        .description('List all themes available at store')
        .action(async () => {
            logMessage('pending', 'Getting all available themes...');

            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit(1);
            }

            const { key, password } = resultLoadFile.config;

            const api = new TrayApi({ key, password });
            const themesResult: any = await api.getThemes();

            if (!themesResult.success) {
                logMessage('error', themesResult.message, true);
                process.exit(1);
            }

            logMessage('success', 'Themes available:', true);
            console.table(themesResult.themes);
        });
}
