'use strict';

const axios    = require('axios');
const FileType = require('file-type');

class Api{

    /**
     * Class constructor
     * @param key
     * @param password
     * @param themeId
     */
    constructor(key, password, themeId = null){
        this.key      = key;
        this.password = password;
        this.themeId  = themeId;
        this.headers  = {
            'Authorization' : `Token token=${this.key}_${this.password}`,
            'Accept'        :  'application/json'
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
                'gem_version' : Api.GEM_VERSION
            }
        }

        if(this.themeId){
            config.params['theme_id'] = this.themeId;
        }

        return axios.request(config)
            .then((response) => {
                return {
                    success    : true,
                    previewUrl : this.themeId ? response.data.preview : null
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

    /**
     * Create a new theme on store.
     * @param name Name of the new theme
     * @param themeBase Name of the base theme
     * @returns Object with theme id and preview url for created theme or error message otherwise.
     */
    createTheme(name, themeBase = 'default'){

        let config = {
            url    : `${Api.API_URL}/themes`,
            method : 'post',
            headers: this.headers,
            params :{
                'gem_version' : Api.GEM_VERSION
            },
            data :{
                theme :{
                    name        : name,
                    theme_base  : themeBase,
                    gem_version : Api.GEM_VERSION
                }
            }
        }

        return axios.request(config)
            .then((response) => {
                return {
                    success    : true,
                    themeId    : response.data.theme_id,
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
     * Clean cache for a theme on store
     * @param themeId
     * @returns Object with success true in case of success or error message otherwise.
     */
    cleanCache(themeId = this.themeId){

        let config = {
            url    : `${Api.API_URL}/clean_cache/`,
            method : 'post',
            headers: this.headers,
            params :{
                theme_id    : themeId,
                gem_version : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then((response) => {
                if(response.data.response.code !== 200){
                    return {
                        success : false,
                        message : `Unknown error. Details: ${response.data.response.message}`
                    }
                } else {
                    return {
                        success : true,
                        message : response.data.response.message
                    }
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
     * Delete a theme from store
     * @param themeId Id of theme to delete
     * @returns Object with success true in case of success or error message otherwise.
     */
    deleteTheme(themeId){

        let config = {
            url    : `${Api.API_URL}/themes/${themeId}`,
            method : 'delete',
            headers: this.headers,
            params :{
                'gem_version' : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then((response) => {
                return {
                    success : true
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
     * Get theme assets
     * @returns Object with assets and its total, error message otherwise.
     */
    getThemeAssets(){

        let config = {
            url    : `${Api.API_URL}/themes/${this.themeId}/assets`,
            method : 'get',
            headers: this.headers,
            params :{
                'gem_version' : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then((response) => {
                return {
                    success  : true,
                    quantity : response.data.meta.total,
                    assets   : response.data.assets,
                }
            })
            .catch((error) => {
                return {
                    success : false,
                    message : error.response.data.message ?? error.response.data.error
                }
            });

    }

    /**
     * Get theme asset content
     * @returns Object with asset properties and content or error message otherwise.
     */
    getThemeAsset(asset){

        let config = {
            url    : `${Api.API_URL}/themes/${this.themeId}/assets`,
            method : 'get',
            headers: this.headers,
            params :{
                'key'         : asset,
                'gem_version' : Api.GEM_VERSION
            }
        }

        return axios.request(config)
            .then(async (response) => {

                let assetContentBuffer = Buffer.from(response.data.content, 'base64');
                let fileType = await FileType.fromBuffer(assetContentBuffer);

                return {
                    success : true,
                    asset :{
                        key     : response.data.key,
                        path    : `.${response.data.key}`,
                        dynamic : Boolean(Number(response.data.dynamic)),
                        binary  : !!fileType,
                        content : assetContentBuffer
                    }
                }

            })
            .catch((error) => {
                return {
                    success : false,
                    message : error.response.data.message ?? error.response.data.error
                }
            });

    }


}

Api.GEM_VERSION      = '1.0.4';
Api.API_URL          = 'https://opencode.tray.com.br/api';

module.exports = Api;