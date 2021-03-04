#!/usr/bin/env node

const packageConfig = require('../package.json');
const { program }   = require('commander');
const fs            = require('fs');
const chalk         = require('chalk');
const chokidar      = require('chokidar');
const inquirer      = require('inquirer');
const axios         = require('axios');


program.version(packageConfig.version)
    .name(Object.keys(packageConfig.bin)[0]);

program.parse(process.argv);
