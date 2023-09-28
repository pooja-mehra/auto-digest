import React, { useState, useEffect, useRef, Children, cloneElement } from 'react';
import './App.css';
import TextExtractor from './components/textextractor';

function App() {
  return (
    <div>
      <header>
        <title><h4>TextExtractor</h4></title>
      </header>
      <main>
        <TextExtractor />
      </main>
      <footer>
      </footer>
    </div>
  )
}

export default App;
