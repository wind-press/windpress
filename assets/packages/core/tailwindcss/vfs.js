import { decodeBase64 } from '@std/encoding/base64';

export function decodeVFSContainer(vfsContainer) {
    return JSON.parse(new TextDecoder().decode(decodeBase64(vfsContainer)));
}