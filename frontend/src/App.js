import './App.css';

import FileStorage from './components/FileStorage';
import React from 'react';

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Secure File Sharing DApp</h1>
      </header>
      <main>
        <FileStorage />
      </main>
    </div>
  );
}

export default App;
