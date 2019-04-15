"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", { value: true });
var api = require("rest-api-client");
function getAuthResultFromReadable(readable) {
    return new Promise(function (resolve) {
        var s = "";
        readable
            .on("data", function (data) {
            s += data;
        }).on("end", function () {
            resolve(JSON.parse(s));
        });
    });
}
function getApiAccessForAuthResult(auth) {
    var apiAccess = {
        baseUrl: auth.instance_url,
        credentialPlacement: "header",
        credential: {
            value: {
                tokenType: auth.token_type,
                token: auth.access_token
            }
        }
    };
    return apiAccess;
}
function getLatestAPIVersionUrl(client) {
    return __awaiter(this, void 0, void 0, function () {
        var versions, latestVersion, url, _i, versions_1, version, ver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api("/services/data").get()];
                case 1:
                    versions = _a.sent();
                    latestVersion = undefined;
                    url = undefined;
                    for (_i = 0, versions_1 = versions; _i < versions_1.length; _i++) {
                        version = versions_1[_i];
                        ver = parseFloat(version.version);
                        if (!latestVersion || ver > latestVersion) {
                            latestVersion = ver;
                            url = version.url;
                        }
                    }
                    if (!latestVersion) {
                        throw "unable to determine the latest api version";
                    }
                    else {
                        return [2 /*return*/, url];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function run(readable, soql, writable) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, client, versionUrl, count, onRecord, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAuthResultFromReadable(readable)];
                case 1:
                    auth = _a.sent();
                    client = api.Client.init(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, getApiAccessForAuthResult(auth)];
                    }); }); });
                    return [4 /*yield*/, getLatestAPIVersionUrl(client)];
                case 2:
                    versionUrl = _a.sent();
                    count = 0;
                    onRecord = function (record) {
                        if (count > 0)
                            process.stdout.write(",");
                        writable.write(JSON.stringify(record));
                        count++;
                    };
                    writable.write("[");
                    return [4 /*yield*/, client.api(versionUrl + "/query").query({ q: soql }).get()];
                case 3:
                    result = _a.sent();
                    result.records.forEach(onRecord);
                    _a.label = 4;
                case 4:
                    if (!result.nextRecordsUrl) return [3 /*break*/, 6];
                    return [4 /*yield*/, client.api(result.nextRecordsUrl).get()];
                case 5:
                    result = (_a.sent());
                    result.records.forEach(onRecord);
                    return [3 /*break*/, 4];
                case 6:
                    writable.write("]");
                    return [2 /*return*/];
            }
        });
    });
}
var soql = process.argv[2];
if (!soql) {
    console.error("missing soql");
    process.exit(1);
}
run(process.stdin, soql, process.stdout)
    .then(function () {
    process.exit(0);
}).catch(function (err) {
    console.error(JSON.stringify(err));
    process.exit(1);
});
