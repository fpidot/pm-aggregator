import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Contract } from '../types';

interface ContractListProps {
  contracts: Contract[];
}

function ContractList({ contracts }: ContractListProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="contract table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="right">Current Price</TableCell>
            <TableCell align="right">24h Change</TableCell>
            <TableCell align="right">1h Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract._id}>
              <TableCell component="th" scope="row">
                {contract.title}
              </TableCell>
              <TableCell align="right">{contract.currentPrice}</TableCell>
              <TableCell align="right">{calculateChange(contract, '24h')}</TableCell>
              <TableCell align="right">{calculateChange(contract, '1h')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function calculateChange(contract: Contract, period: '24h' | '1h'): string {
  // Implement logic to calculate price change
  // This will depend on how you store price history
  return '0%'; // Placeholder
}

export default ContractList;