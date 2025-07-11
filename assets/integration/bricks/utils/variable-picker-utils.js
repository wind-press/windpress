export function createBricksActiveElementGetter(brxGlobalProp) {
  return () => {
    if (brxGlobalProp.$_state.activePanel !== "element") {
      return null;
    }
    const activeElementId = brxGlobalProp.$_state?.activeElement.id;
    const iframe = brxGlobalProp.$_getIframeDoc();
    return iframe?.getElementById(`brxe-${activeElementId}`);
  };
}