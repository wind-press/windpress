export function getSaveActionDetector() {
  return (_url, payload) => {
    // For Bricks, payload comes from response.data in XMLHttpRequest
    return payload && payload.action === 'bricks_save_post';
  };
}

export function getBuilderSpecificConfig() {
  return { usesXMLHttpRequest: true };
}