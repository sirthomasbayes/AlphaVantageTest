import * as React from 'react';
import './App.css';
import AlphaVantageApiProvider from './AlphaVantageApiProvider';
import TimeSeriesTable from './TimeSeriesTable';

//const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <TimeSeriesTable 
          apiProvider={new AlphaVantageApiProvider()}
          maxRetry={5}
          />
      </div>
    );
  }
}

export default App;
