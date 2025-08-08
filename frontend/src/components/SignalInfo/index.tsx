import { 
    Box, 
    Button, 
    TextField, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    TablePagination,
    Paper,
    Typography,
    CircularProgress,
    styled
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAllSignals } from "../../store/slices/metricsSlice"
import { consoledebug } from "../../utils/debug";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { RootState, AppDispatch } from "../../store/store";
import ErrorDisplay from "../ErrorDisplay";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: '#4285f4',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        padding: theme.spacing(1),
    },
    '&.MuiTableCell-body': {
        padding: theme.spacing(1),
        height: 56, // Fixed height for body cells
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    height: 56, // Fixed height for all rows
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export default function SignalInfo() {
    useDocumentTitle();
    const dispatch = useDispatch<AppDispatch>();
    const signals = useSelector((state: RootState) => state.metrics.signals);
    const loading = useSelector((state: RootState) => state.metrics.loading);
    const error = useSelector((state: RootState) => state.metrics.error);
    consoledebug('allSignals in SignalInfo:', signals);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        dispatch(fetchAllSignals());
    }, [dispatch]);

    // Retry function for error handling
    const retryData = () => {
        dispatch(fetchAllSignals());
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
        setPage(0); // Reset to first page when filtering
    };

    const columns = [
        { id: 'signalID', label: 'Signal ID' },
        { id: 'zoneGroup', label: 'Zone Group' },
        { id: 'zone', label: 'Zone' },
        { id: 'corridor', label: 'Corridor' },
        { id: 'subcorridor', label: 'Subcorridor' },
        { id: 'agency', label: 'Agency' },
        { id: 'mainStreetName', label: 'Main Street Name' },
        { id: 'sideStreetName', label: 'Side Street Name' },
        { id: 'milepost', label: 'Milepost' },
        { 
            id: 'asOf', 
            label: 'As Of',
            format: (value: string) => value ? new Date(value).toISOString().split('T')[0] : ''
        },
        { id: 'duplicate', label: 'Duplicate' },
        { id: 'include', label: 'Include' },
        { 
            id: 'modified', 
            label: 'Modified',
            format: (value: string) => value ? new Date(value).toISOString().split('T')[0] : ''
        },
        { id: 'note', label: 'Note' },
        { id: 'latitude', label: 'Latitude' },
        { id: 'longitude', label: 'Longitude' },
        { id: 'county', label: 'County' },
        { id: 'city', label: 'City' },
        { id: 'priority', label: 'Priority' },
        { id: 'classification', label: 'Classification' },
    ];

    // Filter data based on search inputs
    const filteredData = signals.filter(signal => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key]?.toLowerCase();
            if (!filterValue) return true;
            
            const cellValue = String(signal[key as keyof typeof signal] || '').toLowerCase();
            return cellValue.includes(filterValue);
        });
    });

    return (
        <>
        {/* <Paper sx={{ width: '100%', overflow: 'hidden' }}> */}
        {error ? (
            <Paper sx={{ height: '80vh', display: 'flex' }}>
                <ErrorDisplay onRetry={retryData} fullHeight />
            </Paper>
        ) : loading ? (
            <Paper sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress />
                    <Typography>Loading signals...</Typography>
                </Box>
            </Paper>
        ) : (
            <TableContainer component={Paper} sx={{ height: '80vh' }}>
                <Table stickyHeader aria-label="sticky table" sx={{ height: '100%' }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <StyledTableCell key={column.id} style={{ minWidth: 150 }}>
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
                            .map((signal, index) => (
                                <StyledTableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    {columns.map((column) => {
                                        const value = signal[column.id as keyof typeof signal];
                                        return (
                                            <StyledTableCell key={column.id} style={{ minWidth: 150, textAlign: 'center' }}>
                                                {column.format && typeof value === 'string'
                                                    ? column.format(value)
                                                    : value}
                                            </StyledTableCell>
                                        );
                                    })}
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
        )}
            
        {/* Pagination and Export Section - Only show when data is loaded */}
        {!error && !loading && (
            <Box sx={{ 
                display: 'flex',
                position: 'absolute',
                justifyContent: 'space-between',
                maxWidth: '100vw',
                width: '-webkit-fill-available',
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
            }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#2196f3",
                        textTransform: "none",
                        borderRadius: 1,
                        boxShadow: 1,
                    }}
                >
                    Export To Excel
                </Button>
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
        )}
        </>
    );
};