import * as React from 'react';
import './App.css';
import AlphaVantageApiProvider from './api_provider/AlphaVantageApiProvider';
import TimeSeriesTable from './TimeSeriesDisplay';

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
