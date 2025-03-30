import { useState, useContext, useEffect } from "react";
import { QueryContext } from "../context/QueryContext";
import QueryResult from "./QueryResult";
import "../style/QueryRunnerStyle.css";

const QueryRunner = () => {
  const { query, setQueryResult, queryHistory, setQueryHistory, executeQuery } = useContext(QueryContext);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  // ✅ Clear error when query is updated
  useEffect(() => {
    if (query.trim()) {
      setError("");
    }
  }, [query]); 

  const runQuery = async() => {
    if (!query.trim()) {
      setError("Please enter a query.");
      setShowResult(false);
      return;
    }
    try {
      const result = await executeQuery(query); 
      if (!result || result.length === 0) {
        setShowResult(false);
      } else {
        setQueryResult(result); 
        setQueryHistory([...queryHistory, query]); 
        setError("");
        setShowResult(true);
      }
    } catch (err) {
      setError("Query Execution Error.");
      setShowResult(false);
    }
    setQueryHistory([...queryHistory, query]); 

  };

  return (
    <div>
      <button onClick={runQuery}>Run Query</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {showResult && <QueryResult />}
    </div>
  );
};

export default QueryRunner;
