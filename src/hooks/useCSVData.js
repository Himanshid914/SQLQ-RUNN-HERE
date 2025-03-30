import { useState, useEffect } from "react";
import Papa from "papaparse";

const useCSVData = () => {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    fetch("/orders.csv") 
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setCsvData(result.data),
        });
      })
      .catch(error => console.error("CSV Load Error:", error));
  }, []);

  const executeQuery = (query) => {
    if (!query.toLowerCase().includes("select * from orders")) {
      console.error("Unsupported query");
      return [];
    }
    return csvData; // Return the parsed CSV data directly
  };

  return { executeQuery };
};

export default useCSVData;

