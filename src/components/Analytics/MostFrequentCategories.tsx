import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Box } from '@mui/material';
import { FinanceEntity, Category } from '@/common/api/finance/entity';

const MAX_CATEGORIES_TO_SHOW = 5;

export const MostFrequentCategories = ({ finances }: { finances: FinanceEntity[] }) => {
  if (!finances || finances.length === 0) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 180, justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="primary" gutterBottom align="center">Most Frequent Categories</Typography>
        <Typography variant="body2">No submission data available.</Typography>
      </Paper>
    );
  }

  const categoryCounts = finances.reduce((acc, curr) => {
    // Ensure curr.category is a valid string key
    const categoryKey = curr.category as string;
    acc[categoryKey] = (acc[categoryKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>); // Use string for keys from enum

  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, MAX_CATEGORIES_TO_SHOW);

  if (sortedCategories.length === 0) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 180, justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="primary" gutterBottom align="center">Most Frequent Categories</Typography>
        <Typography variant="body2">No categories found in submissions.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 180 }}> {/* Adjusted minHeight if necessary based on content */}
      <Typography variant="h6" color="primary" gutterBottom align="center">Most Frequent Categories</Typography>
      <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {sortedCategories.map(([category, count]) => (
          <ListItem
            key={category}
            disableGutters
            sx={{
              pl: 2, // Indent list item
              '&:not(:last-child)': { mb: 0.5 } // Add a small margin bottom to list items except the last one
            }}
          >
            <ListItemText
              primary={category}
              secondary={`${count} submission${count === 1 ? '' : 's'}`}
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
