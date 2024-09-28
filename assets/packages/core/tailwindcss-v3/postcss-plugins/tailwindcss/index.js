import processTailwindFeatures from 'https://esm.sh/tailwindcss@3/src/processTailwindFeatures';

export default Object.assign(
    function (config, contents) {
        console.log('config and contents', config, contents);

        return {
            postcssPlugin: 'tailwindcss',
            async Once(root, { result }) {
                await processTailwindFeatures(({ createContext }) => {
                    return () => createContext(config, contents)
                })(root, result);
            },
        };
    },
    { postcss: true }
)