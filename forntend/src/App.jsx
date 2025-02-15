import React from 'react';
import './App.css';
import FileUploader from './components/csvReader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <FileUploader />
      </header>
    </div>
  );
}

export default App;
