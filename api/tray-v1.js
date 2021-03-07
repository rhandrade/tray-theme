'use strict';

const axios = require('axios');

class Api{

    /**
     * Class constructor
     * @param key
     * @param password
     * @param themeId
     */
    constructor(key, password, themeId){
        this.key      = key;
        this.password = password;
        this.themeId  = themeId;
        this.headers  = {
            'Authorization' : `Token token=${this.key}_${this.password}`
        }
    }

    /**
     * Check configurations files
     * @returns Object with previewUrl in success case, or error message otherwise.
     */
    checkConfiguration(){

        let config = {
            url    : `${Api.API_URL}/check`,
            method : 'post',
            headers: this.headers,
            params :{
                'theme_id'    : this.themeId,
                'gem_version' : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then((response) => {
                return {
                    success    : true,
                    previewUrl : response.data.preview
                }
            })
            .catch((error) => {
                return {
                    success : false,
                    message : error.response.data.message
                }
            });
    }

    /**
     * Get a list of all themes available at store
     * @returns Object with themes list in success case, or error message otherwise.
     */
    getThemes(){

        let config = {
            url    : `${Api.API_URL}/list`,
            method : 'get',
            headers: this.headers,
            params :{
                'gem_version' : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then((response) => {
                return {
                    success : true,
                    themes : response.data.themes
                }
            })
            .catch((error) => {
                return {
                    success : false,
                    message : error.response.data.message
                }
            });

    }


}

Api.GEM_VERSION      = '1.0.4';
Api.API_URL          = 'https://opencode.tray.com.br/api';

module.exports = Api;