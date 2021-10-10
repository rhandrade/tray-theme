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

const pkg = require('../package.json');

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

    program.version(pkg.version).name('tray');
    program.parse(process.argv);
}
