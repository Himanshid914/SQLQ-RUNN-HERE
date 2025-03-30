import React, { useState, useContext } from "react";
import { QueryContext } from "../context/QueryContext";
import "../style/QueryGeneratorStyle.css"; // Ensure styles are applied

const QueryGenerator = () => {
  const { setQuery } = useContext(QueryContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState("orders");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [aggregation, setAggregation] = useState("");
  const [limit, setLimit] = useState("");

  const availableColumns = [
    "orderID", "customerID", "employeeID", "orderDate", "requiredDate", "shippedDate",
    "shipVia", "freight", "shipName", "shipAddress", "shipCity", "shipRegion",
    "shipPostalCode", "shipCountry"
  ];

  const handleColumnChange = (col) => {
    setSelectedColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { column: "", operator: "=", value: "" }]);
  };

  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...conditions];
    updatedConditions[index][field] = value;
    setConditions(updatedConditions);
  };

  const handleGenerateQuery = () => {
    let query = `SELECT ${selectedColumns.length ? selectedColumns.join(", ") : "*"} FROM ${selectedTable}`;

    if (aggregation) {
      query = `SELECT ${aggregation}(${selectedColumns[0] || "*"}) FROM ${selectedTable}`;
    }

    if (conditions.length > 0) {
      const conditionString = conditions
        .filter(cond => cond.column && cond.value)
        .map(cond => `${cond.column} ${cond.operator} '${cond.value}'`)
        .join(" AND ");
      if (conditionString) {
        query += ` WHERE ${conditionString}`;
      }
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    setQuery(query);
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        Generate Query
      </button>

      {showForm && (
        <>
          {/* Overlay */}
          <div className="query-overlay" onClick={() => setShowForm(false)}></div>

          {/* Popup Modal */}
          <div className="query-popup">
            <h3>Generate Your Query</h3>
            <button className="close-button" onClick={() => setShowForm(false)}>❌</button>

            <label>Table:</label>
            <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
              <option value="orders">orders</option>
            </select>

            <div className="select-col">
              <label>Columns:</label>
              {availableColumns.map(col => (
                <label key={col}>
                  <input type="checkbox" checked={selectedColumns.includes(col)} onChange={() => handleColumnChange(col)} />
                  {col}
                </label>
              ))}
            </div>

            <div>
              <h4>Conditions:</h4>
              {conditions.map((cond, index) => (
                <div key={index}>
                  <select value={cond.column} onChange={(e) => handleConditionChange(index, "column", e.target.value)}>
                    <option value="">Select Column</option>
                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>

                  <select value={cond.operator} onChange={(e) => handleConditionChange(index, "operator", e.target.value)}>
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value=">">{">"}</option>
                    <option value="<">{"<"}</option>
                    <option value=">=">{">="}</option>
                    <option value="<=">{"<="}</option>
                  </select>

                  <input type="text" value={cond.value} onChange={(e) => handleConditionChange(index, "value", e.target.value)} placeholder="Value" />
                </div>
              ))}
              <button onClick={handleAddCondition}>Add Condition</button>
            </div>

            <label>Aggregation:</label>
            <select value={aggregation} onChange={(e) => setAggregation(e.target.value)}>
              <option value="">None</option>
              <option value="COUNT">COUNT</option>
              <option value="SUM">SUM</option>
              <option value="AVG">AVG</option>
              <option value="MAX">MAX</option>
              <option value="MIN">MIN</option>
            </select>

            <label>Limit:</label>
            <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />

            <button onClick={handleGenerateQuery}>Generate Query</button>
          </div>
        </>
      )}
    </div>
  );
};

export default QueryGenerator;
