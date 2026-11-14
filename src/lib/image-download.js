// Decode without repainting the PNG, preserving its embedded design metadata.
export function characterImageBlob(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([\s\S]+)$/.exec(String(dataUrl));
  if (!match) throw new Error('保存できる画像データがありません。');
  const bytes = Uint8Array.from(atob(match[2]), char => char.charCodeAt(0));
  return new Blob([bytes], { type: match[1] });
}

export function downloadCharacterImage(dataUrl, filename) {
  const url = URL.createObjectURL(characterImageBlob(dataUrl));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Allow the browser to begin reading before releasing the file URL.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
