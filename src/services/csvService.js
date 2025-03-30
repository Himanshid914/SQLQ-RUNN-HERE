
export const runQuery = (query, csvData) => {
  try {
    let result = [...csvData];

    if (query.includes("=")) {
      const [field, value] = query.split("=").map((s) => s.trim().replace(/'/g, ""));
      if (value !== "*") {
        result = result.filter((row) => row[field] === value);
      }
    }

    return result;
  } catch (error) {
    return [];
  }
};
