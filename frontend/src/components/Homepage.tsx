import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Tab, Typography, Box, CircularProgress } from '@mui/material';
import { fetchContracts } from '../slices/contractSlice';
import ContractList from './ContractList';
import { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Homepage() {
  const dispatch = useDispatch();
  const [value, setValue] = useState(0);
  const { contracts, categories, loading, error } = useSelector((state: RootState) => state.contracts);

  useEffect(() => {
    dispatch(fetchContracts() as any);
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!categories || categories.length === 0) return <Typography>No categories available.</Typography>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="contract categories">
          {categories.map((category, index) => (
            <Tab label={category} id={`simple-tab-${index}`} key={category} />
          ))}
        </Tabs>
      </Box>
      {categories.map((category, index) => (
        <TabPanel value={value} index={index} key={category}>
          <ContractList contracts={contracts.filter(contract => contract.category === category)} />
        </TabPanel>
      ))}
    </Box>
  );
}

export default Homepage;