import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './components/Home';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Home />);