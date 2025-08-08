import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, 
    Tabs, 
    Tab, 
    Typography,
    Paper,
    Grid,
    CircularProgress,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField
} from '@mui/material';
import TrafficIcon from '@mui/icons-material/Traffic';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';
import georgiaMap from '../../assets/images/georgia_region_map.png';
import { RootState } from '../../store/store';
import { 
    fetchMaintenanceMetrics, 
    fetchOperationsMetrics, 
    fetchSafetyMetrics, 
    fetchRegionAverages
} from '../../store/slices/metricsSlice';
import { AppDispatch } from '../../store/store';
import { metricsApi } from '../../services/api/metricsApi';
import { FilterParams, MetricData, MetricsFilterRequest } from '../../types/api.types';
import { consoledebug } from '../../utils/debug';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import LocationBarChart from '../charts/LocationBarChart';
import TimeSeriesChart from '../charts/TimeSeriesChart';
import ErrorDisplay from '../ErrorDisplay';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const RegionHeader = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    color: '#fff',
    backgroundColor: color,
    borderRadius: '20px',
    marginBottom: theme.spacing(2)
}));

const StatusCircle = styled(Box)(({ theme, color }) => {
    // Helper function to convert rgb string to rgba with opacity
    const getRgbaColor = (rgbColor: string, opacity: number) => {
        const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const [, r, g, b] = match;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return rgbColor; // fallback to original color if parsing fails
    };

    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(1),
        '& .progress-wrapper': {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            [theme.breakpoints.up('md')]: {
                width: 100,
                height: 100,
            },
            [theme.breakpoints.up('lg')]: {
                width: 120,
                height: 120,
            },
            '& .MuiCircularProgress-root': {
                position: 'absolute',
                '&.outer': {
                    color: color,
                    transform: 'scale(1.4)',
                    '& .MuiCircularProgress-svg': {
                        strokeLinecap: 'round'
                    }
                },
                '&.inner': {
                    color: theme.palette.mode === 'light' 
                        ? getRgbaColor(color as string, 0.25)
                        : getRgbaColor(color as string, 0.5),
                    '& .MuiCircularProgress-svg': {
                        strokeLinecap: 'round'
                    }
                }
            },
            '& .icon': {
                position: 'absolute',
                color: color,
                fontSize: '24px',
                zIndex: 1,
                [theme.breakpoints.up('md')]: {
                    fontSize: '30px',
                },
                [theme.breakpoints.up('lg')]: {
                    fontSize: '36px',
                }
            }
        }
    };
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: '#4285f4',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        padding: theme.spacing(1),
    },
    '&.MuiTableCell-body': {
        padding: theme.spacing(1),
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
}));

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden'
            }}
        >
            {value === index && (
                <Box sx={{ 
                    p: { xs: 1, sm: 2, md: 3 },
                    height: '100%',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const RegionStatus = () => {
    const dispatch = useDispatch<AppDispatch>();
    const regionsState = useSelector((state: RootState) => state.metrics.regions);

    useEffect(() => {
        const currentDate = new Date();
        const yyyy = currentDate.getFullYear();
        const mm = currentDate.getMonth() + 1; // Months start at 0!
        const dd = currentDate.getDate();

        let startMonth;
        let startYear;

        if (dd < 10) {
            // Use previous month
            if (mm === 1) {
                startMonth = 12;
                startYear = yyyy - 1;
            } else {
                startMonth = mm - 1;
                startYear = yyyy;
            }
        } else {
            // Use current month
            startMonth = mm;
            startYear = yyyy;
        }

        // Format the month to ensure two digits
        startMonth = startMonth < 10 ? `0${startMonth}` : startMonth;

        // Format as MM-01-YYYY for the API
        const startDate = `${startMonth}-01-${startYear}`;

        dispatch(fetchRegionAverages(startDate));
    }, [dispatch]);

    // Retry function for error handling
    const retryRegionData = () => {
        const currentDate = new Date();
        const yyyy = currentDate.getFullYear();
        const mm = currentDate.getMonth() + 1;
        const dd = currentDate.getDate();

        let startMonth;
        let startYear;

        if (dd < 10) {
            if (mm === 1) {
                startMonth = 12;
                startYear = yyyy - 1;
            } else {
                startMonth = mm - 1;
                startYear = yyyy;
            }
        } else {
            startMonth = mm;
            startYear = yyyy;
        }

        startMonth = startMonth < 10 ? `0${startMonth}` : startMonth;
        const startDate = `${startMonth}-01-${startYear}`;
        dispatch(fetchRegionAverages(startDate));
    };

    if (regionsState.error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <ErrorDisplay onRetry={retryRegionData} fullHeight />
            </Box>
        );
    }

    if (regionsState.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    const regionsData = [
        { name: 'NORTH', color: '#8BC34A', ...regionsState.north },
        { name: 'SOUTHWEST', color: '#42A5F5', ...regionsState.southwest },
        { name: 'SOUTHEAST', color: '#FFD54F', ...regionsState.southeast },
        { name: 'STATEWIDE', color: '#9E9E9E', ...regionsState.statewide },
        { name: 'WESTERN METRO', color: '#EF5350', ...regionsState.westernMetro },
        { name: 'CENTRAL METRO', color: '#1A237E', ...regionsState.centralMetro },
        { name: 'EASTERN METRO', color: '#546E7A', ...regionsState.easternMetro },
    ];

    const getStatusColor = (percentage: number = 0) => {
        if (percentage >= 75) return 'rgb(120, 192, 0)';
        if (percentage >= 25) return 'rgb(255, 195, 0)';
        return 'rgb(214, 22, 22)';
    };

    const RegionCard = ({ region }: { region: { 
        name: string; 
        color: string; 
        operations?: number; 
        maintenance?: number; 
        safety?: number 
    } }) => {
        const [operationsValue, setOperationsValue] = useState(0);
        const [maintenanceValue, setMaintenanceValue] = useState(0);
        const [safetyValue, setSafetyValue] = useState(0);
        const [circleSize, setCircleSize] = useState({ outer: 80, inner: 60 });

        useEffect(() => {
            const duration = 100;
            const interval = 10;
            const steps = duration / interval;
            
            let step = 0;
            
            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                
                const easeOutQuad = (t: number) => t * (2 - t);
                const easedProgress = easeOutQuad(progress);
                
                setOperationsValue(Math.min(easedProgress * (region?.operations || 0), region?.operations || 0));
                setMaintenanceValue(Math.min(easedProgress * (region?.maintenance || 0), region?.maintenance || 0));
                setSafetyValue(Math.min(easedProgress * (region?.safety || 0), region?.safety || 0));
                
                if (step >= steps) {
                    clearInterval(timer);
                }
            }, interval);
            
            return () => clearInterval(timer);
        }, [region]);

        useEffect(() => {
            const handleResize = () => {
                if (window.matchMedia('(min-width: 1200px)').matches) {
                    setCircleSize({ outer: 120, inner: 90 });
                } else if (window.matchMedia('(min-width: 900px)').matches) {
                    setCircleSize({ outer: 100, inner: 75 });
                } else {
                    setCircleSize({ outer: 80, inner: 60 });
                }
            };

            handleResize();
            
            window.addEventListener('resize', handleResize);
            
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return (
        <Box>
            <RegionHeader color={region?.color}>
                <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem', lg: '1.1rem' } }}>{region?.name}</Typography>
            </RegionHeader>
            <Box display="flex" justifyContent="space-around" mb={2}>
                <StatusCircle color={getStatusColor(region?.operations)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={operationsValue} 
                            size={circleSize.outer}
                            thickness={4}
                        />
                        <CircularProgress 
                            className="inner"
                            variant="determinate" 
                            value={100} 
                            size={circleSize.inner}
                            thickness={3}
                        />
                        <TrafficIcon className="icon" />
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 5,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                backgroundColor: 'rgba(70,70,70,0.9)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                pointerEvents: 'none',
                                '&:hover': {
                                    opacity: 1
                                },
                                '.progress-wrapper:hover &': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="white">
                                {region?.operations?.toFixed(2) || '0.00'}%
                            </Typography>
                        </Box>
                    </div>
                    <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.9rem', lg: '1rem' }, color: 'navy' }}>Operation</Typography>
                </StatusCircle>
                <StatusCircle color={getStatusColor(region?.maintenance)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={maintenanceValue} 
                            size={circleSize.outer}
                            thickness={4}
                        />
                        <CircularProgress 
                            className="inner"
                            variant="determinate" 
                            value={100} 
                            size={circleSize.inner}
                            thickness={3}
                        />
                        <BuildIcon className="icon" />
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 5,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                backgroundColor: 'rgba(70,70,70,0.9)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                pointerEvents: 'none',
                                '&:hover': {
                                    opacity: 1
                                },
                                '.progress-wrapper:hover &': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="white">
                                {region?.maintenance?.toFixed(2) || '0.00'}%
                            </Typography>
                        </Box>
                    </div>
                    <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.9rem', lg: '1rem' }, color: 'navy' }}>Maintenance</Typography>
                </StatusCircle>
                <StatusCircle color={getStatusColor(region?.safety)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={safetyValue} 
                            size={circleSize.outer}
                            thickness={4}
                        />
                        <CircularProgress 
                            className="inner"
                            variant="determinate" 
                            value={100} 
                            size={circleSize.inner}
                            thickness={3}
                        />
                        <EngineeringIcon className="icon" />
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 5,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                backgroundColor: 'rgba(70,70,70,0.9)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                pointerEvents: 'none',
                                '&:hover': {
                                    opacity: 1
                                },
                                '.progress-wrapper:hover &': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="white">
                                {region?.safety?.toFixed(2) || '0.00'}%
                            </Typography>
                        </Box>
                    </div>
                    <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.9rem', lg: '1rem' }, color: 'navy' }}>Safety</Typography>
                </StatusCircle>
            </Box>
        </Box>
    );
    };

    return (
        <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, auto)',
            gap: { xs: 2, sm: 3, md: 4, lg: 5 },
            width: '100%',
            maxWidth: '100%',
            '& .map-container': {
                gridColumn: '2',
                gridRow: '2 / span 2',
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 2,
                minHeight: { xs: 300, sm: 350, md: 400, lg: 450 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }}>
            {/* Column 1 */}
            <RegionCard region={regionsData[0]} /> {/* 1,1 NORTH */}
            <RegionCard region={regionsData[3]} /> {/* 1,2 STATEWIDE */}
            <RegionCard region={regionsData[4]} /> {/* 1,3 WESTERN METRO */}

            {/* Column 2 */}
            <RegionCard region={regionsData[1]} /> {/* 2,1 SOUTHWEST */}
            <Box className="map-container">
                <Box 
                    component="img" 
                    src={georgiaMap} 
                    alt="Georgia Region Map"
                    sx={{
                        maxWidth: '100%',
                        maxHeight: { xs: '250px', sm: '300px', md: '350px', lg: '600px' },
                        objectFit: 'contain'
                    }}
                />
            </Box>

            {/* Column 3 */}
            <RegionCard region={regionsData[5]} /> {/* 3,1 SOUTHEAST */}
            <RegionCard region={regionsData[2]} /> {/* 2,3 CENTRAL METRO */}
            <RegionCard region={regionsData[6]} /> {/* 3,3 EASTERN METRO */}
        </Box>
    );
};

interface MetricsTableProps {
    type: 'Maintenance' | 'Operations' | 'Safety';
}

const MetricsTable = ({ type }: MetricsTableProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [dateRange] = useState<[Date | null, Date | null]>([
        new Date('2025-04-01'),
        new Date('2025-05-01')
    ]);

    const { maintenance, operations, safety } = useSelector((state: RootState) => state.metrics);
    
    useEffect(() => {
        if (!dateRange[0] || !dateRange[1]) return;
        
        const startDate = dateRange[0].toISOString().split('T')[0].replace(/-/g, '-');
        const endDate = dateRange[1].toISOString().split('T')[0].replace(/-/g, '-');
        
        if (type === 'Maintenance' && !maintenance.data.length) {
            dispatch(fetchMaintenanceMetrics({ start: startDate, end: endDate }));
        } else if (type === 'Operations' && !operations.data.length) {
            dispatch(fetchOperationsMetrics({ start: startDate, end: endDate }));
        } else if (type === 'Safety' && !safety.data.length) {
            dispatch(fetchSafetyMetrics({ start: startDate, end: endDate }));
        }
    }, [dispatch, type, dateRange, maintenance.data.length, operations.data.length, safety.data.length]);

    // Retry function for error handling
    const retryTableData = () => {
        if (!dateRange[0] || !dateRange[1]) return;
        
        const startDate = dateRange[0].toISOString().split('T')[0].replace(/-/g, '-');
        const endDate = dateRange[1].toISOString().split('T')[0].replace(/-/g, '-');
        
        if (type === 'Maintenance') {
            dispatch(fetchMaintenanceMetrics({ start: startDate, end: endDate }));
        } else if (type === 'Operations') {
            dispatch(fetchOperationsMetrics({ start: startDate, end: endDate }));
        } else if (type === 'Safety') {
            dispatch(fetchSafetyMetrics({ start: startDate, end: endDate }));
        }
    };

    const getTableData = () => {
        switch (type) {
            case 'Maintenance':
                return maintenance.data.map(item => ({
                    zoneGroup: item.zone_Group,
                    corridor: item.corridor,
                    percentHealth: `${(item['percent Health'] * 100).toFixed(2)}%`,
                    missingData: (item['missing Data'] ?? 0).toFixed(2),
                    detectionUpScore: `${((item['detection Uptime Score'] ?? 0)).toFixed(2)}`,
                    pedActuationScore: `${((item['ped Actuation Uptime Score'] ?? 0)).toFixed(2)}`,
                    commUtilScore: `${((item['comm Uptime Score'] ?? 0)).toFixed(2)}`,
                    cctvUtilScore: `${((item['cctv Uptime Score'] ?? 0)).toFixed(2)}`,
                    flashEventsScore: `${((item['flash Events Score'] ?? 0)).toFixed(2)}`,
                    detectionUp: `${((item['detection Uptime'] ?? 0) * 100).toFixed(2)}%`,
                    pedActuation: `${((item['ped Actuation Uptime'] ?? 0) * 100).toFixed(2)}%`,
                    commUtil: `${((item['comm Uptime'] ?? 0) * 100).toFixed(2)}%`,
                    cctvUtil: `${((item['cctv Uptime'] ?? 0) * 100).toFixed(2)}%`,
                    flashEvents: (item['flash Events'] ?? 0).toFixed(2),
                }));
            case 'Operations':
                return operations.data.map(item => ({
                    zoneGroup: item.zone_Group,
                    corridor: item.corridor,
                    percentHealth: `${(item['percent Health'] * 100).toFixed(2)}%`,
                    missingData: `${((item['missing Data'] ?? 0) * 100).toFixed(2)}%`,
                    platoonRatioScore: `${((item['platoon Ratio Score'] ?? 0)).toFixed(2)}`,
                    pedDelayScore: `${((item['ped Delay Score'] ?? 0)).toFixed(2)}`,
                    splitFailuresScore: `${((item['split Failures Score'] ?? 0)).toFixed(2)}`,
                    travelTimeIndexScore: `${((item['travel Time Index Score'] ?? 0)).toFixed(2)}`,
                    bufferIndexScore: `${((item['buffer Index Score'] ?? 0)).toFixed(2)}`,
                    platoonRatio: `${((item['platoon Ratio'] ?? 0)).toFixed(2)}`,
                    pedDelay: (item['ped Delay'] ?? 0).toFixed(2),
                    splitFailures: (item['split Failures'] ?? 0).toFixed(2),
                    travelTimeIndex: (item['travel Time Index'] ?? 0).toFixed(2),
                    bufferIndex: (item['buffer Index'] ?? 0).toFixed(2),
                }));
            case 'Safety':
                return safety.data.map(item => ({
                    zoneGroup: item.zone_Group,
                    corridor: item.corridor,
                    percentHealth: `${(item['percent Health'] * 100).toFixed(2)}%`,
                    missingData: `${((item['missing Data'] ?? 0) * 100).toFixed(2)}%`,
                    crashRateIndexScore: `${((item['crash Rate Index Score'] ?? 0)).toFixed(2)}`,
                    kabcoCrashSeverityIndexScore: `${((item['kabco Crash Severity Index Score'] ?? 0)).toFixed(2)}`,
                    highSpeedIndexScore: `${((item['high Speed Index Score'] ?? 0)).toFixed(2)}`,
                    pedInjuryExposureIndexScore: `${((item['ped Injury Exposure Index Score'] ?? 0)).toFixed(2)}`,
                    crashRateIndex: (item['crash Rate Index'] ?? 0).toFixed(2),
                    kabcoCrashSeverityIndex: (item['kabco Crash Severity Index'] ?? 0).toFixed(2),
                    highSpeedIndex: (item['high Speed Index'] ?? 0).toFixed(2),
                    pedInjuryExposureIndex: (item['ped Injury Exposure Index'] ?? 0).toFixed(2),
                }));
            default:
                return [];
        }
    };

    const getTableColumns = () => {
        switch (type) {
            case 'Maintenance':
                return [
                    { id: 'zoneGroup', label: 'Zone Group' },
                    { id: 'corridor', label: 'Corridor' },
                    { id: 'percentHealth', label: 'Percent Health' },
                    { id: 'missingData', label: 'Missing Data' },
                    { id: 'detectionUpScore', label: 'Detection Uptime Score' },
                    { id: 'pedActuationScore', label: 'Ped Actuation Uptime Score' },
                    { id: 'commUtilScore', label: 'Comm Uptime Score' },
                    { id: 'cctvUtilScore', label: 'CCTV Uptime Score' },
                    { id: 'flashEventsScore', label: 'Flash Events Score' },
                    { id: 'detectionUp', label: 'Detection Uptime' },
                    { id: 'pedActuation', label: 'Ped Actuation Uptime' },
                    { id: 'commUtil', label: 'Comm Uptime' },
                    { id: 'cctvUtil', label: 'CCTV Uptime' },
                    { id: 'flashEvents', label: 'Flash Events' },
                ];
            case 'Operations':
                return [
                    { id: 'zoneGroup', label: 'Zone Group' },
                    { id: 'corridor', label: 'Corridor' },
                    { id: 'percentHealth', label: 'Percent Health' },
                    { id: 'missingData', label: 'Missing Data' },
                    { id: 'platoonRatioScore', label: 'Platoon Ratio Score' },
                    { id: 'pedDelayScore', label: 'Ped Delay Score' },
                    { id: 'splitFailuresScore', label: 'Split Failures Score' },
                    { id: 'travelTimeIndexScore', label: 'Travel Time Index Score' },
                    { id: 'bufferIndexScore', label: 'Buffer Index Score' },
                    { id: 'platoonRatio', label: 'Platoon Ratio' },
                    { id: 'pedDelay', label: 'Ped Delay' },
                    { id: 'splitFailures', label: 'Split Failures' },
                    { id: 'travelTimeIndex', label: 'Travel Time Index' },
                    { id: 'bufferIndex', label: 'Buffer Index' },
                ];
            case 'Safety':
                return [
                    { id: 'zoneGroup', label: 'Zone Group' },
                    { id: 'corridor', label: 'Corridor' },
                    { id: 'percentHealth', label: 'Percent Health' },
                    { id: 'missingData', label: 'Missing Data' },
                    { id: 'crashRateIndexScore', label: 'Crash Rate Index Score' },
                    { id: 'kabcoCrashSeverityIndexScore', label: 'KABCO Crash Severity Index Score' },
                    { id: 'highSpeedIndexScore', label: 'High Speed Index Score' },
                    { id: 'pedInjuryExposureIndexScore', label: 'Ped Injury Exposure Index Score' },
                    { id: 'crashRateIndex', label: 'Crash Rate Index' },
                    { id: 'kabcoCrashSeverityIndex', label: 'KABCO Crash Severity Index' },
                    { id: 'highSpeedIndex', label: 'High Speed Index' },
                    { id: 'pedInjuryExposureIndex', label: 'Ped Injury Exposure Index' },
                ];
            default:
                return [];
        }
    };

    const data = getTableData();
    const columns = getTableColumns();

    // Filter data based on search inputs
    const filteredData = data.filter(row => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key]?.toLowerCase();
            if (!filterValue) return true;
            
            const cellValue = String(row[key as keyof typeof row] || '').toLowerCase();
            return cellValue.includes(filterValue);
        });
    });

    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
        setPage(0); // Reset to first page when filtering
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isLoading = 
        (type === 'Maintenance' && maintenance.loading) || 
        (type === 'Operations' && operations.loading) || 
        (type === 'Safety' && safety.loading);
    
    const error = 
        (type === 'Maintenance' && maintenance.error) || 
        (type === 'Operations' && operations.error) || 
        (type === 'Safety' && safety.error);

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <ErrorDisplay onRetry={retryTableData} fullHeight />
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '88%',
            width: '100%',
            minWidth: 0, // Allow shrinking below content width
        }}>
            <TableContainer 
                component={Paper} 
                sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    width: '100%',
                    height: '100%',
                    minWidth: 0, // Allow shrinking
                    '& .MuiTable-root': {
                        minWidth: 'max-content',
                        width: '100%'
                    }
                }}
            >
                <Table size="small" stickyHeader sx={{ height: '100%' }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <StyledTableCell key={column.id} sx={{ minWidth: 150, maxWidth: 200 }}>
                                    <TextField 
                                        size="small"
                                        variant="outlined"
                                        label={column.label}
                                        value={filters[column.id] || ''}
                                        onChange={(e) => handleFilterChange(column.id, e.target.value)}
                                        fullWidth
                                        margin="dense"
                                        sx={{ 
                                            mt: 1,
                                            minWidth: 120,
                                            '& .MuiOutlinedInput-root': { 
                                                bgcolor: '#0070ed',
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'white',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'white',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                '&::placeholder': {
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    opacity: 1
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'white',
                                                fontSize: '0.75rem',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                fontWeight: 'bold'
                                            },
                                        }}
                                    />
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => (
                                <StyledTableRow key={index}>
                                    {columns.map((column) => (
                                        <StyledTableCell key={column.id} sx={{ minWidth: 150, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center'}}>
                                            {row[column.id as keyof typeof row]}
                                        </StyledTableCell>
                                    ))}
                                </StyledTableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No results found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ 
                flexShrink: 0,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
        </Box>
    );
};

interface TimeSeriesTrace {
    x: string[];
    y: number[];
    type: string;
    mode: string;
    name: string;
    line: { width: number; color: string };
    marker: { color: string };
    hovertemplate: string;
    text: string[];
    visible: boolean | string;
}

interface LocationBarData {
    x: number[];
    y: string[];
    type: string;
    orientation: string;
    marker: {
        color: string[];
        opacity: number[];
    };
    hovertemplate: string;
}

interface TrendGraphsProps {
    type: 'maintenance' | 'operation' | 'safety';
}

const TrendGraphs: React.FC<TrendGraphsProps> = ({ type }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesTrace[]>([]);
    const [locationBarData, setLocationBarData] = useState<LocationBarData>({
        x: [],
        y: [],
        type: 'bar',
        orientation: 'h',
        marker: { color: [], opacity: [] },
        hovertemplate: ''
    });
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
    const [rawData, setRawData] = useState<MetricData[]>([]);
    const [averageData, setAverageData] = useState<{label: string; avg: number}[]>([]);

    // Create filter params with the specific payload structure from the request
    const filterParams = useMemo((): FilterParams => ({
        dateRange: 4,
        timePeriod: 4,
        customStart: null,
        customEnd: null,
        daysOfWeek: null,
        startTime: null,
        endTime: null,
        zone_Group: "Central Metro",
        zone: null,
        agency: null,
        county: null,
        city: null,
        corridor: null,
        signalId: "",
        priority: "",
        classification: "",
    }), []);

    // Plotly's default color palette for consistent colors
    const getLocationColor = useCallback((index: number) => {
        const colors = [
            '#1f77b4', // blue
            '#ff7f0e', // orange
            '#2ca02c', // green
            '#d62728', // red
            '#9467bd', // purple
            '#8c564b', // brown
            '#e377c2', // pink
            '#7f7f7f', // gray
            '#bcbd22', // yellow-green
            '#17becf'  // cyan
        ];
        return colors[index % colors.length];
    }, []);

    // Create a mapping of locations to colors for time series (consistent across time)
    const getLocationColors = useCallback(() => {
        const uniqueLocations = Array.from(new Set([
            ...rawData.map(item => item.corridor || item.zoneGroup || 'Unknown'),
            ...averageData.map(item => item.label || 'Unknown')
        ])).sort(); // Sort alphabetically to ensure consistent ordering for time series
        
        return Object.fromEntries(uniqueLocations.map((location, index) => [location, getLocationColor(index)]));
    }, [rawData, averageData, getLocationColor]);

    // Get measure code based on type
    const getMeasure = useCallback(() => {
        switch(type) {
            case 'maintenance':
                return 'maint_plot';
            case 'operation':
                return 'ops_plot';
            case 'safety':
                return 'safety_plot';
            default:
                return 'maint_plot';
        }
    }, [type]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const measure = getMeasure();
                const params: MetricsFilterRequest = {
                    source: 'main',
                    measure
                };
                
                // POST request to /metrics/filter for time series data
                const timeSeriesResponse = await metricsApi.getMetricsFilter(params, filterParams);
                
                // POST request to /metrics/average for location bar data
                const averageResponse = await metricsApi.getMetricsAverage({
                    ...params,
                    dashboard: false
                }, filterParams);
                
                consoledebug('Time Series Response:', timeSeriesResponse);
                consoledebug('Average Response:', averageResponse);

                setRawData(timeSeriesResponse || []);
                setAverageData(Array.isArray(averageResponse) ? averageResponse : []);
                
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to fetch trend data');
                console.error('Error fetching trend data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [getMeasure, filterParams]);

    // Retry function for error handling
    const retryTrendData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const measure = getMeasure();
            const params: MetricsFilterRequest = {
                source: 'main',
                measure
            };
            
            // POST request to /metrics/filter for time series data
            const timeSeriesResponse = await metricsApi.getMetricsFilter(params, filterParams);
            
            // POST request to /metrics/average for location bar data
            const averageResponse = await metricsApi.getMetricsAverage({
                ...params,
                dashboard: false
            }, filterParams);
            
            consoledebug('Retry - Time Series Response:', timeSeriesResponse);
            consoledebug('Retry - Average Response:', averageResponse);

            setRawData(timeSeriesResponse || []);
            setAverageData(Array.isArray(averageResponse) ? averageResponse : []);
            
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch trend data');
            console.error('Error retrying trend data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Process data when raw data changes
    useEffect(() => {
        if (!rawData.length && !averageData.length) return;

        // Process location bar data first to determine sorted order
        let sortedData: Array<{location: string, average: number, label: string}> = [];
        
        if (averageData.length) {
            sortedData = [...averageData]
                .map(item => ({
                    location: item.label || 'Unknown',
                    average: item.avg || 0,
                    label: item.label
                }))
                .sort((a, b) => a.average - b.average);
        } else {
            // Fallback to using rawData
            const aggregatedData: Record<string, { sum: number, count: number }> = {};
            
            rawData.forEach(item => {
                const location = item.corridor || item.zoneGroup || 'Unknown';
                
                if (!aggregatedData[location]) {
                    aggregatedData[location] = { sum: 0, count: 0 };
                }
                
                const metricValue = typeof item['percent Health'] === 'string'
                    ? parseFloat(item['percent Health'])
                    : (item['percent Health'] || item.value || 0);
                
                aggregatedData[location].sum += metricValue;
                aggregatedData[location].count += 1;
            });
            
            sortedData = Object.entries(aggregatedData)
                .map(([location, { sum, count }]) => ({
                    location,
                    average: count > 0 ? sum / count : 0,
                    label: location
                }))
                .sort((a, b) => a.average - b.average);
        }

        // Create color mapping based on sorted order (by value) to avoid consecutive same colors
        const sortedLocationColors: Record<string, string> = {};
        sortedData.forEach((item, index) => {
            sortedLocationColors[item.location] = getLocationColor(index);
        });

        // Get all unique locations from both data sources for time series
        const allUniqueLocations = Array.from(new Set([
            ...rawData.map(item => item.corridor || item.zoneGroup || 'Unknown'),
            ...averageData.map(item => item.label || 'Unknown')
        ]));

        // Create comprehensive color mapping: prioritize sorted colors, fill gaps for time series locations
        const locationColors: Record<string, string> = { ...sortedLocationColors };
        let nextColorIndex = sortedData.length; // Start after the sorted data colors
        
        allUniqueLocations.forEach(location => {
            if (!locationColors[location]) {
                locationColors[location] = getLocationColor(nextColorIndex);
                nextColorIndex++;
            }
        });

        // Create location bar data with colors based on sorted position
        const processedLocationBarData = {
            x: sortedData.map(item => item.average),
            y: sortedData.map(item => item.location),
            type: 'bar' as const,
            orientation: 'h' as const,
            marker: {
                color: sortedData.map(item => sortedLocationColors[item.location]),
                opacity: sortedData.map(item => 
                    hoveredLocation ? (item.location === hoveredLocation ? 1 : 0.5) : 1
                )
            },
            hovertemplate: '<b>%{y}</b><br>Value: %{x:.1%}<extra></extra>',
        };

        setLocationBarData(processedLocationBarData);

        // Process time series data
        const groupedData: Record<string, {
            monthYear: string;
            date: Date;
            values: number[];
            count: number;
        }[]> = {};
        
        rawData.forEach(item => {
            const dateStr = item.month || item.timestamp;
            if (!dateStr) return;
            
            const date = new Date(dateStr);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            
            const group = item.zoneGroup || item.corridor || 'Unknown';
            
            if (!groupedData[group]) {
                groupedData[group] = [];
            }
            
            const existingEntry = groupedData[group].find(entry => entry.monthYear === monthYear);
            
            const metricValue = typeof item['percent Health'] === 'string' 
                ? parseFloat(item['percent Health']) 
                : (item['percent Health'] || item.value || 0);
            
            if (existingEntry) {
                existingEntry.values.push(metricValue);
                existingEntry.count += 1;
            } else {
                groupedData[group].push({
                    monthYear,
                    date,
                    values: [metricValue],
                    count: 1
                });
            }
        });

        // Convert to time series format
        const processedTimeSeriesData = Object.entries(groupedData).map(([group, points]) => {
            points.sort((a, b) => a.date.getTime() - b.date.getTime());
            
            return {
                x: points.map(p => p.monthYear),
                y: points.map(p => {
                    const sum = p.values.reduce((acc: number, val: number) => acc + val, 0);
                    return p.count > 0 ? sum / p.count : 0;
                }),
                type: 'scatter',
                mode: 'lines+markers',
                name: group,
                line: { 
                    width: 2,
                    color: locationColors[group]
                },
                marker: {
                    color: locationColors[group]
                },
                hovertemplate: '<b>%{text}</b><br>Date: %{x}<br>Value: %{y:.1%}<extra></extra>',
                text: Array(points.length).fill(group),
                visible: true, // Always show all traces
            };
        });

        setTimeSeriesData(processedTimeSeriesData);
    }, [rawData, averageData, getLocationColors]);

    // Handle bar hover in location chart
    const handleLocationHover = (location: string | null) => {
        console.log('handleLocationHover', location);
        setHoveredLocation(location);
    };
    
    // Helper function for time series chart data - no longer filtering
    const timeSeriesChartData = () => {
        if (!timeSeriesData.length) {
            return [{
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines+markers'
            }];
        }
        
        return timeSeriesData; // Return all data without filtering
    };

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <ErrorDisplay onRetry={retryTrendData} fullHeight />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                    Percent Health
                </Typography>
                <Grid container spacing={2}>
                    {/* Location Bar Chart */}
                    <Grid size={{xs: 12, md: 4}}>
                        <Box sx={{ 
                            height: "500px", 
                            display: "flex", 
                            flexDirection: "column",
                            overflow: "hidden"
                        }}>
                            <LocationBarChart 
                                data={locationBarData}
                                selectedMetric="healthMetrics"
                                onLocationHover={handleLocationHover}
                                height={Math.max(500, (locationBarData.y?.length || 0) * 25)}
                            />
                        </Box>
                    </Grid>

                    {/* Time Series Chart */}
                    <Grid size={{xs: 12, md: 8}}>
                        <TimeSeriesChart 
                            data={timeSeriesChartData()}
                            selectedMetric="healthMetrics"
                            height={500}
                            hoveredLocation={hoveredLocation}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

const HealthMetrics = () => {
    const [tabValue, setTabValue] = useState(0);
    const tabLabels = [
        "Region Status",
        "Maintenance", 
        "Maintenance Trend",
        "Operations",
        "Operation Trend", 
        "Safety",
        "Safety Trend"
    ];
    // Dynamic document title based on selected tab
    useDocumentTitle({
        route: 'Health Metrics',
        tab: tabLabels[tabValue]
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ 
            width: '100%', 
            maxWidth: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'background.paper'
            }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    scrollButtons="auto"
                >
                    <Tab label="Region Status" sx={{ flex: 1 }} />
                    <Tab label="Maintenance" sx={{ flex: 1 }} />
                    <Tab label="Maintenance Trend" sx={{ flex: 1 }} />
                    <Tab label="Operations" sx={{ flex: 1 }} />
                    <Tab label="Operation Trend" sx={{ flex: 1 }} />
                    <Tab label="Safety" sx={{ flex: 1 }} />
                    <Tab label="Safety Trend" sx={{ flex: 1 }} />
                </Tabs>
            </Box>
            <Box sx={{ 
                flex: 1,
                overflow: 'hidden',
                position: 'relative'
            }}>
                <TabPanel value={tabValue} index={0}>
                    <RegionStatus />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <MetricsTable type="Maintenance" />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <TrendGraphs type="maintenance" />
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                    <MetricsTable type="Operations" />
                </TabPanel>
                <TabPanel value={tabValue} index={4}>
                    <TrendGraphs type="operation" />
                </TabPanel>
                <TabPanel value={tabValue} index={5}>
                    <MetricsTable type="Safety" />
                </TabPanel>
                <TabPanel value={tabValue} index={6}>
                    <TrendGraphs type="safety" />
                </TabPanel>
            </Box>
        </Box>
    );
};

export default HealthMetrics;