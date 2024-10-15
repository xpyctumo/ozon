import { YandexDisk } from "../modules/yandexDisk";


const isDevEnv = () => {
    return process.env.NODE_ENV === 'development';
}

/**
 * Deletes a directory if it exists, then creates it
 * @param client - Yandex Disk client
 * @param dir - Path to a folder in Yandex Disk
 */
async function prepareDir(client: YandexDisk, dir: string) {
    const dirExists = await client.hasDir(dir);
    if (dirExists) {
        await client.deleteDir(dir, {permanently: true});
    }
    await client.createDir(dir);
}

export {
    isDevEnv,
    prepareDir
};

