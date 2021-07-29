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
exports.saveAssetFile = exports.getCurrentLocalteTime = exports.loadConfigFile = exports.saveConfigFile = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const js_yaml_1 = __importDefault(require("js-yaml"));
const path_1 = require("path");
function saveConfigFile({ key, password, themeId, previewUrl }) {
    const fileDataAsObject = {
        ':api_key': key,
        ':password': password,
        ':theme_id': themeId,
        ':preview_url': previewUrl,
    };
    const configFileData = js_yaml_1.default.dump(fileDataAsObject, {
        forceQuotes: true,
    });
    return promises_1.writeFile('config.yml', configFileData)
        .then(() => ({
        success: true,
        message: 'Configuration file created with success.',
    }))
        .catch((error) => ({
        success: false,
        message: `Unable to create config file. ${error}`,
    }));
}
exports.saveConfigFile = saveConfigFile;
function loadConfigFile() {
    return __awaiter(this, void 0, void 0, function* () {
        return promises_1.readFile('config.yml', { encoding: 'utf8' })
            .then((data) => {
            const config = js_yaml_1.default.load(data);
            const { ':api_key': key, ':password': password, ':theme_id': themeId, ':preview_url': previewUrl } = config;
            return {
                success: true,
                config: {
                    key,
                    password,
                    themeId,
                    previewUrl,
                },
            };
        })
            .catch((error) => ({
            success: false,
            message: `Unable to load config file. ${error}`,
        }));
    });
}
exports.loadConfigFile = loadConfigFile;
function getCurrentLocalteTime() {
    return new Date().toLocaleTimeString();
}
exports.getCurrentLocalteTime = getCurrentLocalteTime;
function saveAssetFile(path, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileDirname = path_1.dirname(path);
        if (!fs_1.existsSync(fileDirname)) {
            fs_1.mkdirSync(fileDirname, { recursive: true });
        }
        return promises_1.writeFile(path, data)
            .then(() => ({ success: true }))
            .catch((error) => ({
            success: false,
            message: `Unable to create '${path}' file. ${error}`,
        }));
    });
}
exports.saveAssetFile = saveAssetFile;
