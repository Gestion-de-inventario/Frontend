/**
 * Convierte el texto del asistente en HTML seguro: se escapan todos los caracteres
 * especiales y solo se permite **negrita**. Angular además sanitiza el resultado.
 */
export function formatChatText(text: string): string {
  const escaped = (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
