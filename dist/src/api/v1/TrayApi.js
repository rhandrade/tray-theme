"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrayApi = void 0;
const axios_1 = __importDefault(require("axios"));
const file_type_1 = __importDefault(require("file-type"));
class TrayApi {
    /**
     * Initiate new TrayApi class
     * @param param0
     */
    constructor({ key, password, themeId = null }) {
        this.GEM_VERSION = "1.0.4";
        this.API_URL = "https://opencode.tray.com.br/api";
        this.key = key;
        this.password = password;
        this.themeId = themeId;
        this.headers = {
            Authorization: `Token token=${this.key}_${this.password}`,
            Accept: "application/json",
        };
    }
    /**
     * Check configurations files
     * @returns Object with previewUrl in success case, or error message otherwise.
     */
    checkConfiguration() {
        const config = {
            url: `${this.API_URL}/check`,
            method: "post",
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };
        if (this.themeId) {
            config.params.theme_id = this.themeId;
        }
        return axios_1.default
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
        const config = {
            url: `${this.API_URL}/list`,
            method: "get",
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };
        return axios_1.default
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
    createTheme(name, themeBase = "default") {
        const config = {
            url: `${this.API_URL}/themes`,
            method: "post",
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
        return axios_1.default
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
        const config = {
            url: `${this.API_URL}/clean_cache/`,
            method: "post",
            headers: this.headers,
            params: {
                theme_id: themeId,
                gem_version: this.GEM_VERSION,
            },
        };
        return axios_1.default
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
    deleteTheme(themeId) {
        const config = {
            url: `${this.API_URL}/themes/${themeId}`,
            method: "delete",
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };
        return axios_1.default
            .request(config)
            .then(() => ({ success: true }))
            .catch((error) => ({
            success: false,
            message: error.response.data.message,
        }));
    }
    /**
     * Get theme assets
     * @returns Object with assets and its total, error message otherwise.
     */
    getThemeAssets() {
        const config = {
            url: `${this.API_URL}/themes/${this.themeId}/assets`,
            method: "get",
            headers: this.headers,
            params: {
                gem_version: this.GEM_VERSION,
            },
        };
        return axios_1.default
            .request(config)
            .then((response) => ({
            success: true,
            quantity: response.data.meta.total,
            assets: response.data.assets,
        }))
            .catch((error) => {
            var _a;
            return ({
                success: false,
                message: (_a = error.response.data.message) !== null && _a !== void 0 ? _a : error.response.data.error,
            });
        });
    }
    /**
     * Get theme asset content
     * @returns Object with asset properties and content or error message otherwise.
     */
    getThemeAsset(asset) {
        const config = {
            url: `${this.API_URL}/themes/${this.themeId}/assets`,
            method: "get",
            headers: this.headers,
            params: {
                key: asset,
                gem_version: this.GEM_VERSION,
            },
        };
        return axios_1.default
            .request(config)
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            const assetContentBuffer = Buffer.from(response.data.content, "base64");
            const fileType = yield file_type_1.default.fromBuffer(assetContentBuffer);
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
        }))
            .catch((error) => {
            var _a;
            return ({
                success: false,
                message: (_a = error.response.data.message) !== null && _a !== void 0 ? _a : error.response.data.error,
            });
        });
    }
}
exports.TrayApi = TrayApi;
