<script setup>
const props = defineProps({
    variableItems: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="{m:10;pb:15}>div bb:1|solid|$(builder-border-color)>div:not(:last-child)">
        <div v-for="(item, key) in variableItems" :key="key" class="">
            <div class="variable-section-title font:14 my:10">
                {{ key.replace('_', '-') }}
            </div>

            <div class="variable-section-items flex flex:row gap:8 flex-wrap:wrap">
                <template v-if="item.length > 0">
                    <button v-for="(subItem, subItemKey) in item" :key="subItemKey" v-tooltip="{ placement: 'top', content: `var(${subItem.key})` }" class="px:12 py:8 r:$(builder-border-radius) fg:$(builder-color) bg:$(builder-bg-2) bg:$(builder-bg-3):hover {opacity:.5;font:semibold}>span opacity:100:hover>span">
                        <span class="font:14">{{ subItem.label }}</span>
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>