import React, { useEffect, useState, forwardRef, ReactNode, useRef, useCallback, useImperativeHandle } from "react";
import "./virtual_grid.css";

interface PropertyColumnProps {
  title: string;
  property: string;
  format?: string | null;
}

interface TemplateColumnProps {
  title: string;
  children?: ReactNode;
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
}) => Promise<FetchDataResult>;

interface GridProps {
  fetchData: FetchDataFunction;
  height: number;
  rowHeight: number;
  sortOrder?: string | null;
  sortColumn: string;
  children: ReactNode;
}

export interface GridRequest {
  startIndex: number;
  limit: number;
  sortOrder: string | null;
  sortColumn: string;
}

export interface GridHandle {
  refresh: () => void;
}

const VirtualGrid = forwardRef<GridHandle, GridProps>(
  (
    {
      fetchData,
      height,
      rowHeight,
      sortOrder = null,
      sortColumn,
      children,
    },
    ref
  ) => {
    const buffer = 10;
    const [data, setData] = useState<Map<number, any>>(new Map());
    const [totalCount, setTotalCount] = useState(0);
    const [isRefresh, setIsRefresh] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const [propertyColumns, setPropertyColumns] = useState<PropertyColumnProps[]>([]);
    const [templateColumns, setTemplateColumns] = useState<TemplateColumnProps[]>([]);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef({
      sortOrder,
      sortColumn,
      requestId: 0,
    });
    const scrollTimeoutRef = useRef<number | null>(null);

    // Data fetching
    const fetchDataForRange = useCallback(async (start: number, end: number) => {
      const currentRequestId = Date.now();
      requestRef.current.requestId = currentRequestId;

      try {
        const count = end - start + 1;
        const result = await fetchData({
          startIndex: start,
          limit: count,
          sortOrder: requestRef.current.sortOrder,
          sortColumn: requestRef.current.sortColumn,
        });

        if (requestRef.current.requestId !== currentRequestId) {
          return;
        }

        setData(prev => {
          const newMap = new Map(prev);
          result.items.forEach((item, index) => {
            newMap.set(start + index, item);
          });
          return newMap;
        });

        if (result.totalCount !== totalCount) {
          setTotalCount(result.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }, [fetchData, totalCount]);

    const refresh = useCallback(async () => {
      setIsRefresh(true);
      const currentRequestId = Date.now();
      requestRef.current.requestId = currentRequestId;
      setTimeout(() => {
        setIsRefresh(false);
      }, 10)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      refresh,
    }), [refresh]);

    // Column extraction
    useEffect(() => {
      const pc: PropertyColumnProps[] = [];
      const tc: TemplateColumnProps[] = [];

      React.Children.forEach(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === PropertyColumn) {
            pc.push({
              title: child.props.title,
              property: child.props.property,
              format: child.props.format
            });
          } else if (child.type === TemplateColumn) {
            tc.push({ title: child.props.title, children: child.props.children });
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
          const initialVisibleRows = Math.ceil(height / rowHeight) + buffer * 2;
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

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    const applyFormat = (value: any, format: string) => {
      if (!value) return "...";

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
            <td key={colIndex}>{col.format
              ? applyFormat(rowData?.[col.property], col.format)
              : rowData?.[col.property] || "..."}</td>
          ))}
          {templateColumns.map((template, templateIndex) => (
            <td key={templateIndex}>
              {React.Children.map(template.children, child =>
                React.isValidElement(child)
                  ? React.cloneElement(child as React.ReactElement, {
                    onClick: () => child.props.onClick?.(rowData),
                  })
                  : child
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
        style={{ height, overflowY: "auto", position: "relative" }}
        onScroll={handleScroll}
      >
        <table style={{ width: "100%", position: "relative" }}>
          <thead>
            <tr>
              {propertyColumns.map((col, idx) => (
                <th key={idx} style={{ height: rowHeight }}>{col.title}</th>
              ))}
              {templateColumns.map((col, idx) => (
                <th key={idx} style={{ height: rowHeight }}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ position: "relative", height: totalCount * rowHeight || 'auto' }}>
            {isInitial ? (
              <tr style={{ backgroundColor: "white" }}>
                <td style={{ height: height }} className="spinner-container">
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
