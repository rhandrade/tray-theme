#! /usr/bin/env node

import { program } from 'commander';
import { configure } from './commands/configure';
import { themes } from './commands/themes';
import { newTheme } from './commands/newTheme';
import { cleanCache } from './commands/cleanCache';
import { deleteTheme } from './commands/deleteTheme';
import { download } from './commands/download';
import { upload } from './commands/upload';
import { deleteFile } from './commands/deleteFile';
import { watch } from './commands/watch';
import { open } from './commands/open';

const CLI_VERSION = '1.0.0-beta-1';

export function run() {
    configure();
    themes();
    newTheme();
    cleanCache();
    deleteTheme();
    download();
    upload();
    deleteFile();
    watch();
    open();

    program.version(CLI_VERSION).name('tray');
    program.parse(process.argv);
}
