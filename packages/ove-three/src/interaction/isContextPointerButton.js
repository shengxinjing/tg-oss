export default function isContextPointerButton(event = {}) {
  const button = event.button ?? event.nativeEvent?.button;
  if (button !== undefined) return button === 2;

  const buttons = event.buttons ?? event.nativeEvent?.buttons;
  if (buttons !== undefined) return buttons === 2;

  return false;
}
