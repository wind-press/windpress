import { watch, type Ref } from 'vue'
import { useWizardTree } from './useWizardTree'
import { useWizardDragDrop } from './useWizardDragDrop'
import type { WizardTheme } from './useWizard'

export function useMultiWizardTree(
    namespaces: Array<keyof WizardTheme['namespaces']>,
    theme: Ref<WizardTheme>
) {
    const trees = {} as Record<string, ReturnType<typeof useWizardTree>>
    const dragDropLogics = {} as Record<string, ReturnType<typeof useWizardDragDrop>>

    // Initialize trees for each namespace
    namespaces.forEach(namespace => {
        const tree = useWizardTree(namespace, theme)
        trees[namespace] = tree
        
        const dragDropLogic = useWizardDragDrop(tree.items, tree.updateThemeFromItems, tree.findItemByUid)
        dragDropLogics[namespace] = dragDropLogic
    })

    // Watch for changes in each namespace
    namespaces.forEach(namespace => {
        watch(() => theme.value.namespaces[namespace], () => {
            trees[namespace].initializeItems()
        }, { deep: true })
    })

    function initializeAll() {
        namespaces.forEach(namespace => {
            trees[namespace].initializeItems()
        })
    }

    function updateAllThemes() {
        namespaces.forEach(namespace => {
            trees[namespace].updateThemeFromItems()
        })
    }

    // Cross-namespace drag prevention for typography
    function createCrossSafeDragDrop(sourceNamespace: string, targetNamespace: string) {
        const sourceDragDrop = dragDropLogics[sourceNamespace]
        const targetDragDrop = dragDropLogics[targetNamespace]
        const sourceTree = trees[sourceNamespace]
        const targetTree = trees[targetNamespace]
        
        return {
            shouldBeDimmed: (itemId: string) => {
                // Only check the namespace that contains the item
                const sourceItem = sourceTree.findItemByUid(sourceTree.items.value, itemId)
                const targetItem = targetTree.findItemByUid(targetTree.items.value, itemId)
                
                if (sourceItem) {
                    return sourceDragDrop.shouldBeDimmed(itemId)
                } else if (targetItem) {
                    return targetDragDrop.shouldBeDimmed(itemId)
                }
                return false
            },
            wasRecentlyMoved: (itemId: string) => {
                // Only check the namespace that contains the item
                const sourceItem = sourceTree.findItemByUid(sourceTree.items.value, itemId)
                const targetItem = targetTree.findItemByUid(targetTree.items.value, itemId)
                
                if (sourceItem) {
                    return sourceDragDrop.wasRecentlyMoved(itemId)
                } else if (targetItem) {
                    return targetDragDrop.wasRecentlyMoved(itemId)
                }
                return false
            },
            isDescendantOf: (sourceId: string, targetId: string) => {
                // Only check within the same namespace
                const sourceInSource = sourceTree.findItemByUid(sourceTree.items.value, sourceId)
                const targetInSource = sourceTree.findItemByUid(sourceTree.items.value, targetId)
                const sourceInTarget = targetTree.findItemByUid(targetTree.items.value, sourceId)
                const targetInTarget = targetTree.findItemByUid(targetTree.items.value, targetId)
                
                // Both items must be in the same namespace for descendant check
                if (sourceInSource && targetInSource) {
                    return sourceDragDrop.isDescendantOf(sourceId, targetId)
                } else if (sourceInTarget && targetInTarget) {
                    return targetDragDrop.isDescendantOf(sourceId, targetId)
                }
                
                // If items are in different namespaces, they can't be descendants
                return false
            }
        }
    }

    return {
        trees,
        dragDropLogics,
        initializeAll,
        updateAllThemes,
        createCrossSafeDragDrop
    }
}