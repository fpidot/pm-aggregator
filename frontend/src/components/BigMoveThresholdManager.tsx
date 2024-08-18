// BigMoveThresholdManager.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBigMoveThreshold, updateDefaultBigMoveThreshold } from '../slices/adminSlice';

const BigMoveThresholdManager: React.FC = () => {
  const dispatch = useDispatch();
  const { categories, bigMoveThresholds, defaultBigMoveThreshold } = useSelector((state: RootState) => state.admin);

  const handleUpdateThreshold = (category: string, threshold: number) => {
    dispatch(updateBigMoveThreshold({ category, threshold }));
  };

  const handleUpdateDefaultThreshold = (threshold: number) => {
    dispatch(updateDefaultBigMoveThreshold(threshold));
  };

  return (
    <div>
      <h2>Manage Big Move Thresholds</h2>
      <div>
        <label>Default Threshold:</label>
        <input
          type="number"
          value={defaultBigMoveThreshold}
          onChange={(e) => handleUpdateDefaultThreshold(parseFloat(e.target.value))}
          step="0.01"
        />
      </div>
      {categories.map(category => (
        <div key={category}>
          <label>{category}:</label>
          <input
            type="number"
            value={bigMoveThresholds[category] || defaultBigMoveThreshold}
            onChange={(e) => handleUpdateThreshold(category, parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
      ))}
    </div>
  );
};