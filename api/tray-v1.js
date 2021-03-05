'use strict';

const axios = require('axios');

class Api{

    constructor(key, password, themeId){
        this.key      = key;
        this.password = password;
        this.themeId  = themeId;
        this.headers  = {
            'Authorization' : `Token token=${this.key}_${this.password}`
        }
    }

    checkConfiguration(){

        let config = {
            url    : `${Api.API_URL}${Api.CHECK_URI}`,
            method : 'post',
            headers: this.headers,
            params :{
                'theme_id'    : this.themeId,
                'gem_version' : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then((response) => response.data)
            .catch((error) => error.response.data);
    }


}

Api.GEM_VERSION      = '1.0.4';
Api.API_URL          = 'https://opencode.tray.com.br/api/';
Api.CLEAN_CACHE_URI  = 'clean_cache';
Api.CHECK_URI        = 'check'
Api.LIST_URI         = 'list';
Api.THEME_URI        = 'themes'
Api.THEME_ASSETS_URI = 'themes/{theme-id}/assets'


module.exports = Api;