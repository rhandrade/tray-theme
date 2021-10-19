import chalk from 'chalk';
import glob from 'glob';
import slash from 'slash';
import { program } from 'commander';
import { extname } from 'path';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage, validateFileIsAllowed, prepareToUpload } from '../libs/utils';

/**
 * Upload one or more files for theme
 */
export function upload() {
    program
        .command('upload')
        .description('Upload specified files to opencode servers.\nFolder paths are not supported and will be ignored.')
        .option('-c, --core', 'Upload all theme files, except for settings.json and images folder')
        .arguments('[files...]')
        .action(async (files: string[], options) => {
            let assets = files;

            if (options.core && assets.length) {
                logMessage(
                    'error',
                    `Upload command with core option could not be used together with files parameter.`,
                    true
                );
                process.exit(1);
            }

            if (options.core) {
                assets = [
                    'configs/settings.html',
                    'css/**/*',
                    'elements/**/*',
                    'js/**/*',
                    'layouts/**/*',
                    'pages/**/*',
                ];
            }

            let globbedAssets: any[] = [];

            if (!assets.length) {
                globbedAssets = glob.sync('**/*', { nodir: true });
            } else {
                assets.forEach((asset) => {
                    if (glob.hasMagic(asset) || extname(asset)) {
                        globbedAssets.push(glob.sync(asset, { nodir: true }));
                    }
                });
            }

            let fullAssetsList = globbedAssets.flat();
            fullAssetsList = fullAssetsList.filter((item) => item !== 'config.yml');

            if (!fullAssetsList.length) {
                logMessage('info', `${chalk.yellow('[Aborted]')} Nothing to uploading...`, true);
                process.exit();
            }

            logMessage('info', `${chalk.yellow('[Warn]')} Folder paths are not supported and will be ignored.`, true);
            logMessage('info', `Uploading ${fullAssetsList.length} files...`, true);

            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit(1);
            }

            const { key, password, themeId } = resultLoadFile.config;
            const api = new TrayApi({ key, password, themeId });

            let successAssets = 0;
            let errorAssets = 0;

            for (const path of fullAssetsList) {
                const asset = slash(path);

                const { isAllowed, message } = validateFileIsAllowed(asset);

                if (isAllowed) {
                    logMessage('pending', `Uploading file ${chalk.magenta(asset)}...`);

                    const { assetStartingWithSlash, fileContent, isBinary } = prepareToUpload(asset);

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
                } else if (message) {
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
