import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import DashBoard from './dashboard/Dashboard'
import { IconContext } from "react-icons";

const SERVER_URL = 'https://treehacks-platform.herokuapp.com';

function App() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    console.log('Getting Data');
    const effect = async () => {
      try {
        const data = await getData();
        console.log(data);
        setCalls(data);
      } catch (e) {
        console.log(e);
      }
    };
    effect();
  }, []);

  return (
    <IconContext.Provider value={{ size: "2em", color: "blue", className: "global-class-name" }}>

    <DashBoard
      calls={calls}
    />
    </IconContext.Provider>
  );
}

async function getData() {
  const response = await axios.get(SERVER_URL);
  response.data.forEach(c => {
    c.createdAt = new Date(c.createdAt);
    c.sentences.forEach(cr => {
      cr.timestamp = new Date(cr.timestamp);
    });
  });
  return response.data;
}

export default App;
