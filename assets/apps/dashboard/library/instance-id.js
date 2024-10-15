import { nanoid } from 'nanoid';

let instanceId;

/**
 * Get the instance id for the current application
 */
export function getInstanceId() {
    if (!instanceId) {
        instanceId = nanoid(10);
    }

    return instanceId;
}