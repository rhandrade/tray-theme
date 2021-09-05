import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage } from '../libs/utils';

/**
 * Clean theme cache on store
 */
export function cleanCache() {
    program
        .command('clean-cache [theme_id]')
        .description('Clean theme cache on store', {
            theme_id: 'Id of theme to clean cache - default: configured theme id',
        })
        .action(async (theme_id) => {
            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit();
            }

            const { key, password, themeId } = resultLoadFile.config;

            logMessage('pending', `Cleaning cache from configured theme id ${theme_id || themeId}...`);

            const api = new TrayApi({ key, password, themeId });
            const cleanCacheResult = theme_id ? await api.cleanCache(theme_id) : await api.cleanCache();

            if (!cleanCacheResult.success) {
                logMessage('error', `Error from api: ${cleanCacheResult.message}`, true);
                process.exit();
            }

            logMessage('success', `Cache from theme with id ${theme_id || themeId} cleaned.`, true);
        });
}
