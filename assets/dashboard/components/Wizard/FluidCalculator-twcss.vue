<script setup>
import { useStorage } from '@vueuse/core';
import { __, sprintf } from '@wordpress/i18n';

const emit = defineEmits(['calculate']);

const scales = [
    {
        name: __('Perfect Unison', 'windpress'),
        decimal: 1,
        fractional: [1, 1],
    },
    {
        name: __('Minor Second', 'windpress'),
        decimal: 1.067,
        fractional: [16, 15]
    },
    {
        name: __('Major Second', 'windpress'),
        decimal: 1.125,
        fractional: [9, 8]
    },
    {
        name: __('Minor Third', 'windpress'),
        decimal: 1.2,
        fractional: [6, 5]
    },
    {
        name: __('Major Third', 'windpress'),
        decimal: 1.25,
        fractional: [5, 4]
    },
    {
        name: __('Perfect Fourth', 'windpress'),
        decimal: 1.333,
        fractional: [4, 3]
    },
    {
        name: __('Tritone', 'windpress'),
        decimal: 1.414,
        fractional: [Math.sqrt(2), 1]
    },
    {
        name: __('Perfect Fifth', 'windpress'),
        decimal: 1.5,
        fractional: [3, 2]
    },
    {
        name: __('Minor Sixth', 'windpress'),
        decimal: 1.6,
        fractional: [8, 5]
    },
    {
        name: __('Golden Ratio', 'windpress'),
        decimal: 1.618,
        fractional: [89, 55]
    },
    {
        name: __('Major Sixth', 'windpress'),
        decimal: 1.667,
        fractional: [5, 3]
    },
    {
        name: __('Minor Seventh', 'windpress'),
        decimal: 1.778,
        fractional: [16, 9]
    },
    {
        name: __('Major Seventh', 'windpress'),
        decimal: 1.875,
        fractional: [15, 8]
    },
    {
        name: __('Perfect Octave', 'windpress'),
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
    if (!confirm(__('Are you sure you want to generate the fluid scale and import it?', 'windpress'))) {
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
        <div class="border-t border-gray-200 [&>*+*]:border-gray-200 m-3 rounded-lg">
            <div class="bg-gray-50 text-gray-700 text-xl font-medium p-5 rounded-t-lg">{{ __('Calculator', 'windpress') }}</div>

            <!-- min viewport -->

            <div class="grid gap-2 p-5">
                <div class="block capitalize text-gray-700 text-base">{{ __('Min Viewport', 'windpress') }}</div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="min-size" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Size', 'windpress') }}</label>
                        <input v-model="defaultFluid.minSize" type="number" id="min-size" required class="block border border-gray-200 text-gray-900 placeholder:text-gray-300 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" />

                        <div class="absolute flex items-center bottom-0 pr-3 right-0 top-0">
                            <span class="font-medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="min-viewport" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Viewport', 'windpress') }}</label>
                        <input v-model="defaultFluid.minViewport" type="number" id="min-viewport" required class="block border border-gray-200 text-gray-900 placeholder:text-gray-300 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" />

                        <div class="absolute flex items-center bottom-0 pr-3 right-0 top-0">
                            <span class="font-medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="min-scale" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2 z-10">{{ __('Scale ratio', 'windpress') }}</label>
                        <VueSelect v-model="defaultFluid.minScale" id="min-scale" taggable push-tags :options="scalesWithLabels" class="border border-gray-200 rounded-md">
                            <template #search="{ attributes, events }">
                                <input class="vs__search" :required="!defaultFluid.minScale" v-bind="attributes" v-on="events" />
                            </template>
                        </VueSelect>
                    </div>
                </div>
            </div>

            <!-- max viewport -->

            <div class="grid gap-2 p-5">
                <div class="block capitalize text-gray-700 text-base">{{ __('Max Viewport', 'windpress') }}</div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="max-size" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Size', 'windpress') }}</label>
                        <input v-model="defaultFluid.maxSize" type="number" id="max-size" required class="block border border-gray-200 text-gray-900 placeholder:text-gray-300 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" />

                        <div class="absolute flex items-center bottom-0 pr-3 right-0 top-0">
                            <span class="font-medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="max-viewport" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Viewport', 'windpress') }}</label>
                        <input v-model="defaultFluid.maxViewport" type="number" id="max-viewport" required class="block border border-gray-200 text-gray-900 placeholder:text-gray-300 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" />

                        <div class="absolute flex items-center bottom-0 pr-3 right-0 top-0">
                            <span class="font-medium">px</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="max-scale" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2 z-10">{{ __('Scale ratio', 'windpress') }}</label>
                        <VueSelect v-model="defaultFluid.maxScale" id="max-scale" taggable push-tags :options="scalesWithLabels" class="border border-gray-200 rounded-md">
                            <template #search="{ attributes, events }">
                                <input class="vs__search" :required="!defaultFluid.maxScale" v-bind="attributes" v-on="events" />
                            </template>
                        </VueSelect>
                    </div>
                </div>
            </div>

            <!-- scale step -->

            <div class="grid gap-2 p-5">
                <div class="block capitalize text-gray-700 text-base">{{ __('Scale Step', 'windpress') }}</div>
                <div class="flex gap-2.5">
                    <div>
                        <div class="relative mt-2 rounded-lg">
                            <label for="screen-breakpoint" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Smaller steps', 'windpress') }}</label>
                            <input type="number" v-model="defaultFluid.stepsSmaller" id="smaller-steps" required min="0" class="block border border-gray-200 text-gray-900 placeholder:text-gray-700 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" />
                        </div>
                    </div>
                    <div>
                        <div class="relative mt-2 rounded-lg">
                            <label for="screen-breakpoint" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Larger steps', 'windpress') }}</label>
                            <input type="number" v-model="defaultFluid.stepsLarger" id="larger-steps" required min="0" class="block border border-gray-200 text-gray-900 placeholder:text-gray-700 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" />
                        </div>
                    </div>
                </div>
                <div class="grid gap-2.5 grid-cols-5 text-center">
                    <div @click="defaultFluid.stepsSmaller++" class="stripe-bg flex items-center border border-transparent hover:border-gray-200 cursor-pointer font-semibold justify-center px-4 py-2.5 rounded-md">
                        <font-awesome-icon :icon="['fas', 'plus']" class="text-gray-600" />
                    </div>
                    <div v-for="step in defaultFluid.stepsSmaller" :key="step" @click="defaultFluid.stepsSmaller -= (step === 1)" :class="step === 1 ? 'cursor-pointer hover:border-gray-200' : ''" class="flex items-center bg-gray-100 border border-transparent justify-center px-4 py-2.5 rounded-md">
                        <span v-if="step === defaultFluid.stepsSmaller">sm</span>
                        <span v-else-if="step === defaultFluid.stepsSmaller - 1">xs</span>
                        <span v-else>{{ defaultFluid.stepsSmaller - step }}xs</span>
                    </div>
                    <div class="flex items-center bg-blue-400 text-white font-semibold justify-center px-4 py-2.5 rounded-md">base</div>
                    <div v-for="step in defaultFluid.stepsLarger" :key="step" @click="defaultFluid.stepsLarger -= (step === defaultFluid.stepsLarger)" :class="step === defaultFluid.stepsLarger ? 'cursor-pointer hover:border-gray-200' : ''" class="flex items-center bg-gray-200 border border-transparent font-semibold justify-center px-4 py-2.5 rounded-md">
                        <span v-if="step === 1">lg</span>
                        <span v-else-if="step === 2">xl</span>
                        <span v-else>{{ step - 1 }}xl</span>
                    </div>
                    <div @click="defaultFluid.stepsLarger++" class="stripe-bg flex items-center border border-transparent hover:border-gray-200 cursor-pointer font-semibold justify-center px-4 py-2.5 rounded-md">
                        <font-awesome-icon :icon="['fas', 'plus']" class="text-gray-600" />
                    </div>
                </div>
            </div>

            <!-- misc -->

            <div class="grid gap-2 p-5">
                <div class="block capitalize text-gray-700 text-base">{{ __('Misc', 'windpress') }}</div>
                <div>
                    <div class="relative mt-2 rounded-lg">
                        <label for="prefix" class="absolute inline-block bg-white text-gray-900 text-xs font-medium left-2 px-1 -top-2">{{ __('Prefix', 'windpress') }}</label>
                        <input type="text" v-model="defaultFluid.miscPrefix" class="block border border-gray-200 text-gray-900 placeholder:text-gray-300 invalid:outline-2 invalid:outline-red-400 py-1.5 rounded-md w-full" :placeholder="__('fluid-', 'windpress')" />
                    </div>
                </div>

            </div>

            <!-- import button -->
            <div class="flex gap-2 p-5">
                <button type="submit" class="button items-center bg-sky-700/15 hover:bg-sky-700/30 border-0 text-sky-700 flex-grow float-right ml-0 px-2.5 rounded-lg text-center">
                    <font-awesome-icon :icon="['fas', 'gears']" class="pr-1.5" />
                    {{ __('Generate', 'windpress') }}
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
