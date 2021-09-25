import chalk from 'chalk';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { saveConfigFile, logMessage } from '../libs/utils';

/**
 * Create a new theme on store
 */
export function newTheme() {
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
                logMessage('error', 'Api key or password not correctly. Please verify and tray again.', true);
                process.exit();
            }

            if (theme_base) {
                logMessage(
                    'warning',
                    `The theme_base parameter has an API issue identified and may not be respected, creating a theme based on default theme.`,
                    true
                );
            }

            logMessage('pending', `Creating theme ${chalk.magenta(theme_name)} on store...`);

            const resultCreationTheme: any = theme_base
                ? await api.createTheme(theme_name, theme_base)
                : await api.createTheme(theme_name);

            if (!resultCreationTheme.success) {
                logMessage('error', resultCreationTheme.message, true);
                process.exit();
            }

            logMessage('success', `Theme ${theme_name} created on store.`, true);
            logMessage('pending', 'Creating config file...');

            const { themeId, previewUrl } = resultCreationTheme;
            const resultSaveFile = await saveConfigFile({ key, password, themeId, previewUrl });

            logMessage(!resultSaveFile.success ? 'error' : 'success', resultSaveFile.message, true);
        });
}
