import axios, { AxiosRequestConfig } from 'axios';
import FileType from 'file-type';

interface ITrayApi {
    key: string;
    password: string;
    themeId?: number | null;
}

class TrayApi {
    readonly GEM_VERSION = '1.0.4';
    readonly API_URL = 'https://opencode.tray.com.br/api';

    key: string;
    password: string;
    themeId: number | null;
    headers: object;

    /**
     * Initiate new TrayApi class
     * @param param0
     */
    constructor({ key, password, themeId = null }: ITrayApi) {
        this.key = key;
        this.password = password;
        this.themeId = themeId;
        this.headers = {
            Authorization: `Token token=${this.key}_${this.password}`,
            Accept: 'application/json',
        };
    }

    /**
     * Check configurations files
     * @returns Object with previewUrl in success case, or error message otherwise.
     */
    checkConfiguration() {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/check`,
            method: 'post',
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };

        if (this.themeId) {
            config.params.theme_id = this.themeId;
        }

        return axios
            .request(config)
            .then((response) => ({
                success: true,
                previewUrl: this.themeId ? response.data.preview : null,
            }))
            .catch((error) => ({
                success: false,
                message: error.response.data.message,
            }));
    }

    /**
     * Get a list of all themes available at store
     * @returns Object with themes list in success case, or error message otherwise.
     */
    getThemes() {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/list`,
            method: 'get',
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };

        return axios
            .request(config)
            .then((response) => ({
                success: true,
                themes: response.data.themes,
            }))
            .catch((error) => ({
                success: false,
                message: error.response.data.message,
            }));
    }

    /**
     * Create a new theme on store.
     * @param name Name of the new theme
     * @param themeBase Name of the base theme
     * @returns Object with theme id and preview url for created theme or error message otherwise.
     */
    createTheme(name: string, themeBase: string = 'default') {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/themes`,
            method: 'post',
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
            data: {
                theme: {
                    name,
                    theme_base: themeBase,
                    gem_version: this.GEM_VERSION,
                },
            },
        };

        return axios
            .request(config)
            .then(({ data }) => ({
                success: true,
                themeId: data.theme_id,
                previewUrl: data.preview,
            }))
            .catch(({ response }) => ({
                success: false,
                message: response.data.message,
            }));
    }

    /**
     * Clean cache for a theme on store
     * @param themeId
     * @returns Object with success true in case of success or error message otherwise.
     */
    cleanCache(themeId = this.themeId) {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/clean_cache/`,
            method: 'post',
            headers: this.headers,
            params: {
                theme_id: themeId,
                gem_version: this.GEM_VERSION,
            },
        };

        return axios
            .request(config)
            .then((response) => {
                if (response.data.response.code !== 200) {
                    return {
                        success: false,
                        message: `Unknown error. Details: ${response.data.response.message}`,
                    };
                }

                return {
                    success: true,
                    message: response.data.response.message,
                };
            })
            .catch((error) => ({
                success: false,
                message: error.response.data.message,
            }));
    }

    /**
     * Delete a theme from store
     * @param themeId Id of theme to delete
     * @returns Object with success true in case of success or error message otherwise.
     */
    deleteTheme(themeId: number) {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/themes/${themeId}`,
            method: 'delete',
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };

        return axios
            .request(config)
            .then(() => ({ success: true }))
            .catch((error) => {
                if (error.response.data.message.includes("undefined method `id'")) {
                    return {
                        success: true,
                        message: 'False negative detected. Api returns error but theme was removed.',
                    };
                }

                return {
                    success: false,
                    message: error.response.data.message,
                };
            });
    }

    /**
     * Get theme assets
     * @returns Object with assets and its total, error message otherwise.
     */
    getThemeAssets() {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/themes/${this.themeId}/assets`,
            method: 'get',
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };

        return axios
            .request(config)
            .then((response) => ({
                success: true,
                quantity: response.data.meta.total,
                assets: response.data.assets,
            }))
            .catch((error) => ({
                success: false,
                message: error.response.data.message ?? error.response.data.error,
            }));
    }

    /**
     * Get theme asset content
     * @returns Object with asset properties and content or error message otherwise.
     */
    getThemeAsset(asset: string) {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/themes/${this.themeId}/assets`,
            method: 'get',
            headers: this.headers,
            params: {
                key: asset,
                gem_version: this.GEM_VERSION,
            },
        };

        return axios
            .request(config)
            .then(async (response) => {
                const assetContentBuffer = Buffer.from(response.data.content, 'base64');
                const fileType = await FileType.fromBuffer(assetContentBuffer);

                return {
                    success: true,
                    asset: {
                        key: response.data.key,
                        path: `.${response.data.key}`,
                        dynamic: Boolean(Number(response.data.dynamic)),
                        binary: !!fileType,
                        content: assetContentBuffer,
                    },
                };
            })
            .catch((error) => ({
                success: false,
                message: error.response.data.message ?? error.response.data.error,
            }));
    }

    async sendThemeAsset(asset: string, data: Buffer, isBinary: boolean = false): Promise<any> {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/themes/${this.themeId}/assets`,
            method: 'put',
            headers: this.headers,
            data: {
                gem_version: this.GEM_VERSION,
                key: asset,
            },
        };

        config.data[isBinary ? 'attachment' : 'value'] = data.toString('base64');

        return axios
            .request(config)
            .then(() => ({
                success: true,
            }))
            .catch((error) => ({
                success: false,
                message:
                    error.response.status < 500
                        ? error.response.data.message
                        : 'Api return status 500 - Internal server error',
            }));
    }

    deleteThemeAsset(asset: string) {
        const config: AxiosRequestConfig = {
            url: `${this.API_URL}/themes/${this.themeId}/assets`,
            method: 'delete',
            headers: this.headers,
            params: {
                key: `/${asset}`,
                gem_version: this.GEM_VERSION,
            },
            data: {
                key: `/${asset}`,
            },
        };

        return axios
            .request(config)
            .then(() => ({ success: true }))
            .catch((error) => {
                if (error.response.data.message.includes("undefined local variable or method `upfile_updated'")) {
                    return {
                        success: true,
                        message: 'False negative detected. Api returns error but file was removed.',
                    };
                }

                return {
                    success: false,
                    message: error.response.data.message,
                };
            });
    }
}

export { TrayApi };
