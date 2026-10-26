import { useEffect, useState } from "react";
import { getData } from "./api.js";

export default function MeterDetails({ meterId }) {
  const [meter, setMeter] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!meterId) {
      setMeter(null);
      setReadings([]);
      return;
    }

    async function loadDetails() {
      setLoading(true);
      setError("");
      setMeter(null);
      setReadings([]);

      try {
        const details = await getData(`/meters/${encodeURIComponent(meterId)}`);
        const result = await getData(
          `/meters/${encodeURIComponent(meterId)}/consumption`,
        );
        setMeter(details);
        setReadings(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [meterId]);

  return (
    <section className="panel details-panel">
      <div className="section-heading">
        <div><h2>Meter details</h2><p>Choose a meter above to see its readings.</p></div>
      </div>
      {loading && <p className="message">Loading meter details...</p>}
      {error && <p className="message error">{error}</p>}
      {!meterId && <p className="empty-details">Select a meter from the list.</p>}
      {meter && (
        <>
          <div className="detail-grid">
            <Detail label="Meter ID" value={meter.meterId} />
            <Detail label="Serial number" value={meter.serialNo} />
            <Detail label="Make" value={meter.make} />
            <Detail label="Installation status" value={meter.installStatus} />
            <Detail label="Latitude" value={meter.location.latitude} />
            <Detail label="Longitude" value={meter.location.longitude} />
          </div>
          <h2>Consumption readings</h2>
          <div className="table-wrap readings-table">
            <table>
              <thead><tr><th>Time</th><th>kWh</th><th>kVAh</th><th>Voltage R</th></tr></thead>
              <tbody>
                {readings.map((item, index) => (
                  <tr key={`${item.timestamp}-${index}`}>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td>{item.kwh.toLocaleString()}</td>
                    <td>{item.kvah.toLocaleString()}</td>
                    <td>{item.voltageR} V</td>
                  </tr>
                ))}
                {readings.length === 0 && (
                  <tr><td className="table-message" colSpan="4">No readings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Detail({ label, value }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}
