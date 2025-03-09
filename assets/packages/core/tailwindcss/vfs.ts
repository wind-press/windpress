import { decodeBase64 } from '@std/encoding/base64';

export function decodeVFSContainer(vfsContainer: string): VFSContainer {
    return JSON.parse(new TextDecoder().decode(decodeBase64(vfsContainer)));
}

export type VFSContainer = {
    [key: string]: string;
}