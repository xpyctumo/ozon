import { isDevEnv } from "../utils/utils";
const axios = require('axios').default;
const qs = require('querystring');

class YandexDisk {

    token: string;
    headers: any;
    
    /**
     * Creates a new instance of YaUploader
     * @param token - Yandex OAuth Token
     */
    constructor(token: string) {
        this.token = token;
        this.headers = {
            'Authorization': `OAuth ${this.token}`,
        };
    }

    /**
     * Creates a new folder in Yandex Disk
     * @param path - Path to a new folder
     */
    async createDir(path: string) {
        return axios.put(`https://cloud-api.yandex.net/v1/disk/resources?${qs.stringify({ path })}`, null, {headers: this.headers}).then(() => {
            isDevEnv() ? console.log(`Folder '${path}' created`) : null;
            return true;
        })
        .catch((error: Error) => {
            isDevEnv() ? console.error(error.message) : null;
            throw error;
        });
    }

    /**
     * Reads a directory
     * @param path - Path to a folder in Yandex Disk
     */
    async readDir(path: string): Promise<string[] | false> {
        return axios.get(`https://cloud-api.yandex.net/v1/disk/resources?${qs.stringify({ path })}`, {headers: this.headers})
            .then((response: any) => {
                const items = response.data._embedded?.items as string[] || [];
                isDevEnv() ? console.log(`Directory '${path}' contains: ${items.length} items`) : null;
                return items.map((item: any) => item.name);
            })
            .catch((data: any, error: Error) => {
                if (data.status === 404) {
                    return false;
                }
                isDevEnv() ? console.error(error.stack) : null;
                return error;
            });
    }

    /**
     * Deletes a directory
     * @param path - Path to a folder in Yandex Disk
     */
    async deleteDir(path: string, ...args: any): Promise<boolean> {
        return axios.delete(`https://cloud-api.yandex.net/v1/disk/resources?${qs.stringify({ path, ...args })}`, {headers: this.headers})
            .then(() => {
                isDevEnv() ? console.log(`Directory '${path}' deleted`) : null;
                return true;
            })
            .catch((data: any, error: Error) => {
                isDevEnv() ? console.error(data) : null;
                if (data.status === 404) {
                    return false;
                }
                throw error;
            });
    }

    /**
     * Checks if a directory exists
     * @param path - Path to a folder in Yandex Disk
     * @returns true if directory exists, false if not
     */
    async hasDir(path: string): Promise<boolean> {
        return this.readDir(path)
        .then((items: string[]|false) => {
            return items !== false;
        });
    }   

    /**
     * Uploads a photo to Yandex Disk
     * @param path - Path to a folder in Yandex Disk
     * @param urlFile - URL of a file to upload
     * @param name - Name for a file in Yandex Disk
     * @param waitUpload - Wait for the operation to finish (default: true)
     * @returns Promise with a name of a file if upload is successful, or false if it fails
     */
    async uploadPhoto(path: string, urlFile: string, name: string, waitUpload: boolean = true): Promise<string | boolean> {
        return axios.post(`https://cloud-api.yandex.net/v1/disk/resources/upload?${qs.stringify({ path: `${path}/${name}`, url: urlFile })}`, null, {
            headers: this.headers
        })
            .then(async (response: any) => {
                isDevEnv() ? console.log(`Photo '${name}' requested`) : null;
                if (response.status === 202 && response.data && response.data.href) {
                    if (waitUpload) {
                        const operationId = response.data.href.replace('https://cloud-api.yandex.net/v1/disk/operations/', '');
                        if (await this.awaitOperation(operationId, 250, 25) !== false) {
                            isDevEnv() ? console.log(`Photo '${name}' uploaded`) : null;
                            return name;
                        }
                        isDevEnv() ? console.log(`Photo '${name}' upload failed`) : null;
                        return false;
                    }
                    return name;
                }
                return false;
            })
            .catch((error: Error) => {
                isDevEnv() ? console.error(error.stack) : null;
                throw error;
            });    
    }

    /**
     * Gets an operation by its ID
     * @param operationId - operation ID
     * @returns Operation data if the operation exists, or false if it does not
     */
    async getOperation(operationId: string): Promise<any> {
        return axios.get(`https://cloud-api.yandex.net/v1/disk/operations/${operationId}`, {headers: this.headers})
            .then((response: any) => {
                if (response.status === 200 && response.data) {
                    return response.data;
                }
                return false;
            })
            .catch((error: Error) => {
                isDevEnv() ? console.error(error.stack) : null;
                throw error;
            });
    }

    /**
     * Waits for an operation to complete
     * @param operationId - operation ID
     * @param interval - interval to wait between retries (in ms)
     * @param retries - number of retries
     * @returns true if operation is complete, false if not
     */
    private async awaitOperation(operationId: string, interval: number = 300, retries: number = 5): Promise<boolean> {
        for (let i = 0; i < retries; i++) {
            const operation = await this.getOperation(operationId);
            if (operation.status && operation.status === 'success') {
                return true;
            }
    
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    
        return false;
    }
}

export {
    YandexDisk
};