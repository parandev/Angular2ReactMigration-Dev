import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface TitleConfig {
  baseName?: string;
  route?: string;
  tab?: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/operations': 'Operations',
  '/maintenance': 'Maintenance',
  '/watchdog': 'Watchdog',
  '/health-metrics': 'Health Metrics',
  '/summary-trend': 'Summary Trend',
  '/signal-info': 'Signal Info',
  '/reports': 'Reports',
  '/contact': 'Contact',
  '/about': 'About',
  '/help': 'Help'
};

export const useDocumentTitle = (config?: TitleConfig) => {
  const location = useLocation();

  useEffect(() => {
    const baseName = config?.baseName || 'SigOpsMetrics';
    const routeName = config?.route || routeLabels[location.pathname] || 'Dashboard';
    const tabName = config?.tab;

    let title = baseName;
    
    if (routeName) {
      title += ` - ${routeName}`;
    }
    
    if (tabName) {
      title += ` - ${tabName}`;
    }

    document.title = title;
  }, [config?.baseName, config?.route, config?.tab, location.pathname]);
};

export default useDocumentTitle; 