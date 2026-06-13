import React from 'react';
import { Menu, MenuItem } from '@mui/material';

// Simple replacement for DropdownMenu
export const DropdownMenu = ({ children, ...props }) => (
  <Menu {...props}>
    {children}
  </Menu>
);

// Simple replacement for Logo
export const Logo = ({ ...props }) => (
  <div {...props}>Stock App</div>
);

// Export other commonly used components as simple replacements
export const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

export const Card = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const Grid = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const Typography = ({ children, ...props }) => (
  <span {...props}>{children}</span>
);
