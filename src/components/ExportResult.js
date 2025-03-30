import { useContext } from "react";
import { QueryContext } from "../context/QueryContext";
import { CSVLink } from "react-csv";

const ExportResult = () => {
  const { queryResult } = useContext(QueryContext);

  return <CSVLink data={queryResult} filename="query_result.csv">Export CSV</CSVLink>;
};

export default ExportResult;
