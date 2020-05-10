import { createReducer } from 'modules/redux/utils';
import { TRANSPORT_ACTION_TYPES } from 'core/transport/actions';
import { isHeartbeat, isSubscriptionMessage, isUnsubscriptionMessage, isErrorMessage } from 'core/transport/utils';
import { ReceiveMessage } from 'core/transport/actions';
import { getLookupKey } from './utils';
import { Actions } from './../root';
import { Candle } from './types/Candle';

const MAX_CANDLES = 100;

type SymbolState = Candle[];

export interface CandlesState {
    [currencyPair: string]: SymbolState;
}

const initialState: CandlesState = {
}

function snapshotReducer(state: SymbolState, action: ReceiveMessage) {
    const [, candles] = action.payload;
    return candles.map(([timestamp, open, close, high, low, volume]: number[]) => ({
        timestamp, open, close, high, low, volume
    })).sort((a: Candle, b: Candle) => b.timestamp - a.timestamp);
}

function updateReducer(state: SymbolState = [], action: ReceiveMessage) {
    const [, candle] = action.payload;
    const [timestamp, open, close, high, low, volume] = candle;

    return [
        {
            timestamp,
            open,
            close,
            high,
            low,
            volume
        },
        ...state
    ];
}

const receiveMessageReducer = (state: CandlesState, action: ReceiveMessage) => {
    if (isHeartbeat(action) || isSubscriptionMessage(action) || isErrorMessage(action)) {
        return state;
    }

    const { channel, request } = action.meta || {};
    if (channel === 'candles') {
        const { key } = request;
        const [, timeframe, symbol] = key.split(':');
        const currencyPair = symbol.slice(1);
        const lookupKey = getLookupKey(currencyPair, timeframe);

        if (isUnsubscriptionMessage(action)) {
            const updatedState = {
                ...state
            };
            delete updatedState[lookupKey];
            return updatedState;
        }

        const symbolReducer = Array.isArray(action.payload[1][0]) ? snapshotReducer : updateReducer;
        const result = symbolReducer(state[lookupKey], action);

        return {
            ...state,
            [lookupKey]: result.slice(0, MAX_CANDLES) // restrict number of candles so we don't eventully fill up the memory
        };
    }

    return state;
}

export const candlesReducer = createReducer<CandlesState, Actions>({
    [TRANSPORT_ACTION_TYPES.RECEIVE_MESSAGE]: receiveMessageReducer
}, initialState);

export default candlesReducer;