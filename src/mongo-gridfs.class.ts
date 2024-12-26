import {ObjectId} from 'bson';
import * as fs from 'fs';
import {Db, GridFSBucket, GridFSBucketReadStream} from 'mongodb';
import osTmpdir = require('os-tmpdir');
import {Stream} from 'stream';
import uniqueFilename from 'unique-filename';



export interface IGridFSObject {
    _id: ObjectId;
    length: number;
    chunkSize: number;    
    filename: string;
    contentType?: string;
    aliases?: string[];
    metadata?: object;
    uploadDate: Date;    
}

export interface IGridFSWriteOption {
    filename: string;
    chunkSizeBytes?: number;
    metadata?: any;
    contentType?: string;
    aliases?: string[];
}

export interface IDownloadOptions {
    filename: boolean | string;
    targetDir?: string;
}

export class MongoGridFS {

    /**
     * Constructor
     * @param {connection} connection
     * @param {string} bucketName
     */
    constructor(public readonly connection: Db, public readonly bucketName: string = 'fs') {
    }

    public get bucket(): GridFSBucket {
        return new GridFSBucket(this.connection, {bucketName: this.bucketName});
    }

    public static getDownloadPath(object: IGridFSObject, options: IDownloadOptions = {
        filename: false,
    }) {
        let finalPath = '';
        if (!options.targetDir) {
            if (typeof options.filename === 'string') {
                finalPath = `${osTmpdir()}/${options.filename}`;
            } else {
                if (options.filename === true) {
                    finalPath = `${osTmpdir()}/${object._id}`;
                } else {
                    finalPath = uniqueFilename(osTmpdir());
                }
            }
        } else {
            if (typeof options.filename === 'string') {
                finalPath = `${options.targetDir}/${options.filename}`;
            } else {
                if (options.filename === true) {
                    finalPath = object.filename;
                } else {
                    finalPath = uniqueFilename(options.targetDir);
                }
            }
        }
        return finalPath;
    }

    /**
     * Returns a stream of a file from the GridFS.
     * @param {string} id
     * @return {Promise<GridFSBucketReadStream>}
     */
    public async readFileStream(id: string): Promise<GridFSBucketReadStream> {
        const object = await this.findById(id);
        return this.bucket.openDownloadStream(object._id);
    }

    /**
     * Save the File from the GridFs to the filesystem and get the Path back
     * @param {string} id
     * @param {IDownloadOptions} options
     * @return {Promise<string>}
     */
    public async downloadFile(id: string, options?: IDownloadOptions): Promise<string> {
        const object = await this.findById(id);
        const downloadPath = MongoGridFS.getDownloadPath(object, options);
        return new Promise<string>((resolve, reject) => {
            this.bucket.openDownloadStream(object._id)
                .once('error', (error) => {
                    reject(error);
                })
                .once('end', () => {
                    resolve(downloadPath);
                })
                .pipe(fs.createWriteStream(downloadPath));
        });
    }

    /**
     * Find a single object by id
     * @param {string} id
     * @return {Promise<IGridFSObject>}
     */
    public async findById(id: string): Promise<IGridFSObject> {
        const result = await this.bucket.find({ _id: new ObjectId(id) }).toArray();
        if (result.length === 0) {
            throw new Error('No Object found');
        }
        return result[0];
    }

    /**
     * Find a single object by condition
     * @param filter
     * @return {Promise<IGridFSObject>}
     */
    public async findOne(filter: any): Promise<IGridFSObject> {
        const result = await this.bucket.find(filter).toArray();
        if (result.length === 0) {
            throw new Error('No Object found');
        }
        return result[0];
    }

    /**
     * Find a list of object by condition
     * @param filter
     * @return {Promise<IGridFSObject[]>}
     */
    public async find(filter: any): Promise<IGridFSObject[]> {
        return await this.bucket.find(filter).toArray();
    }

    /**
     * Write stream to GridFS
     * @param stream
     * @param options
     */
    public writeFileStream(stream: Stream, options: IGridFSWriteOption): Promise<IGridFSObject> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.bucket.openUploadStream(options.filename, {
                aliases: options.aliases,
                chunkSizeBytes: options.chunkSizeBytes,
                contentType: options.contentType,
                metadata: options.metadata,
            });

            stream.pipe(uploadStream);

            uploadStream.on('error', (err) => {
                reject(err);
            });

            uploadStream.on('finish', () => {
                resolve({
                    _id: uploadStream.id as ObjectId,
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
    }

    /**
     * Upload a file directly from a fs Path
     * @param {string} uploadFilePath
     * @param {IGridFSWriteOption} options
     * @param {boolean} deleteFile
     * @return {Promise<IGridFSObject>}
     */
    public async uploadFile(
        uploadFilePath: string,
        options: IGridFSWriteOption,
        deleteFile: boolean = true): Promise<IGridFSObject> {
        if (!fs.existsSync(uploadFilePath)) {
            throw new Error('File not found');
        }
        const tryDeleteFile = (obj?: any): any => {
            if (fs.existsSync(uploadFilePath) && deleteFile === true) {
                fs.unlinkSync(uploadFilePath);
            }
            return obj;
        };
        return await this.writeFileStream(fs.createReadStream(uploadFilePath), options)
            .then(tryDeleteFile)
            .catch((err) => {
                tryDeleteFile();
                throw err;
            });
    }

    /**
     * Delete a File from the GridFS
     * @param {string} id
     * @return {Promise<boolean>}
     */
    public async delete(id: string): Promise<boolean> {
        try {
            await this.bucket.delete(new ObjectId(id));
            return true;
        } catch (err) {
            throw err;
        }
    }
}
