import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
//import App from './pages/App';
import reportWebVitals from './reportWebVitals';

function App() {
  return <p>
    The project is temporarily closed because the sanctions against Russia
    made it difficult to find a free cloud service.
  </p>;
}

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
