<script setup>
import { ref, computed, shallowRef } from 'vue';
import { useStorage } from '@vueuse/core';
import { useUIStore } from '../../../stores/ui.js';

const ui = useUIStore();

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};

const twCss = ref('// some code...');

/** @type {?import('monaco-editor').editor.IStandaloneCodeEditor} */
const editorCssRef = shallowRef();
const handleCssEditorMount = editor => (editorCssRef.value = editor);

</script>

<template>
    <vue-monaco-editor v-model:value="twCss" language="scss" path="file:///main.css" :options="MONACO_EDITOR_OPTIONS" @mount="handleCssEditorMount" :theme="ui.virtualState('window.color-mode', 'light').value === 'light' ? 'vs' : 'vs-dark'" />
</template>