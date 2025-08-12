import { Layout } from 'plotly.js';

export interface PlotlyThemeConfig {
  layout: Partial<Layout>;
  config: any;
}

export const getPlotlyTheme = (isDark: boolean): PlotlyThemeConfig => {
  const baseColors = {
    background: isDark ? '#121212' : '#ffffff',
    paper: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#ffffff' : '#333333',
    textSecondary: isDark ? '#b3b3b3' : '#666666',
    grid: isDark ? '#333333' : '#e0e0e0',
    border: isDark ? '#333333' : '#e0e0e0',
  };

  return {
    layout: {
      plot_bgcolor: baseColors.background,
      paper_bgcolor: baseColors.paper,
      font: {
        color: baseColors.text,
        family: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      colorway: isDark 
        ? [
            '#90caf9', '#f48fb1', '#a5d6a7', '#ffcc02', '#ff8a65',
            '#ce93d8', '#80deea', '#c5e1a5', '#ffab91', '#f8bbd9'
          ]
        : [
            '#1976d2', '#dc004e', '#388e3c', '#f57c00', '#d32f2f',
            '#7b1fa2', '#0097a7', '#689f38', '#f9a825', '#c2185b'
          ],
      xaxis: {
        gridcolor: baseColors.grid,
        linecolor: baseColors.border,
        tickcolor: baseColors.border,
        zerolinecolor: baseColors.grid,
        color: baseColors.text,
      },
      yaxis: {
        gridcolor: baseColors.grid,
        linecolor: baseColors.border,
        tickcolor: baseColors.border,
        zerolinecolor: baseColors.grid,
        color: baseColors.text,
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        bordercolor: baseColors.border,
        font: {
          color: baseColors.text,
        },
      },
      hoverlabel: {
        bgcolor: isDark ? '#333333' : '#ffffff',
        bordercolor: baseColors.border,
        font: {
          color: baseColors.text,
        },
      },
    },
    config: {
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      responsive: true,
      toImageButtonOptions: {
        format: 'png',
        filename: 'chart',
        height: 500,
        width: 700,
        scale: 1,
      },
    },
  };
};

export const mergeWithPlotlyTheme = (
  customLayout: Partial<Layout>, 
  customConfig: any = {},
  isDark: boolean
): PlotlyThemeConfig => {
  const theme = getPlotlyTheme(isDark);
  
  return {
    layout: {
      ...theme.layout,
      ...customLayout,
      // Merge xaxis and yaxis properly
      xaxis: {
        ...theme.layout.xaxis,
        ...customLayout.xaxis,
      },
      yaxis: {
        ...theme.layout.yaxis,
        ...customLayout.yaxis,
      },
      legend: {
        ...theme.layout.legend,
        ...customLayout.legend,
      },
    },
    config: {
      ...theme.config,
      ...customConfig,
    },
  };
};
