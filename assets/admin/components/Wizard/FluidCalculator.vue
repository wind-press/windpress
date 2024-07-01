<script setup>
import { useStorage } from '@vueuse/core';

const emit = defineEmits(['calculate']);

const scales = [
    {
        name: 'Perfect Unison',
        decimal: 1,
        fractional: [1, 1],
    },
    {
        name: 'Minor Second',
        decimal: 1.067,
        fractional: [16, 15]
    },
    {
        name: 'Major Second',
        decimal: 1.125,
        fractional: [9, 8]
    },
    {
        name: 'Minor Third',
        decimal: 1.2,
        fractional: [6, 5]
    },
    {
        name: 'Major Third',
        decimal: 1.25,
        fractional: [5, 4]
    },
    {
        name: 'Perfect Fourth',
        decimal: 1.333,
        fractional: [4, 3]
    },
    {
        name: 'Tritone',
        decimal: 1.414,
        fractional: [Math.sqrt(2), 1]
    },
    {
        name: 'Perfect Fifth',
        decimal: 1.5,
        fractional: [3, 2]
    },
    {
        name: 'Minor Sixth',
        decimal: 1.6,
        fractional: [8, 5]
    },
    {
        name: 'Golden Ratio',
        decimal: 1.618,
        fractional: [89, 55]
    },
    {
        name: 'Major Sixth',
        decimal: 1.667,
        fractional: [5, 3]
    },
    {
        name: 'Minor Seventh',
        decimal: 1.778,
        fractional: [16, 9]
    },
    {
        name: 'Major Seventh',
        decimal: 1.875,
        fractional: [15, 8]
    },
    {
        name: 'Perfect Octave',
        decimal: 2,
        fractional: [2, 1]
    }
];

const scalesWithLabels = scales.map((scale) => {
    return {
        ...scale,
        label: `${scale.name} (${scale.decimal})`
    };
});

const defaultFluid = useStorage('windpress.ui.wizard.fluid-calculator', {
    minSize: 18,
    maxSize: 20,
    minScale: scalesWithLabels[3],
    maxScale: scalesWithLabels[4],
    minViewport: 320,
    maxViewport: 1400,
    stepsSmaller: 4,
    stepsLarger: 4,
    miscPrefix: 'fluid-',
});

function submitForm() {
    if (!confirm('Are you sure you want to generate the fluid scale and import it?')) {
        return;
    }

    emit('calculate', {
        minSize: defaultFluid.value.minSize,
        maxSize: defaultFluid.value.maxSize,
        minScale: defaultFluid.value.minScale.decimal ?? defaultFluid.value.minScale.label,
        maxScale: defaultFluid.value.maxScale.decimal ?? defaultFluid.value.maxScale.label,
        minViewport: defaultFluid.value.minViewport,
        maxViewport: defaultFluid.value.maxViewport,
        stepsSmaller: defaultFluid.value.stepsSmaller,
        stepsLarger: defaultFluid.value.stepsLarger,
        miscPrefix: defaultFluid.value.miscPrefix,
    });
}
</script>

<template>
    <form @submit.prevent="submitForm">
        <div class="{bt:1|solid|gray-20}>*+* border:1|solid|gray-20 m:12 r:8">
            <div class="bg:gray-5 fg:gray-70 font:20 font:medium p:20 rt:8">Calculator</div>

            <!-- min viewport -->

            <div class="grid gap:8 p:20">
                <div class="block capitalize fg:gray-70  font:16">Min Viewport</div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="min-size" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Size</label>
                        <input v-model="defaultFluid.minSize" type="number" id="min-size" required class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" />

                        <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                            <span class="font:medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="min-viewport" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Viewport</label>
                        <input v-model="defaultFluid.minViewport" type="number" id="min-viewport" required class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" />

                        <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                            <span class="font:medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="min-scale" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8 z:1">Scale ratio</label>
                        <VueSelect v-model="defaultFluid.minScale" id="min-scale" taggable push-tags :options="scalesWithLabels" class="border:1|solid|gray-20 r:6">
                            <template #search="{ attributes, events }">
                                <input class="vs__search" :required="!defaultFluid.minScale" v-bind="attributes" v-on="events" />
                            </template>
                        </VueSelect>
                    </div>
                </div>
            </div>

            <!-- max viewport -->

            <div class="grid gap:8 p:20">
                <div class="block capitalize fg:gray-70 font:16">Max Viewport</div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="max-size" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Size</label>
                        <input v-model="defaultFluid.maxSize" type="number" id="max-size" required class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" />

                        <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                            <span class="font:medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="max-viewport" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Viewport</label>
                        <input v-model="defaultFluid.maxViewport" type="number" id="max-viewport" required class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" />

                        <div class="abs flex align-items:center bottom:0 pr:12 right:0 top:0">
                            <span class="font:medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="max-scale" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8 z:1">Scale ratio</label>
                        <VueSelect v-model="defaultFluid.maxScale" id="max-scale" taggable push-tags :options="scalesWithLabels" class="border:1|solid|gray-20 r:6">
                            <template #search="{ attributes, events }">
                                <input class="vs__search" :required="!defaultFluid.maxScale" v-bind="attributes" v-on="events" />
                            </template>
                        </VueSelect>
                    </div>
                </div>
            </div>

            <!-- scale step -->

            <div class="grid gap:8 p:20">
                <div class="block capitalize fg:gray-70 font:16">Scale Step</div>
                <div class="flex gap:10">
                    <div>
                        <div class="rel mt:8 r:8">
                            <label for="screen-breakpoint" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Smaller steps</label>
                            <input type="number" v-model="defaultFluid.stepsSmaller" id="smaller-steps" required min="0" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-70::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" />
                        </div>
                    </div>
                    <div>
                        <div class="rel mt:8 r:8">
                            <label for="screen-breakpoint" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Larger steps</label>
                            <input type="number" v-model="defaultFluid.stepsLarger" id="larger-steps" required min="0" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-70::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" />
                        </div>
                    </div>
                </div>
                <div class="grid gap:10 grid-cols:5 text:center">
                    <div @click="defaultFluid.stepsSmaller++" class="stripe-bg flex align-items:center border:1|solid|transparent border:gray-20:hover cursor:pointer font:semibold justify-content:center px:15 py:10 r:6">
                        <font-awesome-icon :icon="['fas', 'plus']" class="fg:gray-60" />
                    </div>
                    <div v-for="step in defaultFluid.stepsSmaller" :key="step" @click="defaultFluid.stepsSmaller -= (step === 1)" :class="step === 1 ? 'cursor:pointer border:gray-20:hover' : ''" class="flex align-items:center bg:gray-10 border:1|solid|transparent justify-content:center px:15 py:10 r:6">
                        <span v-if="step === defaultFluid.stepsSmaller">sm</span>
                        <span v-else-if="step === defaultFluid.stepsSmaller - 1">xs</span>
                        <span v-else>{{ defaultFluid.stepsSmaller - step }}xs</span>
                    </div>
                    <div class="flex align-items:center bg:blue-40 fg:white font:semibold justify-content:center px:15 py:10 r:6">base</div>
                    <div v-for="step in defaultFluid.stepsLarger" :key="step" @click="defaultFluid.stepsLarger -= (step === defaultFluid.stepsLarger)" :class="step === defaultFluid.stepsLarger ? 'cursor:pointer border:gray-20:hover' : ''" class="flex align-items:center bg:gray-20 border:1|solid|transparent font:semibold justify-content:center px:15 py:10 r:6">
                        <span v-if="step === 1">lg</span>
                        <span v-else-if="step === 2">xl</span>
                        <span v-else>{{ step - 1 }}xl</span>
                    </div>
                    <div @click="defaultFluid.stepsLarger++" class="stripe-bg flex align-items:center border:1|solid|transparent border:gray-20:hover cursor:pointer font:semibold justify-content:center px:15 py:10 r:6">
                        <font-awesome-icon :icon="['fas', 'plus']" class="fg:gray-60" />
                    </div>
                </div>
            </div>

            <!-- misc -->

            <div class="grid gap:8 p:20">
                <div class="block capitalize fg:gray-70 font:16">Misc</div>
                <div>
                    <div class="rel mt:8 r:8">
                        <label for="prefix" class="abs inline-block bg:white fg:gray-90 font:12 font:medium left:8 px:4 top:-8">Prefix</label>
                        <input type="text" v-model="defaultFluid.miscPrefix" class="block border:1|solid|gray-20 fg:gray-90 fg:gray-30::placeholder outline:2|solid|crimson-40:invalid py:6 r:6 w:full" placeholder="fluid-" />
                    </div>
                </div>

            </div>

            <!-- import button -->
            <div class="flex gap:8 p:20">
                <button type="submit" class="button align-items:center bg:sky-70/.15 bg:sky-70/.3:hover border:0 fg:sky-70 flex-grow:1 float:right ml:0 px:10 r:8 text:center">
                    <font-awesome-icon :icon="['fas', 'gears']" class="pr:6" />
                    Generate
                </button>
            </div>

        </div>
    </form>
</template>

<style lang="scss">
.vs--single {
    &.v-select {
        box-shadow: 0 0 0 transparent;
        background-color: #fff;
        color: #2c3338;
    }

    &.v-select.vs--open {
        box-shadow: var(--ring-inset) 0 0 0 calc(1px + var(--ring-offset-width)) var(--ring-color);
        --ring-color: theme('colors.sky.600');
    }

    &.vs--open .vs__selected,
    &.vs--loading .vs__selected {
        position: initial;
        opacity: .4
    }

    input[type=search].vs__search {
        background-color: transparent;
        border: none;
        box-shadow: none;
        line-height: normal;
        margin: 0;
        padding-top: 2px;
        padding-bottom: 2px;
        width: theme('width.full');
        font-size: theme('fontSize.sm');
    }

    input[type=search].vs__search::placeholder {
        color: #646970;
    }

    span.vs__selected {
        font-size: theme('fontSize.sm');
        margin: 0 2px;
        width: theme('width.full');
    }

    .vs__dropdown-toggle {
        border: none;
        padding: 0;
        padding-top: 6px;
        padding-bottom: 6px;
        min-height: 26px;
    }

    .vs__dropdown-menu {
        padding: 0;
    }

    .vs__selected-options {
        flex-grow: 0;
        flex-wrap: nowrap;
    }

    .vs__selected-options:has(>span.vs__selected) input[type=search].vs__search {
        width: 1px;
    }

    .vs__actions {
        --vs-actions-padding: 0px 6px 0 3px;
        padding-top: 0;
    }

    .vs__actions svg {
        transform: scale(0.7);
        fill: #7a7a7a;
    }

    &.vs--open .vs__actions svg {
        transform: rotate(180deg) scale(0.7);
    }

    .vs__clear {
        display: none;
    }

    .vs__open-indicator {
        position: absolute;
        right: 4px;
    }
}
</style>

<style lang="scss" scoped>
.stripe-bg {
    background-size: 7.5px 7.5px;
    background-image: linear-gradient(135deg, rgba(99, 105, 124, .25) 4.5%, transparent 0, transparent 50%, rgba(99, 105, 124, .25) 0, rgba(99, 105, 124, .25) 54.5%, transparent 0, transparent);
    background-color: rgba(99, 105, 124, .025);
}
</style>