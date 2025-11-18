import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { SnackbarProvider } from './context/SnackbarContext';
import { UserProvider } from './context/UserContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
  // <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </SnackbarProvider>
    </ThemeProvider>,
  // </React.StrictMode>
);
reportWebVitals();
