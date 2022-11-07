import { createRoot } from 'react-dom/client';
import React from 'react';

import Main from './ui/Main';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Document must contains <div id="root">.');
}

createRoot(rootElement).render(<Main />);
