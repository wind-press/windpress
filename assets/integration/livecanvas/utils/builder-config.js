export function getSaveActionDetector() {
  return (url, payload) => {
    return url.includes('wp-admin/admin-ajax.php') && payload.action === 'livecanvas_save_post';
  };
}

export function getBuilderSpecificConfig() {
  return { usesXMLHttpRequest: false };
}