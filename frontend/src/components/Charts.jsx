import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

export default function Charts({ district = "Selected district" }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      district,
    });

    setLoading(true);
    setError("");

    fetch(`/history?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.detail || "Unable to load rainfall history.");
        }

        return payload;
      })
      .then((payload) => {
        if (!controller.signal.aborted) {
          setHistory(payload);
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [district]);

  const months = useMemo(() => history?.months?.slice(-12) || [], [history]);

  const data = useMemo(
    () => ({
      labels: months.map((entry) => formatMonth(entry.month)),
      datasets: [
        {
          label: "Rainfall",
          data: months.map((entry) => entry.rain_mm),
          borderColor: "#34d399",
          backgroundColor: "rgba(16, 185, 129, 0.14)",
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#a7f3d0",
          pointBorderColor: "#0f2d27",
          pointBorderWidth: 2,
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [months],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (context) => `${Number(context.parsed.y || 0).toFixed(1)} mm`,
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            color: "rgba(226, 232, 240, 0.65)",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: {
            color: "rgba(148, 163, 184, 0.14)",
          },
          ticks: {
            color: "rgba(226, 232, 240, 0.65)",
            padding: 8,
            callback: (value) => `${value} mm`,
          },
          title: {
            display: true,
            text: "Rainfall (mm)",
            color: "rgba(226, 232, 240, 0.7)",
          },
        },
      },
    }),
    [],
  );

  const districtName = useMemo(() => {
  const d = history?.district ?? district;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") return d.name || "Selected district";
  return "Selected district";
}, [history, district]);

  return (
    <section className="glass-emerald charts-card" aria-labelledby="rainfall-history-title">
      <div className="charts-card-header">
        <div>
          <p className="charts-eyebrow">NASA POWER · {history?.data_source || "Historical climate data"}</p>
          <h2 id="rainfall-history-title">12-month rainfall history</h2>
          <p className="charts-subtitle">
            Latest monthly rainfall observations for {districtName}
          </p>
        </div>
        <span className="charts-unit">Millimeters</span>
      </div>

      <div className="charts-body" aria-live="polite">
        {loading && <p className="charts-state">Loading rainfall history…</p>}

        {!loading && error && (
          <p className="charts-state charts-state-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && months.length === 0 && (
          <p className="charts-state">No monthly rainfall history is available.</p>
        )}

        {!loading && !error && months.length > 0 && (
          <>
            <div className="charts-canvas" style={{ height: 320, position: "relative" }}>
              <Line
                data={data}
                options={options}
                aria-label={`12-month rainfall history for ${districtName}`}
              />
            </div>
            <p className="charts-accessible-summary">
              {districtName} received {months
                .reduce((total, entry) => total + Number(entry.rain_mm || 0), 0)
                .toFixed(1)} millimeters of rainfall across the latest {months.length} months.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
