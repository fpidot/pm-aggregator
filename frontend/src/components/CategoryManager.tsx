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