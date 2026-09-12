// A preview changes its containing room during a drag. Freeze its layout size
// before reparenting so percentage-based furniture cells cannot resize the art.
export function preserveFurnitureDragSize(source, preview) {
  const style = getComputedStyle(source);
  for (const dimension of ['width', 'height']) {
    preview.style.setProperty(dimension, style[dimension], 'important');
  }
}
