<script setup>
const props = defineProps({
    variableItems: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="{m:10;pb:15}>div bb:1|solid|$(gray200)>div:not(:last-child)">
        <div v-for="(item, key) in variableItems" :key="key" class="">
            <div class="variable-section-title font:14 my:10">
                {{ key.replace('_', '-') }}
            </div>

            <div class="variable-section-items flex flex:row gap:8 flex-wrap:wrap">
                <template v-if="item.length > 0">
                    <button v-for="(subItem, subItemKey) in item" :key="subItemKey" @click="(event) => $emit('previewChose', event, subItem.key)" @mouseenter="(event) => $emit('previewEnter', event, subItem.key)" @mouseleave="$emit('previewLeave')" v-tooltip="{ placement: 'top', content: `var(${subItem.key}, ${subItem.value})` }" class=" px:12 py:8 r:8 font:medium fg:$(bdedark) fg:$(accent-normal):hover bg:$(gray150) bg:$(gray300):hover b:0 cursor:pointer {opacity:.5}>span opacity:100:hover>span">
                        <span class="font:14">{{ subItem.label }}</span>
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>