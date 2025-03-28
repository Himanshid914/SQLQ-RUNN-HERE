
import React, { useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";

const QueryBuilder = ({onClose}) => {
  const tables = {
    orders: [
      "orderID", "customerID", "employeeID", "orderDate", "requiredDate", "shippedDate",
      "shipVia", "freight", "shipName", "shipAddress", "shipCity", "shipRegion",
      "shipPostalCode", "shipCountry"
    ],
    customers: [
      "customerID", "companyName", "contactName", "contactTitle", "address", "city", 
      "region", "postalCode", "country", "phone", "fax"
    ]
  };

  const [selectedTable, setSelectedTable] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [orderBy, setOrderBy] = useState("");
  const [limit, setLimit] = useState("");
  const [joinTable, setJoinTable] = useState("");
  const [joinCondition, setJoinCondition] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [aggregation, setAggregation] = useState("");
  const [query, setQuery] = useState("SELECT * FROM orders;");

  const handleColumnChange = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { column: "", operator: "=", value: "" }]);
  };

  const handleGenerateQuery = () => {
    let query = "SELECT ";
    query += aggregation ? `${aggregation}(${selectedColumns.join(", ")})` : selectedColumns.length ? selectedColumns.join(", ") : "*";
    query += ` FROM ${selectedTable}`;

    if (joinTable && joinCondition) query += ` JOIN ${joinTable} ON ${joinCondition}`;
    if (conditions.length) query += ` WHERE ` + conditions.map(c => `${c.column} ${c.operator} '${c.value}'`).join(" AND ");
    if (groupBy) query += ` GROUP BY ${groupBy}`;
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (limit) query += ` LIMIT ${limit}`;
    
    setQuery(query);
  }

  return (
    <div className="query-builder">
    <button className="close-btn" onClick={onClose}>❌</button>
    <h2>Generate Your Query</h2>

    <FormControl fullWidth>
      <InputLabel >Table</InputLabel>
      <Select
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
      >
        <MenuItem value="orders">Orders</MenuItem>
        <MenuItem value="customers">Customers</MenuItem>
      </Select>
    </FormControl>

    {selectedTable && (
      <div>
        <Typography>Select Columns:</Typography>
        {tables[selectedTable].map((col) => (
          <FormControlLabel
            key={col}
            control={
              <Checkbox
                checked={selectedColumns.includes(col)}
                onChange={() => handleColumnChange(col)}
              />
            }
            label={col}
          />
        ))}
      </div>
    )}

    <button className="add-condition-btn" onClick={handleAddCondition} style={{ marginBottom: '12px', marginTop: '12px'}}>
      Add Condition
    </button>

    {conditions.map((condition, index) => (
      <div className="condition-row" key={index}>
        <TextField
          label="Column"
          value={condition.column}
          onChange={(e) => {
            const newConditions = [...conditions];
            newConditions[index].column = e.target.value;
            setConditions(newConditions);
          }}
        />
        <Select
          value={condition.operator}
          onChange={(e) => {
            const newConditions = [...conditions];
            newConditions[index].operator = e.target.value;
            setConditions(newConditions);
          }}
        >
          <MenuItem value="=">=</MenuItem>
          <MenuItem value=">">&gt;</MenuItem>
          <MenuItem value="<">&lt;</MenuItem>
        </Select>
        <TextField
          label="Value"
          value={condition.value}
          onChange={(e) => {
            const newConditions = [...conditions];
            newConditions[index].value = e.target.value;
            setConditions(newConditions);
          }}
        />
      </div>
    ))}

    <TextField fullWidth label="Order By" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}  style={{ marginBottom: '12px' }}/>
    <TextField fullWidth label="Limit" value={limit} onChange={(e) => setLimit(e.target.value)} style={{ marginBottom: '12px' }}/>
    <TextField fullWidth label="Join Table" value={joinTable} onChange={(e) => setJoinTable(e.target.value)}style={{ marginBottom: '12px' }} />
    <TextField fullWidth label="Join Condition" value={joinCondition} onChange={(e) => setJoinCondition(e.target.value)} style={{ marginBottom: '12px' }} />
    <TextField fullWidth label="Group By" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} style={{ marginBottom: '12px' }}/>
    <TextField fullWidth label="Aggregation (SUM, AVG, etc.)" value={aggregation} onChange={(e) => setAggregation(e.target.value)} style={{ marginBottom: '12px' }}/>

    <button className="generate-query-btn" onClick={handleGenerateQuery} style={{ marginBottom: '12px' }}>
      Generate Query
    </button>
    <TextField fullWidth multiline label="Generated SQL Query" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: '12px' }} />
  </div>
);
};

export default QueryBuilder;
