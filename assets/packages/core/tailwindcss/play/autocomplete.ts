import Fuse from 'fuse.js';
import { getClassList } from '../intellisense';

import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';
import type { ClassEntity } from '../intellisense';

let classLists: ClassEntity[] = [];

export function getColor(declarations: any[] | undefined) {
    const color = declarations?.find((declaration) =>
        declaration.property.includes('color')
    )

    return color?.value || null;
}

export function searchClassList(design: DesignSystem, query: string) {
    if (classLists.length === 0) {
        classLists = getClassList(design);
    }
    
    // if the query is empty, return all classList
    if (query === '') {
        return classLists.map((classList) => {
            return {
                value: classList.selector,
                color: getColor(classList.declarations)
            }
        });
    }

    // split query by `:` and search for each subquery
    let segment = query.split(':');
    let prefix = segment.slice(0, -1).join(':');
    let q = segment.pop() || '';

    // if `!` exists as the first character on the query, cut it and mark as important
    let importantModifier = '';
    if (q.startsWith('!')) {
        q = q.slice(1);
        importantModifier = '!';
    }

    // check if opacity modifier is used, for example `bg-red-500/20`. the opacity modifier is a number between 0 and 100
    let opacityModifier: string | number | boolean = false;
    if (q.includes('/')) {
        let [_q, opacity] = q.split('/');
        // if the opacity modifier is not a number between 0 and 100, revert back the split
        if (opacity === '') {
            q = _q;
            opacityModifier = opacity;
        } else if (isNaN(Number(opacity)) || Number(opacity) < 0 || Number(opacity) > 100) {
            q = [_q, opacity].join('/');
        } else {
            q = _q;
            opacityModifier = parseInt(opacity.toString());
        }
    }

    let filteredClassList = classLists.filter((classList) => classList.selector.includes(q));

    // if opacityModifier is not false, populate the filteredClassList with the opacityModifier (1 to 100)
    if (opacityModifier !== false) {
        let tempFilteredClassList: ClassEntity[] = [];

        const loopIncrement = opacityModifier === '' ? 5 : 1;
        const loopStart = opacityModifier === '' || Number(opacityModifier) > 9 ? 0 : Math.floor((Number(opacityModifier) * 10 + 1) / 10) * 10;
        const loopEnd = opacityModifier === '' || Number(opacityModifier) > 9 ? 100 : Math.ceil((Number(opacityModifier) * 10 + 1) / 10) * 10;

        filteredClassList.forEach((classList) => {
            for (let i = loopStart; i <= loopEnd; i += loopIncrement) {
                tempFilteredClassList.push({
                    ...classList,
                    selector: classList.selector + '/' + i
                });
            }
        });

        filteredClassList = tempFilteredClassList;
    }

    const fuse = new Fuse(filteredClassList, {
        keys: ['selector'],
        threshold: 0.4,
    });

    return fuse.search(q).map(({ item }) => {
        return {
            value: [prefix, (importantModifier ? '!' : '') + item.selector].filter(Boolean).join(':'),
            color: getColor(item.declarations)
        }
    });
}