"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import LoginIcon from '@mui/icons-material/Login';
import Link from 'next/link';

interface TemporaryDrawerProps {
  open: boolean;
  onOpenChange: (state: 'open' | 'close') => void;
}

export default function TemporaryDrawer({ open, onOpenChange }: TemporaryDrawerProps) {

  const menuItems = [
    { text: 'Finance', path: '/finance' },
    { text: 'Analytics', path: '/analytics' },
    { text: 'Login', path: '/login' }
  ];

  const handleToggleDrawer = (open: boolean) => () => {
    onOpenChange(open ? 'open' : 'close');
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} href={item.path} onClick={handleToggleDrawer(false)}>
              <ListItemIcon>
                {index == 0 ? <MoneyIcon /> : index == 1 ? <AnalyticsIcon /> : <LoginIcon />}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer open={open} onClose={handleToggleDrawer(false)}>
      {DrawerList}
    </Drawer>
  );
}

