'use client'

import { useCallback, useRef, useState } from "react";
import Image from 'next/image'
import { GridHandle, GridRequest, PropertyColumn, TemplateColumn, VirtualGrid } from "react-virtual-grid-table";

export default function Home() {
  const gridRef = useRef<GridHandle>(null);
  const [searchKey, setSearchKey] = useState<string | null>(null);

  const fetchData = useCallback(async (request: GridRequest) => {
    try {
      // const params = new URLSearchParams({
      //   skip: request.startIndex.toString(),
      //   limit: request.limit.toString(),
      //   sortColumn: request.sortColumn ?? '',
      //   sortOrder: request.sortOrder ?? '',
      //   searchKey: searchKey ?? '',
      // });
      // const url = `http://localhost:3000/brand?${params}`;
      const url = `https://jsonplaceholder.typicode.com/comments`;
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const data = await response.json();

      // const countUrl = `http://localhost:3000}/brand/count?${searchKey}`;
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

  const isActiveDelete = (id: string) => {
    try {

    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDelete = async (isDelete: boolean) => {
    try {
      if (isDelete) {
        gridRef.current?.refresh();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (id: string) => {
    try {
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchKey(event.target.value);
      gridRef.current?.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Alhamdulillah</h1>
      <br/>

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
            onClick={(row) => isActiveDelete((row as any).id)}
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
