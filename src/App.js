import React from 'react';
import './App.css';
import QuerySelector from './components/QuerySelector';
import QueryEditor from './components/QueryEditor'; 
import QueryHistory from './components/QueryHistory';
import QueryResult from './components/QueryResult';
import QueryGenerator from './components/QueryGenerator';
import QueryRunner from './components/QueryRunner';
import { QueryProvider } from './context/QueryContext';
import logo from './assets/logo.png'; 


function App() {

  return (
    <QueryProvider>
    <div className="App">
        <header className="app-header">
        <img src={logo} alt="SQLQ RUNN Logo" className="app-logo" /> 
          <h1>SQLQ RUNN</h1>
        </header>

        <div className="content">
          <QuerySelector />
          <QueryEditor />
          <QueryRunner />
          <QueryGenerator />
          <QueryHistory />
          <QueryResult />
        </div>
    </div>
    </QueryProvider>
  );
}

export default App;
