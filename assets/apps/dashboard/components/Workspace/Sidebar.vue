<script setup>
import Explorer from './Sidebar/Explorer.vue';
import { useUIStore } from '@/dashboard/stores/ui.js';

const ui = useUIStore();

const sidebarComponents = {
    explorer: Explorer,
};

function doSwitch(name) {
    if (ui.virtualState('sidebar.active', 'explorer').value === name) {
        ui.virtualState('sidebar.isShow', true).value = !ui.virtualState('sidebar.isShow', true).value;
    } else {
        ui.virtualState('sidebar.active').value = name;
        ui.virtualState('sidebar.isShow', true).value = true;
    }
}
</script>

<template>
    <div class="sidebar-nav w:48 h:full flex-grow:0 flex-shrink:0 bg:sideBar-background fg:sideBar-foreground/.7 {fg:sideBar-foreground}_.sidebar-nav-item:hover {bl:focusBorder;fg:sideBar-foreground}_.sidebar-nav-item.active">
        <!-- nav -->
        <div class="sidebar-nav-content flex flex:column h:full">
            <div class="composite-bar flex-grow:1 {font:24;py:14;mx:auto;text-align:center;w:full;bx:2|solid|transparent;cursor:pointer}>.sidebar-nav-item">
                <div :class="{ active: ui.virtualState('sidebar.isShow', true).value && ui.virtualState('sidebar.active', 'explorer').value === 'explorer' }" @click="doSwitch('explorer')" v-tooltip="{ placement: 'right', content: wp_i18n.__('Explorer', 'windpress') }" class="sidebar-nav-item explorer">
                    <svg class="inline-svg fill:current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 0H8.5L7 1.5V6H2.5L1 7.5V22.5699L2.5 24H14.5699L16 22.5699V18H20.7L22 16.5699V4.5L17.5 0ZM17.5 2.12L19.88 4.5H17.5V2.12ZM14.5 22.5H2.5V7.5H7V16.5699L8.5 18H14.5V22.5ZM20.5 16.5H8.5V1.5H16V6H20.5V16.5Z" fill="current" />
                    </svg>
                </div>
            </div>
            <div class="action-bar {font:24;py:14;mx:auto;text-align:center;w:full;bx:2|solid|transparent;cursor:pointer}>.sidebar-nav-item ">
                <VDropdown placement="right" class="sidebar-nav-item help" v-tooltip="{ placement: 'right', content: wp_i18n.__('Help', 'windpress') }">
                    <svg class="inline-svg fill:current" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.54907 10.0781C8.00936 10.2604 8.42863 10.502 8.80688 10.8027C9.18514 11.1035 9.50871 11.4521 9.77759 11.8486C10.0465 12.2451 10.2538 12.6712 10.3997 13.127C10.5455 13.5827 10.6207 14.0612 10.6252 14.5625V15H9.75024V14.5625C9.75024 14.0202 9.64771 13.5098 9.44263 13.0312C9.23755 12.5527 8.955 12.1357 8.59497 11.7803C8.23494 11.4248 7.81795 11.1445 7.34399 10.9395C6.87004 10.7344 6.35962 10.6296 5.81274 10.625C5.27043 10.625 4.76001 10.7275 4.28149 10.9326C3.80298 11.1377 3.38599 11.4202 3.03052 11.7803C2.67505 12.1403 2.39478 12.5573 2.1897 13.0312C1.98462 13.5052 1.8798 14.0156 1.87524 14.5625V15H1.00024V14.5625C1.00024 14.0658 1.07316 13.5872 1.21899 13.127C1.36483 12.6667 1.57446 12.2406 1.8479 11.8486C2.12134 11.4567 2.44491 11.1104 2.8186 10.8096C3.1923 10.5088 3.61157 10.265 4.07642 10.0781C3.87134 9.93685 3.68677 9.77279 3.52271 9.58594C3.35864 9.39909 3.21965 9.19857 3.10571 8.98438C2.99178 8.77018 2.90519 8.54232 2.84595 8.30078C2.7867 8.05924 2.7548 7.81315 2.75024 7.5625C2.75024 7.13867 2.83 6.74219 2.9895 6.37305C3.14901 6.00391 3.36776 5.68034 3.64575 5.40234C3.92375 5.12435 4.24731 4.9056 4.61646 4.74609C4.9856 4.58659 5.38436 4.50456 5.81274 4.5C6.23657 4.5 6.63306 4.57975 7.0022 4.73926C7.37134 4.89876 7.69491 5.11751 7.9729 5.39551C8.2509 5.6735 8.46965 5.99707 8.62915 6.36621C8.78866 6.73535 8.87069 7.13411 8.87524 7.5625C8.87524 7.81315 8.84562 8.05697 8.78638 8.29395C8.72713 8.53092 8.63826 8.75879 8.51978 8.97754C8.40129 9.19629 8.26229 9.39909 8.10278 9.58594C7.94328 9.77279 7.75871 9.93685 7.54907 10.0781ZM5.81274 9.75C6.11353 9.75 6.39608 9.69303 6.6604 9.5791C6.92472 9.46517 7.15487 9.31022 7.35083 9.11426C7.54679 8.91829 7.70402 8.68587 7.82251 8.41699C7.941 8.14811 8.00024 7.86328 8.00024 7.5625C8.00024 7.26172 7.94328 6.97917 7.82935 6.71484C7.71541 6.45052 7.55819 6.22038 7.35767 6.02441C7.15715 5.82845 6.92472 5.67122 6.6604 5.55273C6.39608 5.43424 6.11353 5.375 5.81274 5.375C5.51196 5.375 5.22941 5.43197 4.96509 5.5459C4.70076 5.65983 4.46834 5.81706 4.26782 6.01758C4.0673 6.2181 3.91007 6.45052 3.79614 6.71484C3.68221 6.97917 3.62524 7.26172 3.62524 7.5625C3.62524 7.86328 3.68221 8.14583 3.79614 8.41016C3.91007 8.67448 4.06502 8.9069 4.26099 9.10742C4.45695 9.30794 4.68937 9.46517 4.95825 9.5791C5.22713 9.69303 5.51196 9.75 5.81274 9.75ZM15.0002 1V8H13.2502L10.6252 10.625V8H9.75024V7.125H11.5002V8.5127L12.8879 7.125H14.1252V1.875H5.37524V3.44727C5.22941 3.46549 5.08358 3.48828 4.93774 3.51562C4.79191 3.54297 4.64608 3.58398 4.50024 3.63867V1H15.0002Z" fill="current" />
                    </svg>

                    <template #popper>
                        <div>
                            <div role="group" class="flex flex:column font:14 min-w:120 p:4 w:auto">
                                <a href="https://wind.press/docs?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=pro-version" target="_blank" class="flex align-items:center bg:white bg:gray-10:hover box-shadow:none:focus cursor:pointer fg:gray-90 gap:10 px:10 py:6 r:4 text-decoration:none user-select:none">
                                    <i-fa6-solid-book class="iconify" />
                                    {{ wp_i18n.__('Documentation', 'windpress') }}
                                </a>
                                <a href="https://rosua.org/support-portal" target="_blank" class="flex align-items:center bg:white bg:gray-10:hover box-shadow:none:focus cursor:pointer fg:gray-90 gap:10 px:10 py:6 r:4 text-decoration:none user-select:none">
                                    <i-healthicons-contact-support class="iconify"/>
                                    {{ wp_i18n.__('Support', 'windpress') }}
                                </a>
                                <a href="https://www.facebook.com/groups/1142662969627943" target="_blank" class="flex align-items:center bg:white bg:gray-10:hover box-shadow:none:focus cursor:pointer fg:gray-90 gap:10 px:10 py:6 r:4 text-decoration:none user-select:none">
                                    <i-fa6-brands-facebook class="iconify" />
                                    {{ wp_i18n.__('Community', 'windpress') }}
                                </a>
                            </div>
                        </div>
                    </template>
                </VDropdown>
            </div>
        </div>
    </div>
    <div v-if="ui.virtualState('sidebar.isShow', true).value" class="sidebar w:268 flex-grow:0 flex-shrink:0 bg:sideBar-background fg:sideBar-foreground bl:1|solid|sideBar-border">
        <!-- sidebar -->
        <div class="sidebar__inner">
            <component :is="sidebarComponents[ui.virtualState('sidebar.active', 'explorer').value]" />
        </div>
    </div>
</template>