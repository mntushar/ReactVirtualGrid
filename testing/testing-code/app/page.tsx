'use client'

import { useCallback, useRef, useState } from "react";
import Image from 'next/image'
import { GridHandle, GridRequest, PropertyColumn, TemplateColumn, VirtualGrid } from "react-virtual-grid-table";

// import { GridHandle, GridRequest, PropertyColumn, TemplateColumn, VirtualGrid } from "../../../src/virtual_grid";
// import '../../../src/virtual_grid.css'

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
      // const url = `http://your-url/brand?${params}`;
      // const response = await fetch(url);
      // if (!response.ok) throw new Error();
      // const data = await response.json();

      const url = `https://jsonplaceholder.typicode.com/comments`;
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const data = await response.json();
      const itemData = data.map(({ id, body }: { id: number, body: string }) => ({
        id: id.toString(),
        name: body.toString()
      }));

      // const countUrl = `http://your-url/brand/count?${searchKey}`;
      // const countResponse = await fetch(countUrl);
      // if (!countResponse.ok) throw new Error();
      // const count = await response.json();

      return {
        items: data,
        totalCount: 500,
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
    <div style={{margin: '50px'}}>
      <h1>Alhamdulillah</h1>
      <br />

      <div className="seacrh" style={{margin: '10px'}}>
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
        <PropertyColumn title="Name" property="name" width='27%' />
        {/* <PropertyColumn title="Created Date" property="createdAt" format='date' /> */}
        <PropertyColumn title="Email" property="email" />
        <PropertyColumn title="Email" property="email" />
        <PropertyColumn title="Email" property="email" />
        <PropertyColumn title="Email" property="email" />
        <PropertyColumn title="Email" property="email" />
        <PropertyColumn title="Email" property="email" />
        <TemplateColumn title="Actions" width='5%'>
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
