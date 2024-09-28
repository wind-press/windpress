<script setup>
import { build, optimize } from '@/packages/core/tailwindcss-v3';

(async () => {

    let mainCss = /*css*/ `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
    `;

    let contents = [
        {
            content: `
                <h1 class="text-3xl font-bold underline lg:bg-white md:w-32">
                    Hello world!
                </h1>
            `
        }
    ];

    let configStr = /*js*/ `
        import daisyui from 'https://esm.sh/daisyui?bundle-deps';

        export default {
            // safelist: ['bg-red-500','bg-red-600'],
            corePlugins: {
                preflight: false,
            },
            plugins: [
                require('@tailwindcss/typography'),
                daisyui,
            ],
        }
    `;

    const volume = {
        '/tailwind.config.js': configStr,
        '/main.css': mainCss,
    };

    let compiled = await build({
        entrypoint: {
            css: '/main.css',
            config: '/tailwind.config.js',
        },
        contents,
        volume,
    });

    let optimized = await optimize(compiled, true);

    console.log(compiled);

    console.log(optimized.css);


})();

</script>

<template>
    <div class="h:full px:8">
        <h2 class="font:20 font:bold fg:gray-80 fg:gray-10@dark">
            Coming Soon
        </h2>
        <p class="font:14 fg:gray-60 fg:gray-30@dark">
            We are dedicated to providing you with an exceptional customization experience.
            <br>
            Join our <a href="https://www.facebook.com/groups/1142662969627943" target="_blank" class="fg:blue-40@dark">Facebook Group</a> for updates and to share your feedback!
        </p>

        <!-- Ask for reviews -->
        <div class="notice windpress-notice notice-info my:10">
            <p>
                Your <span class="fg:yellow-50">★★★★★</span> 5-star review will encourage us to prioritize the release of this feature.
            </p>
            <p>
                <a href="https://wordpress.org/support/plugin/windpress/reviews/?filter=5/#new-post" target="_blank" class="button button-primary">
                    <font-awesome-icon :icon="['fas', 'star-shooting']" />
                    I will leave a review
                </a>
            </p>
        </div>
    </div>
</template>