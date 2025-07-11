export function getSaveActionDetector() {
  return (url, payload) => {
    return new URL(url).searchParams.get('_breakdance_doing_ajax') === 'yes' && payload.action === 'breakdance_save';
  };
}

export function getBuilderSpecificConfig() {
  return { usesXMLHttpRequest: false };
}