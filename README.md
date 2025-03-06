# React Virtual Grid Component
The VirtualGrid component is a React-based virtualized grid designed to efficiently render large datasets by dynamically loading and displaying only the visible rows. This approach enhances performance and reduces memory usage.

### Props
- **fetchData (function)** - An asynchronous function that fetches data based on startIndex, limit, sortOrder, and sortColumn, returning items and totalCount.
- **height (number)** - The maximum height of the grid (in pixels).
- **rowHeight (number)** - The height of each row, used for virtual scrolling calculations.
- **sortOrder (string | null)** - The order in which data should be sorted (asc or desc). Defaults to null.
- **sortColumn (string)** - The column by which data should be sorted.
- **children (ReactNode)** - Used to define columns via PropertyColumn and TemplateColumn.

### Column Types
- **PropertyColumn** - Defines columns based on object properties.
- **TemplateColumn** - Allows custom content (e.g., buttons, icons) inside a column.


### How It Works?
- **Dynamic Data Fetching** - Loads only the necessary rows dynamically using the fetchData function.
- **Virtual Scrolling** - Displays only visible rows based on rowHeight, reducing unnecessary re-renders.
- **Sorting Support** - Supports dynamic sorting based on sortColumn and sortOrder.
- **Refresh Functionality** - Provides a refresh method to reload data when needed.

### Use Cases
- Large datasets that need efficient rendering.
- Optimized data loading to enhance performance.
- Tables with customizable and interactive content.
