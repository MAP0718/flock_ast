import { useEffect, useState } from "react";
import { getData } from "./api.js";
import MeterList from "./MeterList.jsx";
import MeterDetails from "./MeterDetails.jsx";

export default function Dashboard({ onLogout }) {
  const [meters, setMeters] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const visibleMeters = meters.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    let ignoreResults = false;

    async function loadMeters() {
      setLoading(true);
      setError("");
      try {
        const query = encodeURIComponent(search);
        const firstPage = await getData(`/meters?q=${query}&page=1`);
        const allMeters = [...firstPage.data];
        for (let nextPage = 2; nextPage <= firstPage.totalPages; nextPage += 1) {
          const result = await getData(`/meters?q=${query}&page=${nextPage}`);
          allMeters.push(...result.data);
        }
        if (ignoreResults) return;
        setMeters(allMeters);
        setTotal(firstPage.total);
        setPageSize(firstPage.pageSize);
      } catch (err) {
        if (ignoreResults) return;
        setError(err.message);
        setMeters([]);
      } finally {
        if (!ignoreResults) setLoading(false);
      }
    }

    loadMeters();
    return () => { ignoreResults = true; };
  }, [search]);

  function searchMeters(value) {
    setSelectedId("");
    setPage(1);
    setSearch(value);
  }

  return (
    <main className="page">
      <header className="page-header">
        <button className="logout-button" onClick={onLogout}>Log out</button>
        <p className="eyebrow">METER MANAGEMENT</p>
        <h1>Meter dashboard</h1>
        <p className="subheading">Search meters and view their readings.</p>
      </header>
      <MeterList
        meters={visibleMeters}
        page={page}
        pages={pages}
        total={total}
        loading={loading}
        error={error}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPageChange={setPage}
        onSearch={searchMeters}
      />
      <MeterDetails meterId={selectedId} />
    </main>
  );
}
