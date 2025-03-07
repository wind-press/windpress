import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useBusyStore } from './busy';
import { useLogStore } from './log';

describe('useBusyStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should add a task', () => {
        const store = useBusyStore();
        store.add('doing.Something');

        expect(store.tasks.length).toBe(1);
        expect(store.tasks[0].task).toBe('doing.Something');
        expect(store.tasks[0].timestamp).toBeDefined();
    });

    it('should add a task with a message', () => {
        const store = useBusyStore();
        const log = useLogStore();

        store.add('doing.Something', {
            group: 'testGroup',
            message: 'test log',
            type: 'info',
        });

        expect(store.tasks.length).toBe(1);
        expect(store.tasks[0].task).toBe('doing.Something');
        expect(store.tasks[0].timestamp).toBeDefined();

        expect(log.logs.length).toBe(1);
        expect(log.logs[0].message).toBe('test log');
        expect(log.logs[0].type).toBe('info');
        expect(log.logs[0].group).toBe('testGroup');
        expect(log.logs[0].timestamp).toBeDefined();
    });

    it('should remove a task', () => {
        const store = useBusyStore();
        store.add('doing.Something');

        store.remove('doing.Something');
        expect(store.tasks.length).toBe(0);
    });
});