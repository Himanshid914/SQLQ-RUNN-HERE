### SQLQRUNN

### 1. Overview

The Query Runner application is a web-based SQL query execution tool that allows users to run predefined and custom queries on CSV-based datasets (Orders and Customers). It provides functionalities such as filtering, sorting, aggregation, joining, and exporting query results.

### 2. Data
The Orders and Customers datasets used in this application are sourced from the Northwind dataset available at:
[Northwind CSV Data](https://github.com/graphql-compose/graphql-compose-examples/tree/master/examples/northwind/data/csv)

### 3. Features Implemented

Predefined Queries: Run common SQL queries with a single click.

Custom Query Execution: Users can input and execute their own SQL queries.

Query History: Stores the last five executed queries.

Sorting and Filtering: Users can sort and filter results using SQL ORDER BY and WHERE clauses.

Aggregation Functions: Supports COUNT, SUM, AVG, MIN, and MAX functions.

Joins: Implements inner joins between orders and customers.

Pagination: Displays results in a paginated manner.

CSV Parsing: Fetches data from CSV files.

Export to CSV: Users can download query results.

Query Builder: Provides a UI for query construction.

### 4. Application Architecture


Built with React.js

Manages state using useState and useEffect hooks

Handles query execution and parsing logic

Backend (Optional for future expansion):

Can be implemented using Node.js with Express.js

Can integrate with databases like PostgreSQL or MySQL for real-time querying

### 5. Entity-Relationship (ER) Diagram

![alt text](<src/ER diagram.png>)

The customers table stores customer details.

The orders table stores order details and references customerID from customers.

### 6. How the Application Works

Data Loading: Orders and Customers data are loaded from CSV files using PapaParse.

Query Execution: Users can select predefined queries or enter custom SQL-like queries.

Filtering & Sorting: The application parses WHERE, ORDER BY, and GROUP BY clauses.

Aggregation: Functions like SUM, COUNT, AVG, etc., are processed.

Join Execution: Queries involving multiple tables (JOIN) are handled by merging datasets.

Results Display & Export: Results are displayed in a table format with pagination and an option to export as CSV.

### 7. Query Execution Flow

The user selects or enters a query.

The application determines which dataset (orders/customers) to use.

The query is parsed to extract conditions, sorting, grouping, and aggregation operations.

The results are generated and displayed.

Users can download the result as a CSV file.

### 8. Tech Stack

Frontend: React.js, JavaScript, HTML, CSS

State Management: React Hooks (useState, useEffect)

Data Handling: PapaParse (CSV Parsing)

Export Feature: FileSaver.js

Future Enhancements: Backend integration with Node.js and SQL database

### 9. Application UI Layout

Navigation Bar (Select predefined queries, input custom queries)

Query Input Section (Text area for query entry, Run button)

Query Results Table (Displays executed query results with pagination)

Export Button (Download query results as CSV)

Query History Panel (Shows last executed queries)

Query Builder Modal (Helps users construct queries visually)

### 10. Sample Queries and Execution

## Basic Queries:

SELECT * FROM orders;
SELECT * FROM customers WHERE country = 'France';

## Sorting Queries:

SELECT * FROM orders ORDER BY orderDate DESC;

## Aggregation Queries:

SELECT COUNT(*) FROM customers;
SELECT SUM(freight) FROM orders;

## Join Queries:

SELECT orders.*, customers.companyName FROM orders JOIN customers ON orders.customerID = customers.customerID;


### 11. Outlook and Future Improvements

Database Integration: Transition from CSV to SQL database for scalability.

Advanced Query Parsing: Improve query interpretation using a SQL parsing library.

User Authentication: Implement login for query history tracking.

More Query Features: Implement DELETE, UPDATE, and INSERT operations.