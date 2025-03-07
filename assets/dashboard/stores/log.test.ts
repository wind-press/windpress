import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLogStore } from './log';
import type { Log } from './log';

describe('useLogStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    const singleLog: Log = {
        message: 'Test log',
        type: 'info',
        group: 'testGroup',
    };

    const multipleLogs: Log[] = [
        {
            message: 'Test log 1',
            type: 'info',
            group: 'testGroup',
        },
        {
            message: 'Test log 2',
            type: 'info',
            group: 'testGroup',
        },
    ];

    it('should add a log entry', () => {
        const store = useLogStore();
        const id = store.add(singleLog);

        expect(store.logs.length).toBe(1);
        expect(store.logs[0].message).toBe(singleLog.message);
        expect(store.logs[0].type).toBe(singleLog.type);
        expect(store.logs[0].group).toBe(singleLog.group);
        expect(store.logs[0].id).toBe(id);
        expect(store.logs[0].timestamp).toBeDefined();
    });

    it('should remove a log entry by id', () => {
        const store = useLogStore();
        const id = store.add(singleLog);

        store.remove(id, 'id');
        expect(store.logs.length).toBe(0);
    });

    it('should remove log entries by message', () => {
        const store = useLogStore();
        store.add(multipleLogs[0]);
        store.add(multipleLogs[1]);

        store.remove('Test log 1', 'message');
        expect(store.logs.length).toBe(1);
        expect(store.logs[0].message).toBe('Test log 2');
    });

    it('should remove log entries by type', () => {
        const store = useLogStore();
        store.add(multipleLogs[0]);
        store.add({ message: 'Test log 2', type: 'error', group: 'testGroup' });

        store.remove('info', 'type');
        expect(store.logs.length).toBe(1);
        expect(store.logs[0].type).toBe('error');
    });

    it('should remove log entries by group', () => {
        const store = useLogStore();
        store.add({ message: 'Test log 1', type: 'info', group: 'testGroup1' });
        store.add(multipleLogs[1]);

        store.remove('testGroup1', 'group');
        expect(store.logs.length).toBe(1);
        expect(store.logs[0].group).toBe('testGroup');
    });

    it('should clear all log entries', () => {
        const store = useLogStore();
        store.add(multipleLogs[0]);
        store.add(multipleLogs[1]);

        store.clear();
        expect(store.logs.length).toBe(0);
    });
});