import axios from 'redaxios';

export function useApi(config = {}) {
    return axios.create(Object.assign({
        baseURL: window.windpress.rest_api.url,
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'X-WP-Nonce': window.windpress.rest_api.nonce,
        },
    }, config));
}