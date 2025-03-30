import { useState, useContext, useEffect  } from "react";
import { QueryContext } from "../context/QueryContext";
import  "../style/QueryResultStyles.css"

const QueryResult = () => {
  const { queryResult } = useContext(QueryContext);
  const [page, setPage] = useState(0);
  const [colPage, setColPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const rowsPerPage = 10;
  const colsPerPage = 5;

  useEffect(() => {
      }, [queryResult]);

  if (!queryResult || (Array.isArray(queryResult) && queryResult.length === 0)) {
    return;
}
const isArrayResult = Array.isArray(queryResult) && queryResult.length > 0;
    const isObjectResult = !Array.isArray(queryResult) && queryResult !== null;


  // Apply search filter
  const filteredData = queryResult.filter((row) =>
    Object.values(row).some((val) => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    let valA = a[sortColumn], valB = b[sortColumn];

    if (!isNaN(valA) && !isNaN(valB)) {
      valA = Number(valA);
      valB = Number(valB);
    }

    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  //  Paginate rows
  const displayedRows = sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  
  // Paginate columns
  const allColumns = Object.keys(queryResult[0]);
  const displayedColumns = allColumns.slice(colPage * colsPerPage, (colPage + 1) * colsPerPage);

  // Handle sorting
  const handleSort = (col) => {
    setSortOrder(sortColumn === col ? (sortOrder === "asc" ? "desc" : "asc") : "asc");
    setSortColumn(col);
  };

// Export displayed data as CSV
const exportToCSV = () => {
  let csvContent = "data:text/csv;charset=utf-8,";

  csvContent += displayedColumns.join(",") + "\n";

  displayedRows.forEach((row) => {
    csvContent += displayedColumns.map((col) => `"${row[col]}"`).join(",") + "\n";
  });


  // Create and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "query_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  return (
    <div><h3>Query Result:</h3>
      <div>
        <button onClick={() => setColPage(colPage - 1)} disabled={colPage === 0}>
          ←Left
        </button>
        <button onClick={() => setColPage(colPage + 1)} disabled={(colPage + 1) * colsPerPage >= allColumns.length}>
          right→
        </button>
        <input
        type="text"
        placeholder="Search results..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
      />
<button onClick={exportToCSV} >
          📥 Export
        </button>
      </div>
      {isArrayResult ? (
      <table border="1" align="center">
        <thead>
          <tr>
          {displayedColumns.map((col) => (
              <th key={col} onClick={() => handleSort(col)} style={{ cursor: "pointer" }}>
                {col} {sortColumn === col ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row, i) => (
            <tr key={i}>
              {displayedColumns.map((col, j) => (
                <td key={j}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      ) : isObjectResult ? (
        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
    ) : (
        <p>No valid result.</p>
    )}

      <div >
        <button onClick={() => setPage(page - 1)} disabled={page === 0}>
        ←Prev
        </button>
        <button onClick={() => setPage(page + 1)} disabled={(page + 1) * rowsPerPage >= queryResult.length}>
          Next→
        </button>
      </div>
    </div>
  );
};
 export default QueryResult;
