export default function isPrimaryPointerButton(event = {}) {
  const button = event.button ?? event.nativeEvent?.button;
  if (button !== undefined) return button === 0;

  const buttons = event.buttons ?? event.nativeEvent?.buttons;
  if (buttons !== undefined) return buttons === 1;

  return true;
}
