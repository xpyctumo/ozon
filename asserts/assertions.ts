import assert from "assert";
import { YandexDisk } from "../modules/yandexDisk";

/**
 * Asserts that a folder contains expected files
 * @param client - Yandex Disk client
 * @param dir - Directory to check
 * @param expectedFiles - List of expected file names
 * @throws Error if assertion fails
 */
async function assertFolder(client: YandexDisk, dir: string, expectedFiles: string[]) {
    try {
        console.log(`Checking '${dir}'`);
        const files = await client.readDir(dir) as string[];
        assert(files.length === expectedFiles.length, 'Files count does not match');
        assert(
            files.sort().every((value, index) => value === expectedFiles.sort()[index]),
            'Files do not match'
        );
    } catch (error) {
        throw error;
    }
}

export {
    assertFolder
};