import React, { ChangeEvent, FC, ReactNode, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coin, selectCoinsState } from '../redux/slice/coinsSlice';
import { useAppDispatch } from '../redux/store';
import { addTicker, selectTickerState, updateTicker } from '../redux/slice/tickerSlice';
import { subscribe } from '../api/api';
import { selectSearchState, setCoinSearch, setTickerSearch } from '../redux/slice/searchSlice';

const Search: FC = () => {
  const dispatch = useAppDispatch();
  const { coins } = useSelector(selectCoinsState);
  const { coinSearch, tickerSearch } = useSelector(selectSearchState);
  const { tickers } = useSelector(selectTickerState);
  const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [autoCompleteList, setAutoCompleteList] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function onCoinSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    dispatch(setCoinSearch(event.target.value));
    setShowWarning(false);
  }

  function onTickerSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    dispatch(setTickerSearch(event.target.value));
  }

  useEffect(() => {
    if (coinSearch) {
      const list: string[] = getAutoCompleteList();
      setAutoCompleteList(getAutoCompleteList());
      list.length > 0
        ? setShowAutoComplete(true)
        : setShowAutoComplete(false);
    } else {
      setShowAutoComplete(false);
    }
  }, [coinSearch]);

  function getAutoCompleteList(): string[] {
    const coinList: Coin[] = getMatchedCoinsList();
    return coinList.length >= 4
      ? coinList.slice(0, 4).map((coin) => coin.Symbol)
      : coinList.slice(0, coinList.length).map((coin) => coin.Symbol);
  }

  function getMatchedCoinsList(): Coin[] {
    const primaryList: Coin[] = coins.filter((coin) =>
      coin.Symbol.toLowerCase() === coinSearch.toLowerCase());
    const secondaryList: Coin[] = coins.filter((coin) =>
      coin.Symbol.toLowerCase().startsWith(coinSearch.toLowerCase())
      && coin.Symbol.toLowerCase() !== coinSearch.toLowerCase())
      .filter(coin => coin.Symbol.toLowerCase() !== coinSearch.toLowerCase())
      .sort((coin1, coin2) => coin1.Symbol.length - coin2.Symbol.length);
    const tertiaryList: Coin[] = coins.filter((coin) =>
      coin.Symbol.toLowerCase().includes(coinSearch.toLowerCase()))
      .sort((coin1, coin2) => coin1.Symbol.length - coin2.Symbol.length);

    return primaryList.concat(secondaryList).concat(tertiaryList);
  }

  function isTickerExists(name: string): boolean {
    return tickers.filter(ticker => ticker.name === name).length > 0;
  }

  function onAddClick(name: string): void {
    name = name.toUpperCase();
    if (!isTickerExists(name)) {
      dispatch(addTicker(name));
      subscribe(name, getHandler(name));
    } else {
      setShowWarning(true);
    }
    inputRef.current?.focus();
  }

  function getHandler(name: string): (newPrice: string) => void {
    return (newPrice: string) => {
      dispatch(updateTicker({ name: name, price: newPrice }));
    };
  }

  function onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      onAddClick(coinSearch);
      dispatch(setCoinSearch(''));
    }
  }

  function getAutoComplete(): ReactNode {
    return autoCompleteList.map((symbol, index) => (
      <span
        onClick={() => onAddClick(symbol)}
        key={index}
        className='inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 hover:bg-gray-600 hover:text-white transition-colors duration-300 cursor-pointer'>
        {symbol}
      </span>));
  }

  return (
    <div>
      <div className='flex'>
        <div className='max-w-xs'>
          <label htmlFor='wallet' className='block text-sm font-medium text-gray-700'>Тикер</label>
          <div className='mt-1 relative rounded-md shadow-md'>
            <input
              ref={inputRef}
              type='text'
              name='wallet'
              onChange={onCoinSearchChange}
              onKeyDown={onKeyPress}
              value={coinSearch}
              id='wallet'
              className='block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md'
              placeholder='Например DOGE'
            />
          </div>
          {showAutoComplete &&
            <div className='flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap'>
              {getAutoComplete()}
            </div>}
          {showWarning && <div className='text-sm text-red-600'>Такой тикер уже добавлен</div>}
        </div>
      </div>
      <button
        onClick={() => onAddClick(coinSearch)}
        type='button'
        className='my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-1000 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
        <svg
          className='-ml-0.5 mr-2 h-6 w-6'
          xmlns='http://www.w3.org/2000/svg'
          width='30'
          height='30'
          viewBox='0 0 24 24'
          fill='#ffffff'>
          <path
            d='M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
          ></path>
        </svg>
        Добавить
      </button>
      <div className='mt-1 relative rounded-md shadow-md'>
        <input
          onChange={onTickerSearchChange}
          value={tickerSearch}
          type='text'
          name='wallet'
          id='wallet'
          className='block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md'
          placeholder='Например DOGE'
        />
      </div>
    </div>
  );
};

export default Search;