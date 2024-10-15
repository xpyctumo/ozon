import { isDevEnv } from "./utils";
const axios = require('axios').default;

/**
 * Fetches a list of subbreeds for the given breed
 * @param breed - Breed name
 * @returns A list of subbreeds, including the original breed name
 */
async function fetchBreedList(breed: string): Promise<string[]> {
    return axios.get(`https://dog.ceo/api/breed/${breed}/list`)
        .then((res: any) => {
            if (res.data && (res.data.message && res.data.status) && res.data.status === 'success') {
                return res.data.message.length > 0 ? [...res.data.message, breed] : [breed];
            }

            isDevEnv() ? console.error(`Failed to fetch breed list`) : null;
            return [];
        })
        .catch((error: Error) => {
            isDevEnv() ? console.error(error) : null;
            throw error;
        });
}

/**
 * Fetches a random image for the given breed / subbreed
 * @param path - breed / subbreed name, including the original breed name (e.g. 'spaniel/cocker')
 * @returns URL of a random image of the given breed / subbreed
 */
async function fetchBreedRandomImageUrl(path: string): Promise<string> {
    return axios.get(`https://dog.ceo/api/breed/${path}/images/random`)
        .then((res: any) => {
            if (res.data.message && res.data.message.length > 0) {
                return res.data.message;
            }

            isDevEnv() ? console.error(`Failed to fetch subBreed random image`) : null;
            return [];
        })
        .catch((error: Error) => {
            isDevEnv() ? console.error(error) : null;
            throw error;
        });
}

export {
    fetchBreedList,
    fetchBreedRandomImageUrl
};