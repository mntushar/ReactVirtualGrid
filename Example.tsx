import { Grid, GridHandle, GridRequest, PropertyColumn, TemplateColumn } from "./virtual-grid";

export default function Example() {
  const gridRef = useRef<GridHandle>(null);
  const route = useRouter();
  const requestHandler = useMemo(() => new Brand(route), [route]);
  const [searchKey, setSearchKey] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLodding, setIsLodding] = useState<boolean>(true);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>('');

  const fetchData = useCallback(async (request: GridRequest) => {
    try {
      const params = new URLSearchParams({
            skip: request.startIndex.toString(),
            limit: request.limit.toString(),
            sortColumn: request.sortColumn(),
            sortOrder: request.sortOrder(),
            searchKey: searchKey,
        });
      const url = `${http://localhost:3000}/list?${params}`;
      const response = await fetch(url);
      if(!response.ok) throw new Error();
      const data = await response.json();
      
      const url = `${http://localhost:3000}/count?${searchKey}`;
      const response = await fetch(url);
      if(!response.ok) throw new Error();
      const count = await response.json();
      return {
        items: data,
        totalCount: count,
      };
    } catch (error) {
      ToastHandler.Error((error as Error).message);
      console.error("Error fetching data:", error);
      return {
        items: [],
        totalCount: 0,
      };
    }
  }, [requestHandler, searchKey]);

  const isActiveDelete = (id: string) => {
    try {
      setDeleteId(id);
      setIsDelete(true);
    } catch (error) {
      ToastHandler.Error((error as Error).message);
      console.error("Error deleting item:", error);
    }
  };

  const handleDelete = async (isDelete: boolean) => {
    try {
      if (isDelete) {
        await requestHandler.delete(deleteId);
        gridRef.current?.refresh();
      }

      setIsDelete(false);
      await handleTotalCount();
    } catch (error) {
      ToastHandler.Error((error as Error).message);
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (id: string) => {
    try {
      route.push(`brand/create/${id}`);
    } catch (error) {
      ToastHandler.Error((error as Error).message);
      console.error(error);
    }
  };

  const handleAddNew = () => {
    route.push('/brand/create')
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchKey(event.target.value);
      gridRef.current?.refresh();
    } catch (error) {
      ToastHandler.Error((error as Error).message);
      console.error(error);
    }
  }

  const handleTotalCount = async () => {
    try {
      const count = await requestHandler.getCount(null);
      setTotalCount(count);
    } catch (error) {
      ToastHandler.Error((error as Error).message);
      console.error(error);
    }
  }

  useEffect(() => {
    handleTotalCount();
    setIsLodding(false);
  }, [isLodding])

  return (
    <Fragment>
      <title>Brand | List</title>
      {isLodding ? <Loading /> : (
        <Fragment>
          <div className="card card-info card-outline mb-4">
            <div id="card-header-id" className="card-header custom-card-header">
              <div className="card-title"><h5>Brand({totalCount})</h5></div>
              <div className="card-title-button">
                <button type="button" className="btn btn-primary" onClick={handleAddNew}>
                  Add New
                </button>
              </div>
            </div>
            <div className="seacrh">
              <input
                type="text"
                className="seacrh-input"
                id="seach-input-id"
                placeholder="Enter Search Key..."
                onChange={handleSearch}
              />
            </div>
            <Grid
              ref={gridRef}
              fetchData={fetchData}
              height={400}
              rowHeight={30}
              sortColumn='name'
              sortOrder='DESC'
            >
              <PropertyColumn title="Name" property="name" />
              <PropertyColumn title="Created Date" property="createdAt" format='date' />
              <TemplateColumn title="Actions">
                <button type="button" className="action-button"
                  onClick={(row) => handleEdit((row as any).id)}
                >
                  <Tooltip text="Edit">
                    <Image
                      src='/images/icons8-edit-64.png'
                      alt='icons8-edit-64.png'
                      width={25}
                      height={23}
                    />
                  </Tooltip>
                </button>

                <button type="button" className="action-button"
                  onClick={(row) => isActiveDelete((row as any).id)}
                >
                  <Tooltip text="Delete">
                    <Image
                      src='/images/icons8-delete-128.png'
                      alt='icons8-delete-128.png'
                      width={25}
                      height={23}
                    />
                  </Tooltip>
                </button>
              </TemplateColumn>
            </Grid>
          </div>
        </Fragment>
      )
      }

      {isDelete ? <DeleteAlertComponent callBack={handleDelete} /> : null}
    </Fragment >
  );
}
