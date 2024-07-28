<script setup>
const props = defineProps({
    variableItems: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="{m:10;pb:15}>div bb:1|solid|$(primary-3)>div:not(:last-child)">
        <div v-for="(color, key) in variableItems" :key="key" class="">
            <div class="variable-section-title font:14 my:10">
                {{ key }}
            </div>

            <template v-if="color.DEFAULT">
                <div class="variable-section-items">
                    <button @click="(event) => $emit('previewChose', event, color.DEFAULT.key)" @mouseenter="(event) => $emit('previewEnter', event, color.DEFAULT.key)" @mouseleave="$emit('previewLeave')" v-tooltip="{ placement: 'top', content: `var(${color.DEFAULT.key})` }" :class="`bg:\$\(${color.DEFAULT.key.slice(2)}\)`" class="w:full r:4 h:24 border:1|solid|transparent border:white:hover cursor:pointer"></button>
                </div>
            </template>

            <!-- if has shades and shades > 0 -->
            <template v-if="color.shades && Object.keys(color.shades).length > 0">
                <div :class="[{}, true ? `grid-template-cols:repeat(${Object.keys(color.shades).length},auto)` : '']" class="variable-section-items grid r:4 overflow:hidden">
                    <div v-for="(shade, shadeKey) in color.shades" :key="shadeKey" class="flex gap:10">
                        <button @click="(event) => $emit('previewChose', event, shade.key)" @mouseenter="(event) => $emit('previewEnter', event, shade.key)" @mouseleave="$emit('previewLeave')" v-tooltip="{ placement: 'top', content: `var(${shade.key})` }" :class="`bg:\$\(${shade.key.slice(2)}\)`" class="w:full h:24 border:1|solid|transparent border:white:hover cursor:pointer"></button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>