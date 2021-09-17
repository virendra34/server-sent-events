import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ facts, setFacts ] = useState([]);
  const [ listening, setListening ] = useState(false);
  const [form, setForm] = useState({
    info:'',
    source:'',
  });
  useEffect( () => {
    if (!listening) {
      const events = new EventSource('http://localhost:8000/events');

      events.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);

        setFacts((facts) => facts.concat(parsedData));
      };

      setListening(true);
    }
  }, [listening, facts]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    const url = 'http://localhost:8000/fact';
    const fetchOptions = {
      method:'POST',
      headers:headers,
      body:JSON.stringify(form),
    };
    const res = await fetch(url, fetchOptions);
    console.log(res);
  }

  return (
    <div>
    <table className="stats-table">
      <thead>
        <tr>
          <th>Fact</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>
        {
          facts.map((fact, i) =>
            <tr key={i}>
              <td>{fact.info}</td>
              <td>{fact.source}</td>
            </tr>
          )
        }
      </tbody>
    </table>
    <form onSubmit={handleSubmit}>
        <p>Write your message</p>
        <input name="info" onChange={handleChange} value={form.info} placeholder="Info" /><br/>
        <input name="source" onChange={handleChange} value={form.source} placeholder="Source" /><br/>
        <button type="submit">Send</button>
   </form>
    </div>
  );
}

export default App;