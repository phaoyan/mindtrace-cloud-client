import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter as Router} from "react-router-dom";
import {RecoilRoot} from "recoil";
import axios from "axios";
import 'react-resizable/css/styles.css';



axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <RecoilRoot>
        <Router>
            <App/>
        </Router>
    </RecoilRoot>
);
