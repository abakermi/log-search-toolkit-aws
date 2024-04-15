
import React, { useState } from 'react';
import axios from 'axios';



const searchUrl=import.meta.env.VITE_SEARCH_URL

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

const App= () => {
    const [query, setQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchResults, setSearchResults] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleSearch = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await axios.post(searchUrl, {
          query,
          startDate,
          endDate,
        });
        setSearchResults(response.data);
      } catch (error) {
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    const highlightQuery = (text: string) => {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.split(regex).map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      );
    };
  
    return (
      <div className="flex justify-center  min-h-screen bg-gray-100">
        <div className="container mx-auto p-4 bg-white shadow-md rounded">
          <h1 className="text-2xl font-bold mb-4 text-center">Log Search</h1>
          <div className="mb-4 flex justify-center">
            <input
              type="text"
              placeholder="Search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 mr-2"
            />
            <input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 mr-2"
            />
            <input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 mr-2"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-500 text-white rounded px-4 py-1"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
          {searchResults.length > 0 ? (
        <ul>
        {searchResults.map((entry, index) => (
          <li key={index} className="mb-4 flex space-x-4">
            <div className="font-bold">{highlightQuery(entry.timestamp)}</div>
            <div className="text-gray-600">{highlightQuery(entry.level)}</div>
            <div className="flex-1">{highlightQuery(entry.message)}</div>
          </li>
        ))}
      </ul>
          ) : (
            <div className="text-gray-500 text-center">No search results.</div>
          )}
        </div>
      </div>
    );
  };
  
  export default App;