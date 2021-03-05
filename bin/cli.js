#!/usr/bin/env node

const { program }   = require('commander');
const fs            = require('fs');
const chalk         = require('chalk');
const chokidar      = require('chokidar');
const inquirer      = require('inquirer');
const axios         = require('axios');
const yaml          = require('js-yaml');

const packageConfig = require('../package.json');
const Api           = require('../api/tray-v1');


program
    .command('configure')
    .arguments('[key] [password] [theme_id]')
    .description('Create configuration file', {
        key      : 'Api key',
        password : 'Api password',
        theme_id : 'Theme id'
    })
    .action(async (key, password, theme_id) => {

        let questions = [];
        let answers = {
            key      : key,
            password : password,
            theme_id : theme_id,
        };

        if(!answers.key){
            questions.push(
                {
                    type    : 'input',
                    message : 'Enter api key',
                    name    : 'key'
                }
            );
        }

        if(!answers.password){
            questions.push(
                {
                    type    : 'input',
                    message : 'Enter api password',
                    name    : 'password'
                }
            );
        }

        if(!answers.theme_id){
            questions.push(
                {
                    type    : 'input',
                    message : 'Enter theme id',
                    name    : 'theme_id'
                }
            );
        }

        if(questions.length > 0){
            let missingAnswers = await inquirer.prompt(questions);
            answers = { ...answers, ...missingAnswers};
        }

        let api = new Api(answers.key, answers.password, answers.theme_id);
        let response = await api.checkConfiguration();

        if(!response.authentication){
            console.log(chalk`{red [Fail]} Api key, password or theme id not correctly. Please verify and tray again.`);
            process.exit();
        }

        let configFileData = yaml.dump({

            api_key     : answers.key,
            password    : answers.password,
            theme_id    : answers.theme_id,
            preview_url : response.preview

        }, { forceQuotes : true });

        fs.writeFileSync('config.yml', configFileData, 'utf8');


    });






program.version(packageConfig.version)
    .name(Object.keys(packageConfig.bin)[0]);

program.parse(process.argv);
