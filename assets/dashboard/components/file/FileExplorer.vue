<script setup lang="ts">
// import { ref, watch } from 'vue'
// import { format, isToday } from 'date-fns'
// // import * as dayjs from 'dayjs'
// import type { Mail } from '../../types'

// const props = defineProps<{
//     mails: Mail[]
// }>()

// const mailsRefs = ref<Element[]>([])

// const selectedMail = defineModel<Mail | null>()

// watch(selectedMail, () => {
//     if (!selectedMail.value) {
//         return
//     }
//     const ref = mailsRefs.value[selectedMail.value.id]
//     if (ref) {
//         ref.scrollIntoView({ block: 'nearest' })
//     }
// })

// defineShortcuts({
//     arrowdown: () => {
//         const index = props.mails.findIndex(mail => mail.id === selectedMail.value?.id)

//         if (index === -1) {
//             selectedMail.value = props.mails[0]
//         } else if (index < props.mails.length - 1) {
//             selectedMail.value = props.mails[index + 1]
//         }
//     },
//     arrowup: () => {
//         const index = props.mails.findIndex(mail => mail.id === selectedMail.value?.id)

//         if (index === -1) {
//             selectedMail.value = props.mails[props.mails.length - 1]
//         } else if (index > 0) {
//             selectedMail.value = props.mails[index - 1]
//         }
//     }
// })









import type { TreeItem } from '@nuxt/ui'

const items: TreeItem[] = [
    {
        label: 'components/',
        defaultExpanded: true,
        onSelect: (e: Event) => {
            e.preventDefault()
        },
        children: [
            {
                label: 'commons/',
                defaultExpanded: true,
                children: [
                    { label: 'card.css', icon: 'vscode-icons:file-type-css' },
                    { label: 'button.css', icon: 'vscode-icons:file-type-css' }
                ]
            },
            {
                label: 'woocommerce/',
                defaultExpanded: true,
                children: [
                    { label: 'pagination.css', icon: 'vscode-icons:file-type-css' },
                    { label: 'accordion.css', icon: 'vscode-icons:file-type-css' }
                ]
            },
        ]
    },
    { label: 'main.css', icon: 'vscode-icons:file-type-tailwind' },
    { label: 'tailwind.config.js', icon: 'vscode-icons:file-type-js-official' },
    { label: 'theme.css', icon: 'vscode-icons:file-type-css' },
    { label: 'wizard.css', icon: 'vscode-icons:file-type-css' },
    // {
    //     label: 'windpress/',
    //     defaultExpanded: true,
    //     onSelect: (e: Event) => {
    //         e.preventDefault()
    //     },
    //     children: [{
    //         label: 'composables/',
    //         children: [
    //             { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' },
    //             { label: 'useUser.ts', icon: 'i-vscode-icons-file-type-typescript' }
    //         ]
    //     },
    //     {
    //         label: 'components/',
    //         defaultExpanded: true,
    //         children: [
    //             { label: 'Card.vue', icon: 'i-vscode-icons-file-type-vue' },
    //             { label: 'Button.vue', icon: 'i-vscode-icons-file-type-vue' }
    //         ]
    //     }]
    // },
    // { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' },
    // { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' },
]
</script>

<template>
    <div class="overflow-y-auto divide-y divide-(--ui-border)">

        <UTree :items="items" />




        <!-- <div v-for="(mail, index) in mails" :key="index" :ref="el => { mailsRefs[mail.id] = el as Element }">
            <div class="p-4 sm:px-6 text-sm cursor-pointer border-l-2 transition-colors" :class="[
                mail.unread ? 'text-(--ui-text-highlighted)' : 'text-(--ui-text-toned)',
                selectedMail && selectedMail.id === mail.id ? 'border-(--ui-primary) bg-(--ui-primary)/10' : 'border-(--ui-bg) hover:border-(--ui-primary) hover:bg-(--ui-primary)/5'
            ]" @click="selectedMail = mail">
                <div class="flex items-center justify-between" :class="[mail.unread && 'font-semibold']">
                    <div class="flex items-center gap-3">
                        {{ mail.from.name }}

                        <UChip v-if="mail.unread" />
                    </div>

                    <span>{{ isToday(new Date(mail.date)) ? format(new Date(mail.date), 'HH:mm') : format(new Date(mail.date), 'dd MMM') }}</span>
                </div>
                <p class="truncate" :class="[mail.unread && 'font-semibold']">
                    {{ mail.subject }}
                </p>
                <p class="text-(--ui-text-dimmed) line-clamp-1">
                    {{ mail.body }}
                </p>
            </div>
        </div> -->
    </div>
</template>