"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = require("process");
var fsUtils_1 = require("./fsUtils");
var lodash_1 = __importDefault(require("lodash"));
var child_process_1 = require("child_process");
var bluebird_1 = __importDefault(require("bluebird"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var excludeArgs = ["ts-node", "index.ts"];
var excludeItems = [
    "node_modules",
    "android",
    "ios",
    ".git",
    ".DS_Store",
    ".buckconfig",
    ".editorconfig",
    ".eslintrc.js",
    ".gitattributes",
    "prettierrc.js",
    ".watchmanconfig",
    "sample_screens",
];
var validArgs = process_1.argv
    .filter(function (value) {
    return lodash_1.default.filter(excludeArgs, function (arg) { return value.includes(arg); }).length <= 0;
})
    .map(function (arg) { return arg.split("="); })
    .reduce(function (acc, keyVal) {
    var _a;
    var key = keyVal.shift();
    return __assign(__assign({}, acc), (_a = {}, _a[key] = lodash_1.default.isEmpty(keyVal)
        ? key
        : lodash_1.default.size(keyVal) > 1
            ? keyVal
            : lodash_1.default.first(keyVal), _a));
}, {});
var exec_tsc = function (sourceFile, outDir, target, noResolve) {
    if (outDir === void 0) { outDir = "./tmp"; }
    if (target === void 0) { target = "ES2017"; }
    if (noResolve === void 0) { noResolve = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var tscExecCode = "npx tsc " + sourceFile + " --target " + target + " --outDir " + outDir + " --noResolve " + noResolve;
                    console.log(tscExecCode);
                    child_process_1.exec(tscExecCode, function (error, stdout, stderr) {
                        console.log(error, stdout, stderr);
                        if (!error) {
                            resolve(stdout);
                        }
                        if (error) {
                            reject(error);
                        }
                    });
                })];
        });
    });
};
var flattenItems = function (itemInfos) {
    var items = [];
    for (var _i = 0, itemInfos_1 = itemInfos; _i < itemInfos_1.length; _i++) {
        var itemInfo = itemInfos_1[_i];
        var trimmedItemInfo = __assign({}, itemInfo);
        lodash_1.default.unset(trimmedItemInfo, "children");
        items = __spreadArray(__spreadArray([], items), [trimmedItemInfo]);
        if (itemInfo.children) {
            items = __spreadArray(__spreadArray([], items), flattenItems(itemInfo.children));
        }
    }
    return items;
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var source, output, _a, target, _b, noResolve, _c, copyNonTSFile, tmpDir, sourceTree, flattenedFiles, results;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                source = validArgs.source, output = validArgs.output, _a = validArgs.target, target = _a === void 0 ? "ES2017" : _a, _b = validArgs.noResolve, noResolve = _b === void 0 ? true : _b, _c = validArgs.copyNonTSFile, copyNonTSFile = _c === void 0 ? false : _c;
                tmpDir = "./tmp";
                sourceTree = fsUtils_1.parseItem(source, excludeItems);
                flattenedFiles = flattenItems([sourceTree]);
                return [4 /*yield*/, fs_extra_1.default.ensureDir(tmpDir)];
            case 1:
                _d.sent();
                return [4 /*yield*/, bluebird_1.default.mapSeries(flattenedFiles, function (fileInfo) { return __awaiter(void 0, void 0, void 0, function () {
                        var sourceFolder, trimmedFolder, destinationDir, isTSFile, destinationPath, error_1, extension, baseName, destinationPath, tmpConvertedFullPath, tmpFullPathExists, tmpHighLevelPath, tmpHighLevelPathExists;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (fileInfo.type !== fsUtils_1.ItemType.File) {
                                        return [2 /*return*/, {
                                                status: 'NOT_REQUIRED',
                                                path: fileInfo.path,
                                                type: fileInfo.type
                                            }];
                                    }
                                    return [4 /*yield*/, fs_extra_1.default.remove(tmpDir)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, fs_extra_1.default.ensureDir(tmpDir)];
                                case 2:
                                    _a.sent();
                                    sourceFolder = path_1.default.dirname(fileInfo.path);
                                    trimmedFolder = sourceFolder.replace(source, "");
                                    destinationDir = path_1.default.join(output, trimmedFolder);
                                    return [4 /*yield*/, fs_extra_1.default.ensureDir(destinationDir)];
                                case 3:
                                    _a.sent();
                                    isTSFile = lodash_1.default.includes([".ts", ".tsx"], fileInfo.extension);
                                    if (!(!isTSFile && copyNonTSFile)) return [3 /*break*/, 5];
                                    destinationPath = path_1.default.join(destinationDir, fileInfo.name);
                                    return [4 /*yield*/, fs_extra_1.default.copy(fileInfo.path, destinationPath)];
                                case 4:
                                    _a.sent();
                                    return [2 /*return*/, __assign(__assign({}, fileInfo), { status: 'SUCCESS' })];
                                case 5:
                                    _a.trys.push([5, 7, 8, 15]);
                                    return [4 /*yield*/, exec_tsc(fileInfo.path, tmpDir, target, noResolve)];
                                case 6:
                                    _a.sent();
                                    return [3 /*break*/, 15];
                                case 7:
                                    error_1 = _a.sent();
                                    console.log(error_1);
                                    return [3 /*break*/, 15];
                                case 8:
                                    extension = fileInfo.extension;
                                    baseName = path_1.default.basename(fileInfo.path, extension);
                                    destinationPath = path_1.default.join(destinationDir, "" + baseName + extension.replace(".ts", ".js"));
                                    tmpConvertedFullPath = path_1.default.join(tmpDir, trimmedFolder, fileInfo.name.replace(extension, ".js"));
                                    return [4 /*yield*/, fs_extra_1.default.pathExists(tmpConvertedFullPath)];
                                case 9:
                                    tmpFullPathExists = _a.sent();
                                    if (!tmpFullPathExists) return [3 /*break*/, 11];
                                    return [4 /*yield*/, fs_extra_1.default.copy(tmpConvertedFullPath, destinationPath)];
                                case 10:
                                    _a.sent();
                                    return [2 /*return*/, __assign(__assign({}, fileInfo), { status: 'SUCCESS' })];
                                case 11:
                                    tmpHighLevelPath = path_1.default.join(tmpDir, fileInfo.name.replace(extension, ".js"));
                                    return [4 /*yield*/, fs_extra_1.default.pathExists(tmpHighLevelPath)];
                                case 12:
                                    tmpHighLevelPathExists = _a.sent();
                                    if (!tmpHighLevelPathExists) return [3 /*break*/, 14];
                                    return [4 /*yield*/, fs_extra_1.default.copy(tmpHighLevelPath, destinationPath)];
                                case 13:
                                    _a.sent();
                                    return [2 /*return*/, __assign(__assign({}, fileInfo), { status: 'SUCCESS' })];
                                case 14: return [2 /*return*/, __assign(__assign({}, fileInfo), { status: 'FAILED', failedTmpPaths: [tmpConvertedFullPath, tmpHighLevelPath] })];
                                case 15: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                results = _d.sent();
                console.log("FAILED FILES:\n\n " + JSON.stringify(results.filter(function (result) { return lodash_1.default.isEqual(result.status, 'FAILED'); })));
                return [2 /*return*/];
        }
    });
}); };
main();
// console.log(tsFiles)
//console.log('items:', JSON.stringify(parseItem('./', ['node_modules'])))
//# sourceMappingURL=index.js.map