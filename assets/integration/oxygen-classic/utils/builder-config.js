export function getSaveActionDetector() {
  return (url, payload) => {
    return url.includes('wp-admin/admin-ajax.php') && payload.action === 'ct_save_post';
  };
}

export function getBuilderSpecificConfig() {
  return { usesXMLHttpRequest: false };
}