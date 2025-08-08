import React, { useEffect, useState } from 'react';
import { Grid, Box, CircularProgress, Typography, Container, Paper } from '@mui/material';
import LineGraph from '../LineGraph';
import { Graph } from '../../utils/graph';
import { Metrics } from '../../utils/metrics';
import { Colors } from '../../utils/colors';
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector';
import { fetchSummaryTrends } from '../../store/slices/summaryTrendSlice';
import { FilterParams } from '../../types/api.types';
import AppConfig from '../../utils/appConfig';
import { useSelector } from 'react-redux';
import { selectFilterParams } from '../../store/slices/filterSlice';
import { RootState } from '../../store/store';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import ErrorDisplay from '../ErrorDisplay';

const SummaryTrend: React.FC = () => {
  useDocumentTitle();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.summaryTrend);
  
  // Strings for metric names that may change based on time period
  const [aogString, setAogString] = useState('aogd');
  const [prString, setPrString] = useState('prd');
  const [qsString, setQsString] = useState('qsd');
  const [sfString, setSfString] = useState('sfd');
  const [vpString, setVpString] = useState('vpd');
  const [papString, setPapString] = useState('papd');
  const commonFilterParams = useSelector(selectFilterParams);
  const filtersApplied = useSelector((state: RootState) => state.filter.filtersApplied);

  
  const colors = new Colors();
  
  // Define metrics and graph configurations
  // Performance metrics
  const tpGraphMetrics = new Metrics({
    measure: "tp",
    label: "Throughput"
  });
  const tpGraph: Graph = {
    x: "month",
    y: "vph",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const tpTitle = "Throughput";

  const aogGraphMetrics = new Metrics({
    measure: "aogd",
    formatDecimals: 1,
    formatType: "percent",
    label: "Arrivals on Green"
  });
  const aogGraph: Graph = {
    x: "month",
    y: "aog",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const aogTitle = "Arrivals on Green";

  const prdGraphMetrics = new Metrics({
    measure: "prd",
    formatDecimals: 2,
    label: "Progression Ratio"
  });
  const prdGraph: Graph = {
    x: "month",
    y: "pr",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const prdTitle = "Progression Ratio";

  const qsdGraphMetrics = new Metrics({
    measure: "qsd",
    formatDecimals: 1,
    formatType: "percent",
    label: "Queue Spillback"
  });
  const qsdGraph: Graph = {
    x: "month",
    y: "qs_freq",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const qsdTitle = "Queue Spillback";

  const sfdTitle = "Peak Period Split Failure";
  const sfdGraphMetrics = new Metrics({
    measure: "sfd",
    formatDecimals: 1,
    formatType: "percent",
    label: "Peak Period Split Failure"
  });
  const sfGraph: Graph = {
    x: "month",
    y: "sf_freq",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };

  const sfoTitle = "Off-Peak Split Failure";
  const sfoGraphMetrics = new Metrics({
    measure: "sfo",
    formatDecimals: 1,
    formatType: "percent",
    label: "Off-Peak Split Failure"
  });

  const ttiTitle = "Travel Time Index";
  const ttiGraphMetrics = new Metrics({
    measure: "tti",
    formatDecimals: 2,
    label: "Travel Time Index",
    goal: AppConfig.ttiGoal
  });
  const ttiGraph: Graph = {
    x: "month",
    y: "tti",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };

  const ptiTitle = "Planning Time Index";
  const ptiGraphMetrics = new Metrics({
    measure: "pti",
    formatDecimals: 2,
    label: "Planning Time Index",
    goal: AppConfig.ptiGoal
  });
  const ptiGraph: Graph = {
    x: "month",
    y: "pti",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };

  // Volume and Equipment metrics
  const dtvTitle = "Daily Volume";
  const dtvGraphMetrics = new Metrics({
    measure: "vpd",
    label: "Daily Volume"
  });
  const dtvGraph: Graph = {
    x: "month",
    y: "vpd",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const amvTitle = "AM Hourly Volume";
  const amvGraphMetrics = new Metrics({
    measure: "vphpa",
    label: "AM Hourly Volume"
  });
  const amvGraph: Graph = {
    x: "month",
    y: "vph",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const pmvTitle = "PM Hourly Volume";
  const pmvGraphMetrics = new Metrics({
    measure: "vphpp",
    label: "PM Hourly Volume"
  });
  const pmvGraph: Graph = {
    x: "month",
    y: "vph",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const paTitle = "Pedestrian Activations";
  const paGraphMetrics = new Metrics({
    measure: "papd",
    label: "Pedestrian Activations"
  });
  const paGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const duTitle = "Detector Uptime";
  const duGraphMetrics = new Metrics({
    measure: "du",
    formatDecimals: 1,
    formatType: "percent",
    label: "Detector Uptime",
    goal: AppConfig.duGoal
  });
  const duGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  const pauTitle = "Ped Pushbutton Uptime";
  const pauGraphMetrics = new Metrics({
    measure: "pau",
    formatDecimals: 1,
    formatType: "percent",
    label: "Ped Pushbutton Uptime",
    goal: AppConfig.ppuGoal
  });
  const pauGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  const cctvTitle = "CCTV Uptime";
  const cctvGraphMetrics = new Metrics({
    measure: "cctv",
    formatDecimals: 1,
    formatType: "percent",
    label: "CCTV Uptime",
    goal: AppConfig.cctvGoal
  });
  const cctvGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  const cuTitle = "Comm Uptime";
  const cuGraphMetrics = new Metrics({
    measure: "cu",
    formatDecimals: 1,
    formatType: "percent",
    label: "Comm Uptime",
    goal: AppConfig.cuGoal
  });
  const cuGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  // Function to update metric strings based on time period
  const setHourlyStrings = (filter: FilterParams) => {
    if (filter?.timePeriod === 1 || filter?.timePeriod === 0) {
      // update to hourly
      setAogString('aogh');
      setPrString('prh');
      setQsString('qsh');
      setSfString('sfh');
      setVpString('vph');
      setPapString('paph');
    } else {
      setAogString('aogd');
      setPrString('prd');
      setQsString('qsd');
      setSfString('sfd');
      setVpString('vpd');
      setPapString('papd');
    }
  };

  useEffect(() => {
    // Fetch summary trends data when filter changes
    dispatch(fetchSummaryTrends(commonFilterParams));
    setHourlyStrings(commonFilterParams);
  }, [filtersApplied]);

  // Retry function for error handling
  const retryData = () => {
    dispatch(fetchSummaryTrends(commonFilterParams));
  };

  return (
    <Container maxWidth={false}>
      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>Performance</Typography>
            {error ? (
              <ErrorDisplay onRetry={retryData} height="400px" />
            ) : loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            ) : data ? (
              <>
                <LineGraph 
                  data={data.tp} 
                  title={tpTitle}
                  graph={tpGraph}
                  metrics={tpGraphMetrics}
                />
                
                <LineGraph 
                  data={data[aogString]} 
                  title={aogTitle}
                  graph={aogGraph}
                  metrics={aogGraphMetrics}
                />
                
                <LineGraph 
                  data={data[prString]} 
                  title={prdTitle}
                  graph={prdGraph}
                  metrics={prdGraphMetrics}
                />
                
                <LineGraph 
                  data={data[qsString]} 
                  title={qsdTitle}
                  graph={qsdGraph}
                  metrics={qsdGraphMetrics}
                />
                
                <LineGraph 
                  data={data[sfString]} 
                  title={sfdTitle}
                  graph={sfGraph}
                  metrics={sfdGraphMetrics}
                />
                
                <LineGraph 
                  data={data.sfo} 
                  title={sfoTitle}
                  graph={sfGraph}
                  metrics={sfoGraphMetrics}
                />
                
                <LineGraph 
                  data={data.tti} 
                  title={ttiTitle}
                  graph={ttiGraph}
                  metrics={ttiGraphMetrics}
                />
                
                <LineGraph 
                  data={data.pti} 
                  title={ptiTitle}
                  graph={ptiGraph}
                  metrics={ptiGraphMetrics}
                />
              </>
            ) : null}
          </Paper>
        </Grid>
        
        <Grid size={{xs: 12, md: 6}}>
          <Paper sx={{ p: 3, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Volumes and Equipment</Typography>
            {error ? (
              <ErrorDisplay onRetry={retryData} height="400px" />
            ) : loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            ) : data ? (
              <>
                <LineGraph 
                  data={data[vpString]} 
                  title={dtvTitle}
                  graph={dtvGraph}
                  metrics={dtvGraphMetrics}
                />
                
                <LineGraph 
                  data={data.vphpa} 
                  title={amvTitle}
                  graph={amvGraph}
                  metrics={amvGraphMetrics}
                />
                
                <LineGraph 
                  data={data.vphpp} 
                  title={pmvTitle}
                  graph={pmvGraph}
                  metrics={pmvGraphMetrics}
                />
                
                <LineGraph 
                  data={data[papString]} 
                  title={paTitle}
                  graph={paGraph}
                  metrics={paGraphMetrics}
                />
                
                <LineGraph 
                  data={data.du} 
                  title={duTitle}
                  graph={duGraph}
                  metrics={duGraphMetrics}
                />
                
                <LineGraph 
                  data={data.pau} 
                  title={pauTitle}
                  graph={pauGraph}
                  metrics={pauGraphMetrics}
                />
                
                <LineGraph 
                  data={data.cctv} 
                  title={cctvTitle}
                  graph={cctvGraph}
                  metrics={cctvGraphMetrics}
                />
                
                <LineGraph 
                  data={data.cu} 
                  title={cuTitle}
                  graph={cuGraph}
                  metrics={cuGraphMetrics}
                />
              </>
            ) : null}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SummaryTrend;