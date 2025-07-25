// src/index.js - Fixed for older React versions
import React from 'react';
import ReactDOM from 'react-dom'; // Changed from 'react-dom/client'
import './index.css';
import App from './App';
import './styles/globals.css';
import reportWebVitals from './reportWebVitals';

// Use the older ReactDOM.render method instead of createRoot
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();