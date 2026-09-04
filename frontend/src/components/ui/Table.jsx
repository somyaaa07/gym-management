export default function Table({ columns, rows, rowKey = 'id', onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-600">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-600 bg-ink-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left font-medium text-ink-400 text-xs px-4 py-3 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-ink-700/70 last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-ink-800/70' : ''
              } transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3.5 text-bone-100 align-middle whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
