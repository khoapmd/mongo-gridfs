import { ObjectId } from 'bson';
import { Db, GridFSBucket, GridFSBucketReadStream } from 'mongodb';
import { Stream } from 'stream';
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
export declare class MongoGridFS {
    readonly connection: Db;
    readonly bucketName: string;
    /**
     * Constructor
     * @param {connection} connection
     * @param {string} bucketName
     */
    constructor(connection: Db, bucketName?: string);
    get bucket(): GridFSBucket;
    static getDownloadPath(object: IGridFSObject, options?: IDownloadOptions): string;
    /**
     * Returns a stream of a file from the GridFS.
     * @param {string} id
     * @return {Promise<GridFSBucketReadStream>}
     */
    readFileStream(id: string): Promise<GridFSBucketReadStream>;
    /**
     * Save the File from the GridFs to the filesystem and get the Path back
     * @param {string} id
     * @param {IDownloadOptions} options
     * @return {Promise<string>}
     */
    downloadFile(id: string, options?: IDownloadOptions): Promise<string>;
    /**
     * Find a single object by id
     * @param {string} id
     * @return {Promise<IGridFSObject>}
     */
    findById(id: string): Promise<IGridFSObject>;
    /**
     * Find a single object by condition
     * @param filter
     * @return {Promise<IGridFSObject>}
     */
    findOne(filter: any): Promise<IGridFSObject>;
    /**
     * Find a list of object by condition
     * @param filter
     * @return {Promise<IGridFSObject[]>}
     */
    find(filter: any): Promise<IGridFSObject[]>;
    /**
     * Write stream to GridFS
     * @param stream
     * @param options
     */
    writeFileStream(stream: Stream, options: IGridFSWriteOption): Promise<IGridFSObject>;
    /**
     * Upload a file directly from a fs Path
     * @param {string} uploadFilePath
     * @param {IGridFSWriteOption} options
     * @param {boolean} deleteFile
     * @return {Promise<IGridFSObject>}
     */
    uploadFile(uploadFilePath: string, options: IGridFSWriteOption, deleteFile?: boolean): Promise<IGridFSObject>;
    /**
     * Delete a File from the GridFS
     * @param {string} id
     * @return {Promise<boolean>}
     */
    delete(id: string): Promise<boolean>;
}
