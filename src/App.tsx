import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import configureStore from './modules/redux/store';
import { AppActions } from './modules/app/actions';
import Trades from 'modules/trades/components';
import Tickers from 'modules/ticker/components/Tickers';
import CandlesChart from 'modules/candles/components';
import { Container, Header, TradesPanel, TickersPanel, CandlesPanel } from 'App.styled';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

function App() {
  const store = configureStore();

  useEffect(() => {
    store.dispatch(AppActions.bootstrapApp());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <Provider store={store}>
      <Container>
        <Header><h1>Crypto Trader</h1></Header>
        <TickersPanel><Tickers /></TickersPanel>
        <TradesPanel><Trades /></TradesPanel>
        <CandlesPanel><CandlesChart /></CandlesPanel>
      </Container>
     
    </Provider>
  );
}

export default App;