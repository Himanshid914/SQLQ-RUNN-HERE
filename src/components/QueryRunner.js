
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import "./QueryRunner.css";
import QueryBuilder from "./QueryBuilder";


const MAX_HISTORY = 5;

const predefinedQueries = {
 // Basic Queries
 "Select all orders": "SELECT * FROM orders;",
 "Select all customers": "SELECT * FROM customers;",
 "Select first 5 orders": "SELECT * FROM orders LIMIT 5;",
 "Select customers from France": "SELECT * FROM customers WHERE country = 'France';",
 "Select orders from France": "SELECT * FROM orders WHERE shipCountry = 'France';",
 "Select orders from USA": "SELECT * FROM orders WHERE shipCountry = 'USA';",
 "Select orders with freight above $50": "SELECT * FROM orders WHERE freight > 50;",
 
 // Sorting Queries
 "Select orders sorted by order date": "SELECT * FROM orders ORDER BY orderDate DESC;",
 "Select orders sorted by freight (high to low)": "SELECT * FROM orders ORDER BY freight DESC;",
 "Select orders sorted by customerID": "SELECT * FROM orders ORDER BY customerID ASC;",

 // Aggregation Queries
 "Select total number of customers": "SELECT COUNT(*) FROM customers;",
 "Select total freight cost": "SELECT SUM(freight) FROM orders;",
 "Select average freight cost": "SELECT AVG(freight) FROM orders;",
 "Select max freight cost": "SELECT MAX(freight) FROM orders;",
 "Select min freight cost": "SELECT MIN(freight) FROM orders;",

 
 // Join Queries
 "Get customer details for orders": "SELECT orders.*, customers.companyName, customers.contactName FROM orders JOIN customers ON orders.customerID = customers.customerID;",
 "Get orders with employee details": "SELECT orders.*, employees.firstName, employees.lastName FROM orders JOIN employees ON orders.employeeID = employees.employeeID;",
 
 // Advanced Queries
 "Select customers who haven't placed any orders": "SELECT * FROM customers WHERE customerID NOT IN (SELECT customerID FROM orders);",
 "Select top 5 customers with highest total freight cost": "SELECT customerID, SUM(freight) AS totalFreight FROM orders GROUP BY customerID ORDER BY totalFreight DESC LIMIT 5;"

};

export default function QueryRunner() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [data, setData]= useState([]);
  const [history, setHistory] = useState({}); // Stores queries with execution counts
  const HISTORY_LIMIT = 5;
  const rowsPerPage = 10;
  const fieldsPerView = 4;

  useEffect(() => {
    fetch("/orders.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setOrders(result.data),
        });
      });

    fetch("/customers.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setCustomers(result.data),
        });
      });
  }, []);

  const handleRunQuery = () => {
    let filteredData = [];
    // Determine which table to query
    if (/FROM\s+customers/i.test(query)) {
      filteredData = [...customers]; // Query customers table
    } else if (/FROM\s+orders/i.test(query)) {
      filteredData = [...orders]; // Query orders table
    } else {
      setResult([{ error: "Invalid query.." }]);
      return;
    }



    // Handle SELECT * queries
    if (/FROM\s+customers/i.test(query)) {
      filteredData = [...customers];
    } else if (/FROM\s+orders/i.test(query)) {
        filteredData = [...orders];
    } else {
        setData([{ error: "Invalid query.." }]);
        return;
    }

    // Handle WHERE condition
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|;|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1]
        .split(/\s+AND\s+|\s+OR\s+/i)
        .map(cond => cond.trim());
  
      filteredData = filteredData.filter(row => {
        return conditions.every(condition => {
          const match = condition.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*('?[\w-]+'?)/);
          if (!match) return false;
  
          let [, column, operator, value] = match;
          value = value.replace(/'/g, "");
  
          if (!row.hasOwnProperty(column)) return false;
  
          const rowValue = isNaN(row[column]) ? row[column] : parseFloat(row[column]);
          const compareValue = isNaN(value) ? value : parseFloat(value);
  
          switch (operator) {
            case "=": return rowValue === compareValue;
            case "!=": return rowValue !== compareValue;
            case ">": return rowValue > compareValue;
            case "<": return rowValue < compareValue;
            case ">=": return rowValue >= compareValue;
            case "<=": return rowValue <= compareValue;
            default: return false;
          }
        });
      });
    }
  
  // Handle Aggregation Queries
  const aggregationMatch = query.match(/SELECT\s+(COUNT|SUM|AVG|MIN|MAX)\((\*|\w+)\)\s+FROM\s+\w+/i);
  if (aggregationMatch) {
    const [, functionType, column] = aggregationMatch;

    let resultValue = 0;
    if (functionType.toUpperCase() === "COUNT") {
      resultValue = filteredData.length;
    } else {
      const columnValues = filteredData.map(row => parseFloat(row[column]) || 0);

      switch (functionType.toUpperCase()) {
        case "SUM":
          resultValue = columnValues.reduce((acc, val) => acc + val, 0);
          break;
        case "AVG":
          resultValue = columnValues.reduce((acc, val) => acc + val, 0) / columnValues.length;
          break;
        case "MAX":
          resultValue = Math.max(...columnValues);
          break;
        case "MIN":
          resultValue = Math.min(...columnValues);
          break;
      }
    }
    setResult([{ [`${functionType}(${column})`]: resultValue }]);
  return;
  }
  
    // Handle ORDER BY
    const orderMatch = query.match(/ORDER BY (\w+)\s*(ASC|DESC)?/i);
    if (orderMatch) {
      const [_, column, order] = orderMatch;
      filteredData = filteredData.sort((a, b) =>
        order === "DESC" ? (b[column] > a[column] ? 1 : -1) : (a[column] > b[column] ? 1 : -1)
      );
    }

    // Handle LIMIT
    const limitMatch = query.match(/LIMIT (\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      filteredData = filteredData.slice(0, limit);
    }

    // Handle JOIN
    if (query.includes("JOIN customers ON orders.customerID = customers.customerID")) {
      filteredData = filteredData.map((order) => {
        const customer = customers.find((cust) => cust.customerID === order.customerID);
        return customer ? { ...order, ...customer } : order;
      });
    }
    // Handle Group By
    const groupByMatch = query.match(/SELECT\s+(\w+),\s*(COUNT|SUM|AVG|MIN|MAX)\((\w+)\)\s+FROM\s+\w+\s+GROUP BY\s+(\w+)\s+HAVING\s+(COUNT|SUM|AVG|MIN|MAX)\((\w+)\)\s*([><=]+)\s*(\d+)/i);
    if (groupByMatch) {
      const [, groupByColumn, functionType, column] = groupByMatch;
      const groupedResults = {};
  
      filteredData.forEach((row) => {
        const key = row[groupByColumn];
        if (!groupedResults[key]) {
          groupedResults[key] = { [groupByColumn]: key, [`${functionType}(${column})`]: 0 };
        }
  
        let value = parseFloat(row[column]) || 0;
        switch (functionType.toUpperCase()) {
          case "COUNT":
            groupedResults[key][`${functionType}(${column})`] += 1;
            break;
          case "SUM":
            groupedResults[key][`${functionType}(${column})`] += value;
            break;
          case "AVG":
            groupedResults[key].count = (groupedResults[key].count || 0) + 1;
            groupedResults[key][`${functionType}(${column})`] += value;
            break;
          case "MAX":
            groupedResults[key][`${functionType}(${column})`] = Math.max(
              groupedResults[key][`${functionType}(${column})`] || 0,
              value
            );
            break;
          case "MIN":
            groupedResults[key][`${functionType}(${column})`] = Math.min(
              groupedResults[key][`${functionType}(${column})`] || value,
              value
            );
            break;
        }
      });
    }

    // Update history
    setHistory((prevHistory) => {
      const newHistory = { ...prevHistory };
      if (newHistory[query]) {
        newHistory[query] += 1;
      } else {
        if (Object.keys(newHistory).length >= HISTORY_LIMIT) {
          const oldestKey = Object.keys(newHistory)[0];
          delete newHistory[oldestKey];
        }
        newHistory[query] = 1;
      }
      return newHistory;
    });
    setQuery("");
    setResult(filteredData.length > 0 ? filteredData : []);
    setCurrentPage(1);
    setCurrentFieldIndex(0);
    
  };

  const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
      };
    
      const handleSort = (column) => {
        const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
        const sortedData = [...result].sort((a, b) => {
          if (a[column] < b[column]) return order === "asc" ? -1 : 1;
          if (a[column] > b[column]) return order === "asc" ? 1 : -1;
          return 0;
        });
        setSortColumn(column);
        setSortOrder(order);
        setResult(sortedData);
      };
    
      // Export functions
      const exportToCSV = () => {
        const csv = Papa.unparse(result);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "query_results.csv");
      };

      const filteredData = result.filter((row) =>
        Object.values(row).some((value) => value?.toString().toLowerCase().includes(searchTerm))
      );
    
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    
      const allFields = result.length > 0 ? Object.keys(result[0]) : [];
      const visibleFields = allFields.slice(currentFieldIndex, currentFieldIndex + fieldsPerView);
    
  return (
    <div><h1 className="text-xl font-bold ">SQLQ RUNN</h1>

    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 ">Common predefined queries </h3>

      <select className="border p-2 mt-2 w-full" onChange={(e) => setQuery(e.target.value)}>
        <option value="">Select a predefined query</option>
        {Object.keys(predefinedQueries).map((key) => (
          <option key={key} value={predefinedQueries[key]}>
            {key}
          </option>
        ))}
      </select>
      <button onClick={() => setShowQueryBuilder(true)}>Query Generator</button>
      
      {showQueryBuilder && (
        <QueryBuilder onClose={() => setShowQueryBuilder(false)} />
      )}
      
      <textarea
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        placeholder="Enter your query..."
        rows={4}
        // style={{ width: "100%", padding: "10px" }}
      />
      {query && (
        <button className="clear-btn" onClick={() => setQuery("")}>
          clear ✖
        </button>
      )}
    
      <button className="bg-blue-500 text-white p-2 mt-2 w-full" onClick={handleRunQuery}>
        Run Query
      </button>

      <h3>Query History</h3>
      <ol>
        {Object.entries(history).map(([q, count]) => (
          <li key={q} 
          onClick={() => setQuery(q)}>
            {q} (Executed {count} times)
          </li>
        ))}
      </ol>
      {paginatedData.length > 0 && (
        <>
          <div className="table-controls">
            <button onClick={() => setCurrentFieldIndex((prev) => Math.max(prev - fieldsPerView, 0))} disabled={currentFieldIndex === 0}>
              ◀ Left
            </button>
            <span>
              Showing fields {currentFieldIndex + 1} to {Math.min(currentFieldIndex + fieldsPerView, allFields.length)} of {allFields.length}
            </span>
            <button onClick={() => setCurrentFieldIndex((prev) => Math.min(prev + fieldsPerView, allFields.length - fieldsPerView))} disabled={currentFieldIndex + fieldsPerView >= allFields.length}>
              Right ▶
            </button>
            <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <button onClick={exportToCSV}>
        Export ↓
      </button>
          </div>

          <table>
            <thead>
              <tr>
                {visibleFields.map((field) => (
                  <th key={field} onClick={() => handleSort(field)}>
                     {field} {sortColumn === field && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {visibleFields.map((field) => (
                    <td key={field}>{row[field]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              ◀ Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
}

