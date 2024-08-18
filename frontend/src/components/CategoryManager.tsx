// CategoryManager.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCategories, fetchAdminSettings } from '../slices/adminSlice';

const CategoryManager: React.FC = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.admin.categories);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    dispatch(fetchAdminSettings());
  }, [dispatch]);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      dispatch(updateCategories([...categories, newCategory]));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    dispatch(updateCategories(categories.filter(c => c !== category)));
  };

  return (
    <div>
      <h2>Manage Categories</h2>
      <ul>
        {categories.map(category => (
          <li key={category}>
            {category}
            <button onClick={() => handleRemoveCategory(category)}>Remove</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="New category"
      />
      <button onClick={handleAddCategory}>Add Category</button>
    </div>
  );
};

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