export function isValidUrl(url) {
    try {
        const resource = new URL(url);

        return resource.protocol === 'http:' || resource.protocol === 'https:';
    } catch (e) {
        return false;
    }
}