/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChartDataItem, ChartConfig } from './types';

/**
 * Parses raw text inputs into a structured ChartDataItem array
 */
export function parseChartData(labelsStr: string, valuesStr: string): ChartDataItem[] {
  // Split by comma or newline
  const labels = labelsStr
    .split(/,|\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const values = valuesStr
    .split(/,|\n/)
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .map(v => {
      const num = parseFloat(v);
      return isNaN(num) ? 0 : num;
    });

  const length = Math.min(labels.length, values.length);
  const data: ChartDataItem[] = [];

  for (let i = 0; i < length; i++) {
    data.push({
      label: labels[i],
      value: values[i],
    });
  }

  return data;
}

/**
 * Validates the inputs and returns error/warning messages if any
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  labelsCount: number;
  valuesCount: number;
}

export function validateChartData(labelsStr: string, valuesStr: string): ValidationResult {
  const labels = labelsStr
    .split(/,|\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const rawValues = valuesStr
    .split(/,|\n/)
    .map(v => v.trim())
    .filter(v => v.length > 0);

  const valuesCount = rawValues.length;
  const labelsCount = labels.length;

  if (labelsCount === 0 && valuesCount === 0) {
    return {
      isValid: false,
      error: 'Ingresa algunas categorías y valores numéricos para comenzar.',
      labelsCount,
      valuesCount,
    };
  }

  // Validate that all values are actual numbers
  const hasInvalidNumber = rawValues.some(v => {
    const num = parseFloat(v);
    return isNaN(num);
  });

  if (hasInvalidNumber) {
    return {
      isValid: false,
      error: 'Uno o más valores no son números válidos. Por favor, revisa tus datos.',
      labelsCount,
      valuesCount,
    };
  }

  if (labelsCount !== valuesCount) {
    return {
      isValid: true, // we still parse up to the minimum length
      warning: `El número de categorías (${labelsCount}) no coincide con el número de valores (${valuesCount}). Se mostrarán los primeros ${Math.min(labelsCount, valuesCount)} elementos.`,
      labelsCount,
      valuesCount,
    };
  }

  return {
    isValid: true,
    labelsCount,
    valuesCount,
  };
}

/**
 * Downloads a string content as a file
 */
export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers SVG/PNG export from a DOM SVG element
 */
export function exportChart(
  svgSelector: string,
  filename: string,
  type: 'png' | 'svg',
  chartTitle: string,
  backgroundColor: string = '#090d16' // slate-950 equivalent for isolated export background
) {
  const svgElement = document.querySelector(svgSelector) as SVGElement | null;
  if (!svgElement) {
    console.error('Chart SVG element not found');
    return;
  }

  // Clone the SVG so we don't mutate the live DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Set dimensions and style attributes on the cloned SVG for stand-alone correctness
  const width = svgElement.clientWidth || 800;
  const height = svgElement.clientHeight || 500;
  
  clonedSvg.setAttribute('width', width.toString());
  clonedSvg.setAttribute('height', height.toString());
  clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  // Apply direct styles for standard typography rendering offline
  clonedSvg.style.backgroundColor = backgroundColor;
  clonedSvg.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
  clonedSvg.style.color = '#cbd5e1'; // slate-300

  // Standard SVG XML serialization
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);

  // Add the proper namespaces if they are missing
  if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!svgString.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  if (type === 'svg') {
    downloadFile(svgString, `${filename}.svg`, 'image/svg+xml;charset=utf-8');
  } else {
    // PNG Export via Canvas
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // Double size for Retina/High-res export quality!
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High-quality rendering
        ctx.scale(2, 2);
        
        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Export data URL
        try {
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${filename}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (e) {
          console.error('Error generating PNG data URL:', e);
        }
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = (err) => {
      console.error('Error loading SVG into Image for PNG conversion:', err);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }
}
