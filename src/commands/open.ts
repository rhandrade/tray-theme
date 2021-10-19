import launch from 'open';
import { program } from 'commander';
import { loadConfigFile, logMessage } from '../libs/utils';

export function open() {
    program.command('open').action(async () => {
        const resultLoadFile: any = await loadConfigFile();

        if (!resultLoadFile.success) {
            logMessage('error', resultLoadFile.message, true);
            process.exit(1);
        }

        const { previewUrl } = resultLoadFile.config;

        logMessage('pending', 'Opening theme preview page...');

        await launch(previewUrl, { wait: true });

        logMessage('success', 'Theme preview page opened in default browser.', true);
    });
}
