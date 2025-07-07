<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { __, sprintf } from '@wordpress/i18n';
import { ref, computed } from 'vue';

const emit = defineEmits(['calculate']);

const scales = ref([
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
]);

// const scalesWithLabels = scales.value.map((scale) => {
//     return {
//         ...scale,
//         label: `${scale.name} (${scale.decimal})`
//     };
// });

const scalesWithLabels = computed(() => {
    return scales.value.map((scale) => {
        return {
            ...scale,
            label: `${scale.name} (${scale.decimal})`
        };
    });
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

function onCreateScale(val: string) {
    if (!val || !val.trim() || isNaN(parseFloat(val))) {
        return;
    }

    scales.value.push({
        name: val,
        decimal: parseFloat(val)
    });

    // defaultFluid.value.minScale = {
    //     name: val,
    //     decimal: parseFloat(val),
    //     label: `${val} (${parseFloat(val)})`
    // };
}

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
    <USlideover :title="i18n.__('Fluid Calculator', 'windpress')" :ui="{ content: 'top-(--wp-admin--admin-bar--height) bottom-0' }">
        <template #body>
            <div class="grid gap-4">
                <div class="text-base text-pretty font-semibold text-highlighted">{{ __('Min Viewport', 'windpress') }}</div>
                <div>
                    <UInput v-model="defaultFluid.minSize" type="number" required :ui="{ trailing: 'pointer-events-none', base: 'peer' }" class="w-full">
                        <label class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
                            <span class="inline-flex bg-default px-1">{{ i18n.__('Size', 'windpress') }}</span>
                        </label>

                        <template #trailing>
                            <div class="text-xs text-muted tabular-nums">
                                px
                            </div>
                        </template>
                    </UInput>
                </div>
                <div class="">
                    <UInput v-model="defaultFluid.minViewport" type="number" required :ui="{ trailing: 'pointer-events-none', base: 'peer' }" class="w-full">
                        <label class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
                            <span class="inline-flex bg-default px-1">{{ i18n.__('Viewport', 'windpress') }}</span>
                        </label>

                        <template #trailing>
                            <div class="text-xs text-muted tabular-nums">
                                px
                            </div>
                        </template>
                    </UInput>
                </div>
                <div>
                    <UInputMenu v-model="defaultFluid.minScale" create-item :items="scalesWithLabels" class="w-full" @create="onCreateScale">
                        <template #label>
                            <span class="inline-flex bg-default px-1">{{ i18n.__('Scale ratio', 'windpress') }}</span>
                        </template>
                    </UInputMenu>
                </div>

                <UFormField label="Retries" help="Specify number of attempts" required>
                    <UInputNumber v-model="retries" placeholder="Enter retries" />
                </UFormField>
            </div>
        </template>
    </USlideover>
</template>


<style lang="scss" scoped>
.stripe-bg {
    background-size: 7.5px 7.5px;
    background-image: linear-gradient(135deg, rgba(99, 105, 124, .25) 4.5%, transparent 0, transparent 50%, rgba(99, 105, 124, .25) 0, rgba(99, 105, 124, .25) 54.5%, transparent 0, transparent);
    background-color: rgba(99, 105, 124, .025);
}
</style>
