import chalk from 'chalk';
import glob from 'glob';
import { readFileSync } from 'fs';
import { isBinaryFileSync } from 'isbinaryfile';
import { program } from 'commander';
import { TrayApi } from '../api/v1/TrayApi';
import { loadConfigFile, logMessage } from '../libs/utils';
import { dirname, extname } from 'path';

/**
 * Upload one or more files for theme
 */
export function upload() {
    program
        .command('upload')
        .option('-c, --core')
        .arguments('[files...]')
        .action(async (files: string[], options) => {
            let assets = files;

            if ( options.core && assets.length ) {
                logMessage(
                    'error',
                    `Either choose between ${chalk.magenta('upload -c|--core')} or ${chalk.magenta('upload [files...]')}`,
                    true
                );
                return false;           
            }

            // Uploads only "core" files
            if ( options.core ) {
                assets = [
                    'configs/settings.html', // Does not include settings.json to avoid ovewriting live test data
                    'css/**/*',
                    'elements/**/*',
                    'js/**/*',
                    'layouts/**/*',
                    'pages/**/*'
                ]
            }

            let globbedAssets = [];

            // If no argument is provided, globs the whole folder
            if (!assets.length) {
                globbedAssets = glob.sync('**/*');
            }
            else {
                for (const asset of assets) {
                    // If it looks like a folder...
                    if (!extname(asset)) {
                        // ... but could be a glob pattern...
                        if (asset.split('/').length > 1) {
                            // ... Executes glob.sync() and pushes the results to the assets list
                            globbedAssets.push(glob.sync(asset));
                        }
                        // If it is a folder...
                        else {
                            logMessage(
                                'error',
                                `${chalk.magenta(asset)} seems to be a folder name, and cannot be directly uploaded. Did you mean ${chalk.blue(`${asset}/*`)} ?`,
                                true
                            );
                        }
                    }
                    // If it's a file, pushes it to the assets list
                    else {
                        globbedAssets.push(asset);                    
                    }
                }                
            }
            
            // Flattens the array of files and globs
            let fullAssetsList = globbedAssets.flat();

            // Filters out remaining folder names found by glob patterns
            fullAssetsList = fullAssetsList.filter( (asset) => extname(asset) );

            logMessage('info', `Uploading ${fullAssetsList.length} files...`, true);

            const resultLoadFile: any = await loadConfigFile();

            if (!resultLoadFile.success) {
                logMessage('error', resultLoadFile.message, true);
                process.exit();
            }

            const { key, password, themeId } = resultLoadFile.config;
            const api = new TrayApi({ key, password, themeId });

            let successAssets = 0;
            let errorAssets = 0;

            for (const asset of fullAssetsList) {
                logMessage('pending', `Uploading file ${chalk.magenta(asset)}...`);

                const assetStartingWithSlash = asset.startsWith('/') ? asset : `/${asset}`;

                const fileContent = readFileSync(`.${assetStartingWithSlash}`);
                const isBinary = isBinaryFileSync(`.${assetStartingWithSlash}`);

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

            logMessage(
                'info',
                `Upload process finished. | Sent ${successAssets} files with success. | ${errorAssets} files could not be sent.`,
                true
            );
        });
}
