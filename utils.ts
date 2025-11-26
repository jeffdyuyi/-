
import { SavedCard } from './types';

export const downloadCardImage = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const xmlns = "http://www.w3.org/2000/svg";
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  
  const style = window.getComputedStyle(element);
  
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());
  
  const foreignObject = document.createElementNS(xmlns, "foreignObject");
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");
  
  const xml = new XMLSerializer().serializeToString(element);
  foreignObject.innerHTML = xml;
  
  svg.appendChild(foreignObject);
  
  const svgString = new XMLSerializer().serializeToString(svg);
  const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
  const imageSource = `data:image/svg+xml;base64,${base64Svg}`;
  
  const img = new Image();
  img.src = imageSource;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * 2; // 2x Scale for better quality
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    }
  };
};

export const copyCode = (data: any) => {
  const code = JSON.stringify(data);
  navigator.clipboard.writeText(code).then(() => {
    alert("卡牌代码已复制到剪贴板！");
  });
};

export const loadCode = (code: string): any | null => {
  try {
    return JSON.parse(code);
  } catch (e) {
    alert("无效的代码格式");
    return null;
  }
};

// --- Local Storage & Library Utils ---

const STORAGE_KEY = 'shadow_era_library_v1';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const saveCardToLibrary = (card: SavedCard) => {
  const library = loadLibrary();
  const existingIndex = library.findIndex(c => c.id === card.id);
  
  if (existingIndex >= 0) {
    library[existingIndex] = card;
  } else {
    library.unshift(card); // Add to top
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  return library;
};

export const loadLibrary = (): SavedCard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load library", e);
    return [];
  }
};

export const removeCardFromLibrary = (id: string) => {
  const library = loadLibrary();
  const newLibrary = library.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
  return newLibrary;
};
