import { useContext } from "react";
import { QueryContext } from "../context/QueryContext";
import predefinedQueries from "../config/queryConfig";
import QuerySelectorStyle from "../style/QuerySelectorStyle.css"
const QuerySelector = () => {
  const { setQuery} = useContext(QueryContext);

  return (<div>
    <h3>PredefinedQueries</h3>
    <select onChange={(e) => {setQuery(e.target.value)}}>
      <option value="">Select predefined Query..</option>
      {predefinedQueries.map((q, index) => (
        <option key={index} value={q.query}>{q.name}</option>
      ))}
    </select>
    </div>
  );
};

export default QuerySelector;
