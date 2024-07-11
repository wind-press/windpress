<script setup>
import { onBeforeMount, ref } from 'vue';
import { useLicenseStore } from '@/dashboard/stores/license';
import { useBusyStore } from '@/dashboard/stores/busy';
import { useSettingsStore } from '@/dashboard/stores/settings';
import { useNotifier } from '@/dashboard/library/notifier';
import { useApi } from '@/dashboard/library/api';
import { Switch } from '@headlessui/vue';

const notifier = useNotifier();
const licenseStore = useLicenseStore();
const settingsStore = useSettingsStore();
const busyStore = useBusyStore();
const api = useApi();

const licenseKey = ref('');
const providers = ref([]);

function doLicenseChange() {
    const promise = licenseStore.license.key && licenseStore.isActivated
        ? licenseStore.doDeactivate()
        : licenseStore.doActivate(licenseKey.value);

    promise.then(() => {
        licenseKey.value = licenseStore.license.key;
    });

    notifier.async(
        promise,
        resp => notifier.success(resp.message),
        err => notifier.alert(err.message),
        `${licenseStore.license.key && licenseStore.isActivated ? 'Deactivating' : 'Activating'} license...`
    );
}

async function pullProviders() {
    await api
        .get('admin/settings/cache/providers')
        .then((resp) => {
            providers.value = resp.data.providers;
        });
}

function handleEnableKeyup(e, providerId) {
    if (e.code === 'Space') {
        e.preventDefault();
        settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value = !settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value;
    }
}

function switchProviderStatus(providerId) {
    settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value = !settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value;
    doSave();
}

function doSave() {
    const promise = settingsStore.doPush();

    notifier.async(
        promise,
        resp => notifier.success(resp.message),
        err => notifier.alert(err.message),
        'Storing settings...'
    );
}

const css_cache = ref({
    last_generated: null,
    file_url: null,
    file_size: false,
});

onBeforeMount(() => {
    licenseStore.doPull().then(() => {
        licenseKey.value = licenseStore.license.key;
    });

    settingsStore.doPull();

    pullProviders();

    api
        .get('admin/settings/cache/index')
        .then((resp) => {
            css_cache.value = resp.data.cache;
        });
});
</script>

<template>
    <div class="flex flex:col overflow-y:scroll! h:full fg:foreground {bt:1|solid|sideBar-border}>*+*">
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">License</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="{bt:1|solid|sideBar-border}>*+* ">
                    <div class="p:20">
                        <div class="flex flex:column gap:10">
                            <span class="font:15">License key</span>
                            <div class="flex gap:6">
                                <input v-model="licenseKey" type="password" id="license_key" :disabled="licenseStore.isActivated" class="max-w:400 w:full">
                                <button @click="doLicenseChange" type="button" :disabled="!licenseKey || busyStore.isBusy" class="button button-secondary inline-flex align-items:center gap:8">
                                    <font-awesome-icon v-if="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate')" :icon="['fas', 'circle-notch']" class="@rotate|1s|infinite|linear" />
                                    <template v-if="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate')">
                                        {{ licenseStore.isActivated ? 'Deactivating' : 'Activating' }}
                                    </template>
                                    <template v-else>
                                        {{ licenseStore.isActivated ? 'Deactivate' : 'Activate' }}
                                    </template>

                                </button>
                            </div>
                            <p class="my:0">To access updates when they are available, please provide your license key.</p>
                        </div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">General</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="flex {bt:1|solid|sideBar-border}>*+*  flex:column">
                    <div class="flex flex:column gap:30 p:20">
                        <div class="flex flex:column gap:10">
                            <span class="font:15">Tailwind CSS version</span>
                            <select>
                                <option value="latest">latest</option>
                                <option value="3.4.4">3.4.4</option>
                                <option value="3.4.3">3.4.3</option>
                                <option value="3.4.2">3.4.2</option>
                                <option value="3.4.1">3.4.1</option>
                                <option value="3.4.0">3.4.0</option>
                            </select>
                            <p class="my:0">Please refer to the <a href="https://github.com/tailwindlabs/tailwindcss/releases" target="_blank">release notes</a> to learn more about the Tailwind CSS versions. </p>
                        </div>
                        <div class="flex flex:column gap:10">
                            <span class="font:15">Embedded compiler</span>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="enable_embedded_compiler" class="checkbox mt:0">
                                <label for="enable_embedded_compiler" class="font:medium">Enable compiler on the front page</label>
                            </div>
                            <p class="my:0"> The compiler can be utilized to compile the Tailwind CSS for 3rd party integrations. </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">Performance</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="flex {bt:1|solid|sideBar-border}>*+*  flex:column">
                    <div class="flex flex:column gap:30 p:20">
                        <div class="flex flex:column gap:10">
                            <span class="font:15">Cached CSS</span>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="enable_cached_css" class="checkbox mt:0">
                                <label for="enable_cached_css" class="font:medium">Use cached CSS if available</label>
                            </div>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="force_cdn_admin" class="checkbox mt:0">
                                <label for="force_cdn_admin" class="font:medium">Admin always uses the Play CDN</label>
                            </div>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="inline_cached_css" class="checkbox mt:0">
                                <label for="inline_cached_css" class="font:medium">Load the cached CSS inline</label>
                            </div>
                            <p class="my:0">Serve the CSS file from the cache instead of generating it on the fly using Play CDN.</p>
                            <p class="flex gap-x:4 my:0">
                                <span class="font:medium">Last Generated:</span>2024-07-03 17:38:24 <a href="http://wordpress.localhost/wp-content/uploads/yabe-siul/cache/tailwind.css?ver=1720003104" target="_blank">
                                    <svg class="svg-inline--fa fa-arrow-up-right-from-square" aria-hidden="true" focusable="false" data-prefix="far" data-icon="arrow-up-right-from-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path class="" fill="currentColor" d="M304 24c0 13.3 10.7 24 24 24H430.1L207 271c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l223-223V184c0 13.3 10.7 24 24 24s24-10.7 24-24V24c0-13.3-10.7-24-24-24H328c-13.3 0-24 10.7-24 24zM72 32C32.2 32 0 64.2 0 104V440c0 39.8 32.2 72 72 72H408c39.8 0 72-32.2 72-72V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V440c0 13.3-10.7 24-24 24H72c-13.3 0-24-10.7-24-24V104c0-13.3 10.7-24 24-24H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H72z"></path>
                                    </svg>
                                </a>
                            <div class="bg:lime-5/.5 fg:lime-70 font:12 font:medium ml:8 outline:1|solid|lime-60/.2 px:8 py:2 r:6">3.59kB</div>
                            </p>
                            <div>
                                <button type="button" class="button button-secondary inline-flex align-items:center gap:8"> Generate</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">Integrations</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="">
                    <div class="grid grid-cols:2 gap:1 m:1">


                        <!--  -->


                        <div v-for="provider in providers" :key="provider.id" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'bg:sky-5 bg:sky-30/.2@dark z:10' : '']" class="flex rel p:12">
                            <div class="flex align-items:center">
                                <Switch :aria-disabled="busyStore.isBusy" :checked="settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value" @click="switchProviderStatus(provider.id)" @keyup="e => handleEnableKeyup(e, provider.id)" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'bg:sky-70' : 'bg:gray-15 opacity:.5']" class="inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44">
                                    <span :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'translateX(20)' : 'translateX(0)']" class="inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'opacity:0 transition-duration:100 transition-timing-function:ease-out' : 'opacity:1 transition-duration:200 transition-timing-function:ease-in']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <font-awesome-icon :icon="['fas', 'xmark']" class="fg:gray-40" />
                                        </span>
                                        <span aria-hidden="true" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'opacity:1 transition-duration:200 transition-timing-function:ease-in' : 'opacity:0 transition-duration:100 transition-timing-function:ease-out']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <font-awesome-icon :icon="['fas', 'check']" class="fg:sky-70" />
                                        </span>
                                    </span>
                                </Switch>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">{{ provider.name }}</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ {{ provider.id }} ]</span>
                                </div>
                                <span class="">{{ provider.description }}</span>
                            </div>
                        </div>



                        <!--  -->





                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-2" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">Oxygen Builder</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ oxygen ]</span>
                                </div>
                                <span class="">Oxygen Builder integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-3" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">Kadence WP</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ kadence ]</span>
                                </div>
                                <span class="">Kadence WP integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-4" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">Blockstudio</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ blockstudio ]</span>
                                </div>
                                <span class="">Blockstudio integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-5" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">LiveCanvas</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ livecanvas ]</span>
                                </div>
                                <span class="">LiveCanvas integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-6" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">Gutenberg</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ gutenberg ]</span>
                                </div>
                                <span class="">Gutenberg integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-7" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">Breakdance Builder</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ breakdance ]</span>
                                </div>
                                <span class="">Breakdance Builder integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-8" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">Timber</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ timber ]</span>
                                </div>
                                <span class="">Timber integration</span>
                            </div>
                        </div>
                        <div class="bg:sky-5 bg:sky-30/.2@dark z:10 flex rel p:12">
                            <div class="flex align-items:center">
                                <button aria-disabled="false" checked="true" class="bg:sky-70 inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44" id="headlessui-switch-9" role="switch" type="button" tabindex="0" aria-checked="false" data-headlessui-state="">
                                    <span class="translateX(20) inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" class="opacity:0 transition-duration:100 transition-timing-function:ease-out abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-xmark fg:gray-40" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                <path class="" fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                                            </svg>
                                        </span>
                                        <span aria-hidden="true" class="opacity:1 transition-duration:200 transition-timing-function:ease-in abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <svg class="svg-inline--fa fa-check fg:sky-70" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                <path class="" fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">GreenShift</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ greenshift ]</span>
                                </div>
                                <span class="">GreenShift integration</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
    </div>


</template>