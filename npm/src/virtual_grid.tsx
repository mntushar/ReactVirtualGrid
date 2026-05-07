import React, { useEffect, useState, forwardRef, ReactNode, useRef, useCallback, useImperativeHandle, ReactElement } from "react";

import "react-virtual-grid-table/dist/virtual_grid.css";

interface PropertyColumnProps {
  title: string;
  property: string;
  format?: string | null;
  width?: string | number;
}

interface TemplateColumnProps {
  title: string;
  children?: ReactNode;
  width?: string | number;
}

const PropertyColumn: React.FC<PropertyColumnProps> = () => null;
const TemplateColumn: React.FC<TemplateColumnProps> = () => null;

interface FetchDataResult {
  items: any[];
  totalCount: number;
}

type FetchDataFunction = (request: {
  startIndex: number;
  limit: number;
  sortOrder: string | null;
  sortColumn: string;
  cursor: string | null;
  cursorSortColumnValue: string | null;
}) => Promise<FetchDataResult>;

interface GridProps {
  fetchData: FetchDataFunction;
  height: number;
  rowHeight: number;
  sortOrder?: string | null;
  sortColumn: string;
  cursor?: string | null;
  children: ReactNode;
}

type CursorInfo = {
  cursor: string | null;
  cursorSortColumnValue: string | null;
};

export interface GridHandle {
  refresh: (isReset?: boolean | null) => void;
  refreshAfterDelete: (identity: string, identityValue: string) => void;
}

export interface GridRequest {
  startIndex: number;
  limit: number;
  sortOrder: string | null;
  sortColumn: string;
  cursor: string | null;
  cursorSortColumnValue: string | null;
}

const VirtualGrid = forwardRef<GridHandle, GridProps>(
  (
    {
      fetchData,
      height,
      rowHeight,
      sortOrder = null,
      sortColumn,
      cursor = null,
      children,
    },
    ref
  ) => {
    const buffer = 10;
    const initialVisibleRows = Math.ceil(height / rowHeight) + buffer * 2;
    const [data, setData] = useState<Map<number, any>>(new Map());
    const [totalCount, setTotalCount] = useState(0);
    const [isRefresh, setIsRefresh] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const [propertyColumns, setPropertyColumns] = useState<PropertyColumnProps[]>([]);
    const [templateColumns, setTemplateColumns] = useState<TemplateColumnProps[]>([]);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef({
      sortOrder,
      sortColumn,
      requestId: 0,
      cursor
    });
    const scrollTimeoutRef = useRef<number | null>(null);
    const cursorMapRef = useRef<Map<number, CursorInfo>>(new Map());

    // Format width values
    const formatWidth = (width?: string | number) => {
      if (!width) return undefined;
      if (typeof width === 'number') return `${width}px`;
      return width;
    };

    // cursor pagination
    const getCursorForStart = (start: number): CursorInfo => {
      let keys = Array.from(cursorMapRef.current.keys()).sort((a, b) => a - b);

      for (let i = keys.length - 1; i >= 0; i--) {
        if (keys[i] < start) {
          return cursorMapRef.current.get(keys[i])!;
        }
      }

      return {
        cursor: null,
        cursorSortColumnValue: null,
      };

    };

    const saveNextCursor = (
      start: number,
      items: any[]
    ) => {
      if (!items.length) return;

      const lastItem = items[items.length - 1];

      const cursorField = requestRef.current.cursor;
      const cursorSortField = requestRef.current.sortColumn;

      cursorMapRef.current.set(start, {
        cursor: cursorField ? String(lastItem?.[cursorField] ?? "") || null : null,
        cursorSortColumnValue: cursorSortField
          ? String(lastItem?.[cursorSortField] ?? "") || null
          : null,
      });
    };

    const fetchDataForRange = useCallback(async (start: number, end: number) => {
      const currentRequestId = Date.now();
      requestRef.current.requestId = currentRequestId;

      try {
        let cursorInfo: CursorInfo = { cursor: null, cursorSortColumnValue: null };
        let useCursor = !!(requestRef.current.cursor);
        if (useCursor) {
          cursorInfo = getCursorForStart(start);
          if (!cursorInfo.cursor && start > 0) {
            cursorInfo = cursorMapRef.current.get(0) || { cursor: null, cursorSortColumnValue: null };
          }
        }

        const count = end - start + 1;
        const params: any = {
          limit: count,
          sortOrder: requestRef.current.sortOrder,
          sortColumn: requestRef.current.sortColumn,
        };

        if (useCursor && cursorInfo.cursor) {
          params.cursor = cursorInfo.cursor;
          params.cursorSortColumnValue = cursorInfo.cursorSortColumnValue;
        } else {
          params.startIndex = start;
        }

        const result = await fetchData(params);

        if (requestRef.current.requestId !== currentRequestId) return;

        setData(prev => {
          const newMap = new Map(prev);
          if (useCursor && cursorInfo.cursor) {
            const currentSize = prev.size;
            result.items.forEach((item, idx) => {
              newMap.set(currentSize + idx, item);
            });
            saveNextCursor(currentSize, result.items);
          } else {
            result.items.forEach((item, idx) => {
              newMap.set(start + idx, item);
            });
            if (cursor) {
              saveNextCursor(start, result.items);
            }
          }
          return newMap;
        });

        if (result.totalCount !== totalCount) {
          setTotalCount(result.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }, [fetchData, totalCount, cursor]);

    const refresh = useCallback(async (isReset?: boolean | null) => {
      if (isReset) {
        setIsReset(true);
        requestRef.current.cursor = null;
        const currentRequestId = Date.now();
        requestRef.current.requestId = currentRequestId;
        setVisibleRange({ start: 0, end: initialVisibleRows - 1 });
        setTimeout(() => {
          setIsReset(false);
        }, 10)
      }
      else {
        setIsRefresh(true);
        const currentRequestId = Date.now();
        requestRef.current.requestId = currentRequestId;
        setTimeout(() => {
          setIsRefresh(false);
        }, 10)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshAfterDelete = useCallback(
      async (identity: string, identityValue: string) => {
        setData(prev => {
          let deletedKey: number | null = null;

          for (const [key, value] of prev.entries()) {
            if (value?.[identity] === identityValue) {
              deletedKey = key;
              break;
            }
          }

          if (deletedKey === null) return prev;

          const newMap = new Map(prev);

          for (let i = deletedKey; i < totalCount - 1; i++) {
            const nextValue = newMap.get(i + 1);

            if (nextValue !== undefined) {
              newMap.set(i, nextValue);
            } else {
              newMap.delete(i);
            }
          }

          newMap.delete(totalCount - 1);

          return newMap;
        });

        setTotalCount(prev => Math.max(0, prev - 1));
      },
      [totalCount]
    );

    useImperativeHandle(ref, () => ({
      refresh,
      refreshAfterDelete,
    }), [refresh, refreshAfterDelete]);

    // Column extraction
    useEffect(() => {
      const pc: PropertyColumnProps[] = [];
      const tc: TemplateColumnProps[] = [];

      React.Children.forEach(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === PropertyColumn) {
            const element = child as ReactElement<PropertyColumnProps>;
            pc.push({
              title: element.props.title,
              property: element.props.property,
              format: element.props.format,
              width: element.props.width
            });
          } else if (child.type === TemplateColumn) {
            const element = child as ReactElement<TemplateColumnProps>;
            tc.push({
              title: element.props.title,
              children: element.props.children,
              width: element.props.width
            });
          }
        }
      });

      setPropertyColumns(pc);
      setTemplateColumns(tc);
    }, [children]);

    // scroll handler
    const handleScroll = useCallback(() => {
      if (!containerRef.current) return;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        const { scrollTop, clientHeight } = containerRef.current!;
        const start = Math.floor(scrollTop / rowHeight) - buffer;
        const end = Math.ceil((scrollTop + clientHeight) / rowHeight) + buffer;

        setVisibleRange({
          start: Math.max(0, start),
          end: Math.min(totalCount - 1, end),
        });
      }, 200);
    }, [rowHeight, buffer, totalCount]);

    // Fetch data when visible range changes
    useEffect(() => {
      const { start, end } = visibleRange;
      if (start === 0 && end === 30) return;
      if (start >= 0 && end >= start) {
        fetchDataForRange(start, end);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleRange]);

    // Initial data load
    useEffect(() => {
      const fetchData = async () => {
        if (isInitial) {
          await fetchDataForRange(0, initialVisibleRows - 1);
          setIsInitial(false);
        }

        if (isRefresh) {
          const { start, end } = visibleRange;
          await fetchDataForRange(start, end);
        }
      }
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRefresh]);

    useEffect(() => {
      const fetchData = async () => {
        if (isReset && !isInitial) {
          await fetchDataForRange(visibleRange.start, (initialVisibleRows - 1));
          requestRef.current.cursor = cursor;
        }
      }
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReset]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    const applyFormat = (value: any, format: string) => {
      if (value === undefined || value === null) return "...";

      switch (format) {
        case "uppercase":
          return String(value).toUpperCase();
        case "lowercase":
          return String(value).toLowerCase();
        case "date":
          return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`;
        default:
          return value;
      }
    };

    const injectRowData = (child: React.ReactNode, rowData: any): React.ReactNode => {
      if (!React.isValidElement(child)) return child;

      const element = child as React.ReactElement<any>;

      // If the child has an onClick, inject rowData
      if (element.props.onClick) {
        return React.cloneElement(element, {
          onClick: () => element.props.onClick(rowData),
        });
      }

      // Otherwise, recurse into its children
      return React.cloneElement(element, {
        children: React.Children.map(element.props.children, (c) =>
          injectRowData(c, rowData)
        ),
      });
    };

    const renderRow = (index: number) => {
      const rowData = data.get(index);

      return (
        <tr
          key={index}
          style={{
            position: "absolute",
            top: index * rowHeight,
            height: rowHeight,
            width: "100%",
          }}
        >
          {propertyColumns.map((col, colIndex) => (
            <td
              key={colIndex}
              style={{ width: formatWidth(col.width) }}
            >
              {col.format
                ? applyFormat(rowData?.[col.property], col.format)
                : rowData?.[col.property] || "..."}
            </td>
          ))}
          {templateColumns.map((template, templateIndex) => (
            <td
              key={templateIndex}
              style={{ width: formatWidth(template.width) }}
            >
              {React.Children.map(template.children, (child) =>
                injectRowData(child, rowData)
              )}
            </td>
          ))}
        </tr>
      );
    };

    return (
      <div
        ref={containerRef}
        className="virtual-grid-container"
        style={{
          height,
          overflow: "auto",
          position: "relative"
        }}
        onScroll={handleScroll}
      >
        <table style={{ width: "100%", position: "relative" }}>
          <thead>
            <tr>
              {propertyColumns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    height: rowHeight,
                    width: formatWidth(col.width)
                  }}
                >
                  {col.title}
                </th>
              ))}
              {templateColumns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    height: rowHeight,
                    width: formatWidth(col.width)
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ position: "relative", height: totalCount * rowHeight || 'auto' }}>
            {isInitial ? (
              <tr style={{ backgroundColor: "white" }}>
                <td style={{ height: height }} className="spinner-container" colSpan={propertyColumns.length + templateColumns.length}>
                  <div className="spinner"></div>
                </td>
              </tr>
            ) : (
              Array.from(
                { length: visibleRange.end - visibleRange.start + 1 },
                (_, i) => visibleRange.start + i
              ).map(renderRow)
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

VirtualGrid.displayName = "VirtualGrid";

export { VirtualGrid, PropertyColumn, TemplateColumn };