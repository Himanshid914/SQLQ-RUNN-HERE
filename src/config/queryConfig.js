const predefinedQueries = [
    { name: "All Orders", query: "SELECT * FROM orders" },
    { name: "Orders from France", query: "SELECT * FROM orders WHERE shipCountry = 'France'" },
    { name: "Recent Orders", query: "SELECT * FROM orders ORDER BY orderDate DESC LIMIT 10" },
    { name: "High Freight Orders", query: "SELECT * FROM orders WHERE freight > 100" },
    { name: "Avg of freight", query: "SELECT AVG(freight) FROM orders" },
    { name: "Sum of freight", query: "SELECT SUM(freight) FROM orders" },
    { name: "Orders by Customer ID", query: "SELECT * FROM orders WHERE customerID = 'ALFKI'" },
    { name: "Top 5 Expensive Orders", query: "SELECT * FROM orders ORDER BY freight DESC LIMIT 5" }
  ];
  
  export default predefinedQueries;