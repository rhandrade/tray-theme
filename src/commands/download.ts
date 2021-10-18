import chalk from 'chalk';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage, saveAssetFile } from '../libs/utils';

/**
 * Download one or more files for theme
 */
export function download() {
    program
        .command('download')
        .arguments('[files...]')
        .action(async (files) => {
            let assets = files;

            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit();
            }

            const { key, password, themeId } = resultLoadFile.config;

            const api = new TrayApi({ key, password, themeId });

            if (!assets.length) {
                logMessage('info', 'Listing files that need to be downloaded...');

                const themeAssetsResults: any = await api.getThemeAssets();

                if (!themeAssetsResults.success) {
                    logMessage('error', `Error from api': ${themeAssetsResults.message}`, true);
                    process.exit();
                }

                assets = themeAssetsResults.assets.map(({ path }: any) => path);

                logMessage('info', `List retrived.`, true);
            }

            logMessage('info', `Downloading ${assets.length} files...`, true);

            for (const file of assets) {
                logMessage('pending', `Downloading file ${chalk.magenta(file)}...`);

                // eslint-disable-next-line no-await-in-loop
                const response: any = await api.getThemeAsset(file.startsWith('/') ? file : `/${file}`);

                if (!response.success) {
                    logMessage('error', response.message, true);
                } else {
                    const { path, content } = response.asset;

                    // eslint-disable-next-line no-await-in-loop
                    const saveFileResult: any = await saveAssetFile(path, content);

                    if (!saveFileResult.success) {
                        logMessage(
                            'error',
                            `Error when saving file ${chalk.magenta(file)}. Error: ${saveFileResult.message}.`,
                            true
                        );
                    } else {
                        logMessage('success', `File ${chalk.magenta(file)} downloaded.`, true);
                    }
                }
            }

            logMessage('info', `Done`, true);
        });
}
