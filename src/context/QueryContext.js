import React, { createContext, useState , useEffect} from 'react';
import Papa from "papaparse";


export const QueryContext = createContext();

export const QueryProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [queryResult, setQueryResult] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => {
    fetch("/orders.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setOrdersData(result.data),
        });
      });
    }, []);


    const executeQuery = () => {
    let filteredData = [...ordersData];

    if (!query || query.trim() === "") {
      return;
    }
  

    if (!query || ordersData.length === 0) {
      return ;
    } 
    if (/FROM\s+orders/i.test(query)) {
      filteredData = [...ordersData]; 
    } else {
      setQueryResult([{ error: "Invalid query.." }]);
      return;
    }
    // Handle WHERE condition
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|;|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+|\s+OR\s+/i).map(cond => cond.trim());
      filteredData = filteredData.filter(row => {
        return conditions.every(condition => {
          const match = condition.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*('.*?'|\S+)/);
          if (!match) return false;
      
          let [, column, operator, value] = match;
          column = column.toLowerCase(); 
          value = value.replace(/'/g, "").trim();
      
          const columnKey = Object.keys(row).find(key => key.toLowerCase() === column.toLowerCase());
          if (!columnKey) return false; 
          let rowValue = row[columnKey]?.toString().trim();
          if (!isNaN(rowValue) && !isNaN(value)) {
            rowValue = parseFloat(rowValue);
            value = parseFloat(value);
          } else {
            rowValue = rowValue.toLowerCase(); 
            value = value.toLowerCase();
          }
      
          switch (operator) {
            case "=": return rowValue === value;
            case "!=": return rowValue !== value;
            case ">": return rowValue > value;
            case "<": return rowValue < value;
            case ">=": return rowValue >= value;
            case "<=": return rowValue <= value;
            default: return false;
          }
        });
      });      
    }
  
    // Handle Aggregation
    const aggregationMatch = query.match(/SELECT\s+(COUNT|SUM|AVG|MIN|MAX)\((\*|\w+)\)\s+FROM\s+\w+/i);
    if (aggregationMatch) {
      const [, functionType, column] = aggregationMatch;
      let resultValue = 0;
      if (functionType.toUpperCase() === "COUNT") {
        resultValue = filteredData.length;
      } else {
        const columnValues = filteredData.map(row => parseFloat(row[column]) || 0);
        switch (functionType.toUpperCase()) {
          case "SUM": resultValue = columnValues.reduce((acc, val) => acc + val, 0); break;
          case "AVG": resultValue = columnValues.reduce((acc, val) => acc + val, 0) / columnValues.length; break;
          case "MAX": resultValue = Math.max(...columnValues); break;
          case "MIN": resultValue = Math.min(...columnValues); break;
        }
      }
      setQueryResult([{ [`${functionType}(${column})`]: resultValue }]);
      return;
    }
  
    // Handle ORDER BY
    const orderMatch = query.match(/ORDER BY (\w+)\s*(ASC|DESC)?/i);
if (orderMatch) {
  const [, column, order] = orderMatch;
  filteredData = filteredData.sort((a, b) => {
    let valA = a[column], valB = b[column];

    if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    return order === "DESC" ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
  });
}
  
    // Handle LIMIT
    const limitMatch = query.match(/LIMIT (\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      filteredData = filteredData.slice(0, limit);
    }
    setQueryResult(filteredData);  
    setQueryHistory(prev => (prev.includes(query) ? prev : [...prev, query]));

  };

  return (
    <QueryContext.Provider value={{query, setQuery, queryHistory, setQueryHistory, queryResult, setQueryResult , executeQuery}}>
      {children}
    </QueryContext.Provider>
  );
};

