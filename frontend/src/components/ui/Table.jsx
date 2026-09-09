export default function Table({ columns, rows, rowKey = 'id', onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-800 shadow-soft">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-700 bg-ink-900">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left font-semibold text-ink-500 text-[11px] uppercase tracking-wide px-4 py-3.5 whitespace-nowrap"
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
              className={`border-b border-ink-700 last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-volt-500/5' : ''
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
