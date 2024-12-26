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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.MongoGridFS = void 0;
var bson_1 = require("bson");
var fs = require("fs");
var mongodb_1 = require("mongodb");
var osTmpdir = require("os-tmpdir");
var unique_filename_1 = require("unique-filename");
var MongoGridFS = /** @class */ (function () {
    /**
     * Constructor
     * @param {connection} connection
     * @param {string} bucketName
     */
    function MongoGridFS(connection, bucketName) {
        if (bucketName === void 0) { bucketName = 'fs'; }
        this.connection = connection;
        this.bucketName = bucketName;
    }
    Object.defineProperty(MongoGridFS.prototype, "bucket", {
        get: function () {
            return new mongodb_1.GridFSBucket(this.connection, { bucketName: this.bucketName });
        },
        enumerable: false,
        configurable: true
    });
    MongoGridFS.getDownloadPath = function (object, options) {
        if (options === void 0) { options = {
            filename: false,
        }; }
        var finalPath = '';
        if (!options.targetDir) {
            if (typeof options.filename === 'string') {
                finalPath = "".concat(osTmpdir(), "/").concat(options.filename);
            }
            else {
                if (options.filename === true) {
                    finalPath = "".concat(osTmpdir(), "/").concat(object._id);
                }
                else {
                    finalPath = (0, unique_filename_1.default)(osTmpdir());
                }
            }
        }
        else {
            if (typeof options.filename === 'string') {
                finalPath = "".concat(options.targetDir, "/").concat(options.filename);
            }
            else {
                if (options.filename === true) {
                    finalPath = object.filename;
                }
                else {
                    finalPath = (0, unique_filename_1.default)(options.targetDir);
                }
            }
        }
        return finalPath;
    };
    /**
     * Returns a stream of a file from the GridFS.
     * @param {string} id
     * @return {Promise<GridFSBucketReadStream>}
     */
    MongoGridFS.prototype.readFileStream = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var object;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findById(id)];
                    case 1:
                        object = _a.sent();
                        return [2 /*return*/, this.bucket.openDownloadStream(object._id)];
                }
            });
        });
    };
    /**
     * Save the File from the GridFs to the filesystem and get the Path back
     * @param {string} id
     * @param {IDownloadOptions} options
     * @return {Promise<string>}
     */
    MongoGridFS.prototype.downloadFile = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var object, downloadPath;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findById(id)];
                    case 1:
                        object = _a.sent();
                        downloadPath = MongoGridFS.getDownloadPath(object, options);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this.bucket.openDownloadStream(object._id)
                                    .once('error', function (error) {
                                    reject(error);
                                })
                                    .once('end', function () {
                                    resolve(downloadPath);
                                })
                                    .pipe(fs.createWriteStream(downloadPath));
                            })];
                }
            });
        });
    };
    /**
     * Find a single object by id
     * @param {string} id
     * @return {Promise<IGridFSObject>}
     */
    MongoGridFS.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.find({ _id: new bson_1.ObjectId(id) }).toArray()];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            throw new Error('No Object found');
                        }
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    /**
     * Find a single object by condition
     * @param filter
     * @return {Promise<IGridFSObject>}
     */
    MongoGridFS.prototype.findOne = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.find(filter).toArray()];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            throw new Error('No Object found');
                        }
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    /**
     * Find a list of object by condition
     * @param filter
     * @return {Promise<IGridFSObject[]>}
     */
    MongoGridFS.prototype.find = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.find(filter).toArray()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Write stream to GridFS
     * @param stream
     * @param options
     */
    MongoGridFS.prototype.writeFileStream = function (stream, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var uploadStream = _this.bucket.openUploadStream(options.filename, {
                aliases: options.aliases,
                chunkSizeBytes: options.chunkSizeBytes,
                contentType: options.contentType,
                metadata: options.metadata,
            });
            stream.pipe(uploadStream);
            uploadStream.on('error', function (err) {
                reject(err);
            });
            uploadStream.on('finish', function () {
                resolve({
                    _id: uploadStream.id,
                    length: uploadStream.length,
                    chunkSize: uploadStream.chunkSizeBytes,
                    filename: options.filename,
                    contentType: options.contentType,
                    aliases: options.aliases,
                    metadata: options.metadata,
                    uploadDate: new Date()
                });
            });
        });
    };
    /**
     * Upload a file directly from a fs Path
     * @param {string} uploadFilePath
     * @param {IGridFSWriteOption} options
     * @param {boolean} deleteFile
     * @return {Promise<IGridFSObject>}
     */
    MongoGridFS.prototype.uploadFile = function (uploadFilePath_1, options_1) {
        return __awaiter(this, arguments, void 0, function (uploadFilePath, options, deleteFile) {
            var tryDeleteFile;
            if (deleteFile === void 0) { deleteFile = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(uploadFilePath)) {
                            throw new Error('File not found');
                        }
                        tryDeleteFile = function (obj) {
                            if (fs.existsSync(uploadFilePath) && deleteFile === true) {
                                fs.unlinkSync(uploadFilePath);
                            }
                            return obj;
                        };
                        return [4 /*yield*/, this.writeFileStream(fs.createReadStream(uploadFilePath), options)
                                .then(tryDeleteFile)
                                .catch(function (err) {
                                tryDeleteFile();
                                throw err;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Delete a File from the GridFS
     * @param {string} id
     * @return {Promise<boolean>}
     */
    MongoGridFS.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.bucket.delete(new bson_1.ObjectId(id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        err_1 = _a.sent();
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MongoGridFS;
}());
exports.MongoGridFS = MongoGridFS;
//# sourceMappingURL=mongo-gridfs.class.js.map