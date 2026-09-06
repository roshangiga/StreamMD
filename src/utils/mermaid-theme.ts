export type MermaidThemeVariables = Record<string, string | boolean>

const darkMermaidSvgOverrideCSS = `
  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: #2a2f34 !important;
    stroke: #7a8590 !important;
    stroke-width: 1.4px !important;
  }

  .node .label,
  .node .label span,
  .node .label p,
  .nodeLabel,
  .nodeLabel p,
  .label,
  .label text,
  foreignObject,
  foreignObject div,
  foreignObject span,
  foreignObject p {
    color: #eef2f6 !important;
    fill: #eef2f6 !important;
  }

  .node .label text,
  .nodeLabel text,
  text.nodeLabel {
    fill: #eef2f6 !important;
  }

  .flowchart-link,
  .edgePath .path,
  .edge-thickness-normal {
    stroke: #969fa9 !important;
  }

  .edgeLabel,
  .edgeLabel p,
  .edgeLabel rect,
  .labelBkg,
  .labelBox {
    background-color: #303438 !important;
    fill: #303438 !important;
  }

  .edgeLabel,
  .edgeLabel p {
    color: #eef2f6 !important;
    fill: #eef2f6 !important;
  }

  marker path,
  .arrowheadPath {
    fill: #969fa9 !important;
    stroke: #969fa9 !important;
  }
`

const darkNodeFill = '#24282e'
const darkNodeStroke = '#84909c'
const darkText = '#f0f3f7'
const darkLine = '#9aa3ad'
const darkLabelFill = '#2d3238'

const compactMermaidThemeCSS = `
  .nodeLabel,
  .nodeLabel p,
  .edgeLabel,
  .edgeLabel p,
  foreignObject div,
  foreignObject span,
  foreignObject p {
    margin: 0 !important;
    padding: 0 !important;
    font-family: 'Open Sans', sans-serif !important;
    font-size: 14px !important;
    line-height: 1.25 !important;
  }
`

export function getMermaidSvgOverrideCSS(isDark: boolean): string {
  return isDark ? darkMermaidSvgOverrideCSS : ''
}

export function applyMermaidSvgTheme(svg: string, isDark: boolean): string {
  const overrideCSS = getMermaidSvgOverrideCSS(isDark)
  if (!overrideCSS) return svg

  return svg.replace('</svg>', `<style>${overrideCSS}</style></svg>`)
}

export function applyMermaidSvgElementTheme(root: ParentNode, isDark: boolean) {
  if (!isDark) return

  root
    .querySelectorAll<SVGElement>('.node rect, .node circle, .node ellipse, .node polygon, .node path')
    .forEach((shape) => {
      shape.style.setProperty('fill', darkNodeFill, 'important')
      shape.style.setProperty('stroke', darkNodeStroke, 'important')
      shape.style.setProperty('stroke-width', '1.35px', 'important')
    })

  root
    .querySelectorAll<SVGElement>('.flowchart-link, .edgePath .path, .arrowheadPath, marker path')
    .forEach((line) => {
      line.style.setProperty('stroke', darkLine, 'important')
      line.style.setProperty('fill', line.classList.contains('arrowheadPath') ? darkLine : 'none', 'important')
    })

  root
    .querySelectorAll<SVGElement>('marker path, .arrowheadPath')
    .forEach((marker) => {
      marker.style.setProperty('fill', darkLine, 'important')
      marker.style.setProperty('stroke', darkLine, 'important')
    })

  root
    .querySelectorAll<SVGElement>('.edgeLabel rect, .labelBkg, .labelBox')
    .forEach((labelBox) => {
      labelBox.style.setProperty('fill', darkLabelFill, 'important')
      labelBox.style.setProperty('background-color', darkLabelFill, 'important')
      labelBox.style.setProperty('opacity', '1', 'important')
    })

  root
    .querySelectorAll<SVGElement>('text, .nodeLabel, .nodeLabel *, .edgeLabel, .edgeLabel *, .label, .label *')
    .forEach((label) => {
      label.style.setProperty('color', darkText, 'important')
      label.style.setProperty('fill', darkText, 'important')
      label.style.setProperty('opacity', '1', 'important')
    })

  root
    .querySelectorAll<HTMLElement>('foreignObject div, foreignObject span, foreignObject p')
    .forEach((label) => {
      label.style.setProperty('color', darkText, 'important')
      label.style.setProperty('background', 'transparent', 'important')
      label.style.setProperty('opacity', '1', 'important')
    })
}

export function getMermaidThemeVariables(isDark: boolean): MermaidThemeVariables {
  if (isDark) {
    return {
      darkMode: true,
      background: '#18191b',
      mainBkg: darkNodeFill,
      primaryColor: darkNodeFill,
      primaryTextColor: darkText,
      primaryBorderColor: darkNodeStroke,
      secondaryColor: '#272d33',
      secondaryTextColor: darkText,
      secondaryBorderColor: darkNodeStroke,
      tertiaryColor: '#2c2f36',
      tertiaryTextColor: darkText,
      tertiaryBorderColor: darkNodeStroke,
      nodeTextColor: darkText,
      textColor: darkText,
      lineColor: darkLine,
      defaultLinkColor: darkLine,
      edgeLabelBackground: darkLabelFill,
      noteBkgColor: '#2f3028',
      noteTextColor: '#e0dfd1',
      noteBorderColor: '#777052',
      clusterBkg: '#202326',
      clusterBorder: '#4f5862',
      titleColor: '#d8dde5'
    }
  }

  return {
    darkMode: false,
    background: '#ffffff',
    mainBkg: '#f6f8fb',
    primaryColor: '#f6f8fb',
    primaryTextColor: '#27313b',
    primaryBorderColor: '#8a96a3',
    secondaryColor: '#eef4f8',
    secondaryTextColor: '#27313b',
    secondaryBorderColor: '#7e92a5',
    tertiaryColor: '#f7f1f5',
    tertiaryTextColor: '#27313b',
    tertiaryBorderColor: '#9b8894',
    nodeTextColor: '#27313b',
    textColor: '#27313b',
    lineColor: '#5f6b78',
    defaultLinkColor: '#5f6b78',
    edgeLabelBackground: '#ffffff',
    noteBkgColor: '#fff7d6',
    noteTextColor: '#3c351f',
    noteBorderColor: '#b7a45e',
    clusterBkg: '#f3f6f9',
    clusterBorder: '#b5bec8',
    titleColor: '#27313b'
  }
}

export function getMermaidThemeConfig(isDark: boolean) {
  return {
    theme: 'base' as const,
    themeCSS: compactMermaidThemeCSS,
    fontFamily: 'Open Sans, sans-serif',
    fontSize: 14,
    flowchart: {
      diagramPadding: 8,
      nodeSpacing: 28,
      rankSpacing: 32,
      padding: 10
    },
    themeVariables: getMermaidThemeVariables(isDark)
  }
}
