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
- **PropertyColumn**
    - Defines columns based on object properties.
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

# Getting started
### Install `react-virtual-grid` using npm.

```npm i react-virtual-grid-table```

### Setup
```
'use client'

import { useCallback, useRef, useState } from "react";
import Image from 'next/image'
import { GridHandle, GridRequest, PropertyColumn, TemplateColumn, VirtualGrid } from "react-virtual-grid-table";

export default function Home() {
  const gridRef = useRef<GridHandle>(null);
  const [searchKey, setSearchKey] = useState<string | null>(null);

  const fetchData = useCallback(async (request: GridRequest) => {
    try {
      const params = new URLSearchParams({
        skip: request.startIndex.toString(),
        limit: request.limit.toString(),
        sortColumn: request.sortColumn ?? '',
        sortOrder: request.sortOrder ?? '',
        searchKey: searchKey ?? '',
      });
      const url = `http://your-url/brand?${params}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const data = await response.json();

      const countUrl = `http://your-url/brand/count?${searchKey}`;
      const countResponse = await fetch(countUrl);
      if (!countResponse.ok) throw new Error();
      const count = await response.json();

      return {
        items: data,
        totalCount: count,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return {
        items: [],
        totalCount: 0,
      };
    }
  }, [searchKey]);

  const handleDelete = (id: string) => {
    try {
      console.log(id)
      gridRef.current?.refresh();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (id: string) => {
    try {
      console.log(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchKey(event.target.value);
      gridRef.current?.refresh();
      console.log(searchKey);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Alhamdulillah</h1>
      <br />

      <div className="seacrh">
        <input
          type="text"
          className="seacrh-input"
          id="seach-input-id"
          placeholder="Enter Search Key..."
          onChange={handleSearch}
        />
      </div>

      <VirtualGrid
        ref={gridRef}
        fetchData={fetchData}
        height={400}
        rowHeight={30}
        sortColumn='name'
        sortOrder='DESC'
      >
        <PropertyColumn title="Name" property="name" />
        {/* <PropertyColumn title="Created Date" property="createdAt" format='date' /> */}
        <PropertyColumn title="Email" property="email" />
        <TemplateColumn title="Actions">
          <button type="button" className="action-button"
            onClick={(row) => handleEdit((row as any).id)}
          >
            <Image
              src='/images/icons8-edit-64.png'
              alt='icons8-edit-64.png'
              width={25}
              height={23}
            />
          </button>

          <button type="button" className="action-button"
            onClick={(row) => handleDelete((row as any).id)}
          >
            <Image
              src='/images/icons8-delete-128.png'
              alt='icons8-delete-128.png'
              width={25}
              height={23}
            />
          </button>
        </TemplateColumn>
      </VirtualGrid>
    </div>
  );
}
```
Now you're ready to start using the components.


### Output
<p align="center" style="background-color: #f6f8fa;">
  <img src="https://github.com/mntushar/ReactVirtualGrid/blob/main/OutputImages/Screenshot%202025-03-06%20151351.png" alt="Output Image One" width="600"/>
  <img src="https://github.com/mntushar/ReactVirtualGrid/blob/main/OutputImages/Screenshot%202025-03-06%20151227.png" alt="Output Image Two" width="600"/>
  <img src="https://github.com/mntushar/ReactVirtualGrid/blob/main/OutputImages/Screenshot%202025-03-06%20151305.png" alt="Output Image Three" width="600"/>
</p>


### Dependencies
react-virtual-grid has very few dependencies and most are managed by NPM automatically.


### Supported Browsers
react-virtual-grid aims to support all evergreen browsers and recent mobile browsers for iOS and Android. IE 9+ is also supported (although IE 9 will require some user-defined, custom CSS since flexbox layout is not supported).
