<script setup>
import ProjectsMenu from './components/ProjectsMenu.vue';
</script>

<template>
    <Suspense>
        <UApp>
            <UDashboardGroup storage="local" class="relative">
                <!-- <UDashboardSearch :groups="groups" /> -->

                <UDashboardSidebar :collapsible="false" resizable class="bg-(--ui-bg-elevated)/25" :ui="{ root: 'flex', footer: 'lg:border-t lg:border-(--ui-border)' }">
                    <template #header="{ collapsed }">
                        <ProjectsMenu :collapsed="collapsed" />
                        <!-- OK -->
                    </template>

                    <template #default="{ collapsed }">
                        <!-- <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-border)" /> -->

                        <!-- <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" /> -->

                        <!-- <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" class="mt-auto" /> -->
                    </template>

                    <template #footer="{ collapsed }">
                        <!-- <UserMenu :collapsed="collapsed" /> -->
                    </template>
                </UDashboardSidebar>

                <RouterView />

                <!-- <NotificationsSlideover /> -->
            </UDashboardGroup>
        </UApp>
    </Suspense>
</template>