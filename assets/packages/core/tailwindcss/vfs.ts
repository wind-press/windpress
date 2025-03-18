import { decodeBase64 } from '@std/encoding/base64';

export type VFSContainer = {
    [key: string]: string;
}

export function decodeVFSContainer(vfsContainer: string): VFSContainer {
    return JSON.parse(new TextDecoder().decode(decodeBase64(vfsContainer)));
}