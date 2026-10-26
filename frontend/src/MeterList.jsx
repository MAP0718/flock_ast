import { useState } from "react";

export default function MeterList({
  meters, page, pages, total, loading, error, selectedId,
  onSelect, onPageChange, onSearch,
}) {
  const [searchText, setSearchText] = useState("");

  function submitSearch(event) {
    event.preventDefault();
    onSearch(searchText.trim());
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div><h2>Meters</h2><p>{total} meters found</p></div>
      </div>
      <form className="search-form" onSubmit={submitSearch}>
        <input
          aria-label="Search meters"
          placeholder="Search by meter ID, serial, make or DT code"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <button>Search</button>
      </form>
      {error && <p className="message error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>Meter ID</th><th>Serial number</th><th>Make</th>
            <th>Phase</th><th>Status</th><th>DT code</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td className="table-message" colSpan="6">Loading meters...</td></tr>
            ) : meters.length === 0 ? (
              <tr><td className="table-message" colSpan="6">No meters found.</td></tr>
            ) : meters.map((meter) => (
              <tr
                key={meter.meterId}
                className={selectedId === meter.meterId ? "selected-row" : ""}
                onClick={() => onSelect(meter.meterId)}
              >
                <td><button className="meter-link" type="button">{meter.meterId}</button></td>
                <td>{meter.serialNo}</td><td>{meter.make}</td>
                <td>{meter.phaseType}</td><td>{meter.installStatus}</td><td>{meter.dtCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>Page {page} of {pages}</span>
        <div>
          <button disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>Previous</button>
          <button disabled={page >= pages || loading} onClick={() => onPageChange(page + 1)}>Next</button>
        </div>
      </div>
    </section>
  );
}
