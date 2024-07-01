import { config as masterCssVariables } from '@master/css';

const colors = Object.keys(masterCssVariables.variables).reduce((acc, key) => {
    if (masterCssVariables.variables[key]['60']) {
        acc[key] = Object.keys(masterCssVariables.variables[key]).reduce((c, value) => {
            if (value) {
                c[value * 10] = masterCssVariables.variables[key][value];
            }
            return c;
        }, {});
    }
    
    return acc;
}, {});

for (const key in colors) {
    colors[key].DEFAULT = colors[key][500];

    if (colors[key][NaN]) {
        delete colors[key][NaN];
    }
}

export {
    colors
};