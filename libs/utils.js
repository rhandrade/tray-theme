const fs   = require('fs').promises;
const yaml = require('js-yaml');

function saveConfigFile(key, password, themeId, previewUrl){

    let configFileData = yaml.dump({

        api_key     : key,
        password    : password,
        theme_id    : themeId,
        preview_url : previewUrl

    }, { forceQuotes : true });

    return fs.writeFile('config.yml', configFileData)
        .then(() => {
            return {
                success : true,
                message : 'Configuration file created with success.'
            }
        })
        .catch(error => {
            return {
                success : false,
                message : `Unable to create config file. ${error}`
            }
        });

}

function loadConfigFile(){

    return fs.readFile('config.yml', 'utf8')
        .then((data) => {

            let config = yaml.load(data);

            return {
                success : true,
                config  :{
                    key        : config.api_key,
                    password   : config.password,
                    themeId    : config.theme_id,
                    previewUrl : config.preview_url
                }
            }
        })
        .catch(error => {
            return {
                success : false,
                message : `Unable to load config file. ${error}`
            }
        });

}

module.exports = {
    saveConfigFile,
    loadConfigFile,
};