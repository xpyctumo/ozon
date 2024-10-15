import { assert } from "console";
import { prepareDir } from "./utils/utils";
import { YandexDisk } from './modules/yandexDisk';
import { fetchBreedList, fetchBreedRandomImageUrl } from "./utils/breeds";
import { assertFolder } from "./asserts/assertions";
require('dotenv').config();

const YANDEX_TOKEN: string = process.env.YANDEX_TOKEN || '';
let breedList: string[] = [];

async function upload(client: YandexDisk, dir: string, breed: string): Promise<string[]> {
    const requestedBreeds = new Set<string>();
    const uploadPromises: Promise<string | boolean>[] = [];

    console.log(`Fetching '${breed}'`);
    const list = await fetchBreedList(breed);
    console.log(`Fetching ${list.length} breeds`);

    for (const breedItem of list) {
        const path = breedItem === breed ? breed : `${breed}/${breedItem}`;
        const urlToBreed = await fetchBreedRandomImageUrl(path);
        uploadPromises.push(client.uploadPhoto(dir, urlToBreed, `${breedItem}.jpg`, true));
        requestedBreeds.add(path);
    }

    try {
        const results = await Promise.all(uploadPromises);
        breedList.push(...results.filter((v) => v !== false) as string[]);
        assert(requestedBreeds.size === breedList.length, 'Requested and downloaded files count does not match');
        return breedList;
    } catch (error) {
        throw error;
    }
}

async function main(breed: string) {
    // Data
    const yandexClient = new YandexDisk(YANDEX_TOKEN);
    const dir = 'test_folder';

    // Arrange
    await prepareDir(yandexClient, dir);

    // Act
    const uploadedFiles: string[] = await upload(yandexClient, dir, breed);

    // Assert
    await assertFolder(yandexClient, dir, uploadedFiles);
}

// Random breed selection
const breeds = ['doberman', 'bulldog', 'collie'];
// const randomBreed = 'spaniel';
const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];

main(randomBreed);
