import chalk from 'chalk';
import glob from 'glob';
import slash from 'slash';
import { readFileSync } from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage, checkFileUploadPermission, prepareToUpload } from '../libs/utils';

/**
 * Upload one or more files for theme
 */
export function upload() {
    program
        .command('upload')
        .arguments('[files...]')
        .action(async (files: string[]) => {
            let assets = files;

            if (!assets.length) {
                assets = glob.sync('**/*.*');
                assets = assets.filter((item) => item !== 'config.yml');
            }

            logMessage('info', `Uploading ${assets.length} files...`, true);

            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit();
            }

            const { key, password, themeId } = resultLoadFile.config;
            const api = new TrayApi({ key, password, themeId });

            let successAssets = 0;
            let errorAssets = 0;

            for (const path of assets) {
                const asset = slash(path);

                const {
                    isAllowed,
                    message
                } = checkFileUploadPermission(asset);

                if ( isAllowed ) {
                    logMessage('pending', `Uploading file ${chalk.magenta(asset)}...`);

                    const {
                        assetStartingWithSlash,
                        fileContent,
                        isBinary
                    } = prepareToUpload(asset);
                    
                    // eslint-disable-next-line no-await-in-loop
                    const sendFileResult: any = await api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);
                    
                    if (!sendFileResult.success) {
                        errorAssets++;
                        logMessage(
                            'error',
                            `Error when uploading file ${chalk.magenta(asset)}. Error: ${sendFileResult.message}`,
                            true
                        );
                    } else {
                        successAssets++;
                        logMessage('success', `File ${chalk.magenta(asset)} uploaded.`, true);
                    }
                }
                else if (message) {
                    errorAssets++;
                    logMessage('error', message, true);
                }
            }

            logMessage(
                'info',
                `Upload process finished. | Sent ${successAssets} files with success. | ${errorAssets} files could not be sent.`,
                true
            );
        });
}
