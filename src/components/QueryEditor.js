import { useContext } from "react";
import { QueryContext } from "../context/QueryContext";
import "../style/QueryEditorStyle.css"

const QueryEditor = () => {
  const { query, setQuery } = useContext(QueryContext);

  return (
    <div className="query-editor">
    <textarea
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Write your SQL query here..."
      rows={5}
    />
    {query && (
      <span className="clear-icon" onClick={() => setQuery("")}>
        ❌
      </span>
    )}
  </div>
);
};
export default QueryEditor;
