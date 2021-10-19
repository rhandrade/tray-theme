import chalk from 'chalk';
import chokidar from 'chokidar';
import slash from 'slash';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage, validateFileIsAllowed, prepareToUpload } from '../libs/utils';

export function watch() {
    program.command('watch').action(async () => {
        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {
            logMessage('error', resultLoadFile.message, true);
            process.exit(1);
        }

        const { key, password, themeId } = resultLoadFile.config;

        const api = new TrayApi({ key, password, themeId });

        const watcher = chokidar.watch('./', {
            ignored: /(^|[/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true,
        });

        watcher
            .on('ready', () => {
                logMessage('info', 'Watching files...', true);
            })

            .on('add', async (path) => {
                const asset = slash(path);

                const { isAllowed, message } = validateFileIsAllowed(asset);

                if (isAllowed) {
                    const { assetStartingWithSlash, fileContent, isBinary } = prepareToUpload(asset);

                    logMessage('pending', `Uploading file ${chalk.magenta(asset)}...`);

                    const sendFileResult: any = await api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);

                    if (!sendFileResult.success) {
                        logMessage(
                            'error',
                            `Error when uploading file ${chalk.magenta(asset)}. Error: ${sendFileResult.message}`,
                            true
                        );
                    } else {
                        logMessage('success', `File ${chalk.magenta(asset)} uploaded`, true);
                    }
                } else if (message) {
                    logMessage('error', message, true);
                }
            })

            .on('change', async (path) => {
                const asset = slash(path);

                const { isAllowed, message } = validateFileIsAllowed(asset);

                if (isAllowed) {
                    const { assetStartingWithSlash, fileContent, isBinary } = prepareToUpload(asset);

                    logMessage('pending', `Uploading file ${chalk.magenta(asset)}...`);

                    const sendFileResult: any = await api.sendThemeAsset(assetStartingWithSlash, fileContent, isBinary);

                    if (!sendFileResult.success) {
                        logMessage(
                            'error',
                            `Error when uploading file ${chalk.magenta(asset)}. Error: ${sendFileResult.message}`,
                            true
                        );
                    } else {
                        logMessage('success', `File ${chalk.magenta(asset)} uploaded`, true);
                    }
                } else if (message) {
                    logMessage('error', message, true);
                }
            })

            .on('unlink', async (path) => {
                const asset = slash(path);

                logMessage('pending', `Deleting file ${chalk.magenta(asset)}...`);

                const response: any = await api.deleteThemeAsset(asset);

                if (!response.success) {
                    logMessage(
                        'error',
                        `Error when deleting file ${chalk.magenta(asset)}. Error: ${response.message}`,
                        true
                    );
                } else if (response.message) {
                    logMessage(
                        'success',
                        `File ${chalk.magenta(asset)} deleted with message: ${response.message}`,
                        true
                    );
                } else {
                    logMessage('success', `File ${chalk.magenta(asset)} deleted`, true);
                }
            })

            .on('addDir', () => {
                logMessage('warning', 'Creating empty directory is not supported by Tray API. Ignoring...', true);
            })

            .on('unlinkDir', () => {
                logMessage(
                    'warning',
                    'Deleting directory is not supported by Tray CLI API. Please delete using admin panel. Ignoring...',
                    true
                );
            })

            .on('error', (error) => {
                logMessage('error', `Watcher error: ${error}`, true);
            });
    });
}
