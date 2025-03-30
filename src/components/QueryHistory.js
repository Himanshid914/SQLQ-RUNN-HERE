import React, { useContext, useEffect, useState } from "react";
import { QueryContext } from "../context/QueryContext";

const QueryHistory = () => {
  const { queryHistory, setQuery } = useContext(QueryContext);
  const [selectedQuery, setSelectedQuery] = useState("");

  useEffect(() => {
    setSelectedQuery("");
  }, [queryHistory]);

  const handleSelectQuery = (selectedQuery) => {
    setQuery(selectedQuery);
    setSelectedQuery(""); 
  };

  return (
    <div>
      <h3>Query History</h3>
      <select 
      value={selectedQuery}
        onChange={(e) => handleSelectQuery(e.target.value)}
      >
        <option value="" disabled>Select query from history.. </option>
        {queryHistory.length > 0 ? (
          queryHistory.slice(-10).map((query, index) => (
            <option key={index} value={query}>{query}</option>
          ))
        ) : (
          <option disabled>No queries available</option>
        )}
      </select>
    </div>
  );
};

export default QueryHistory;
