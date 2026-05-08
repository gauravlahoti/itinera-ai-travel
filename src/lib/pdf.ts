import { Trip } from "@/types";

export async function exportTripToPDF(trip: Trip): Promise<void> {
  // Dynamically import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageH - margin) addPage();
  };

  // ── Header ──────────────────────────────────────────
  doc.setFillColor(30, 86, 49); // primary green
  doc.rect(0, 0, pageW, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ITINERA", margin, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Bespoke Journeys Crafted by AI", margin, 28);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(trip.title, margin, 38);
  y = 52;

  // ── Trip Summary Card ────────────────────────────────
  doc.setFillColor(250, 250, 247);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");
  doc.setDrawColor(232, 230, 223);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "S");

  doc.setTextColor(26, 26, 23);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const summaryItems = [
    ["📍 Destination", trip.destination.join(" → ")],
    ["📅 Dates", `${trip.startDate} — ${trip.endDate}`],
    ["👥 Travelers", `${trip.travelers}`],
    ["💰 Budget", `${trip.budget.total} ${trip.budget.currency}`],
    ["🏃 Pace", trip.pace.charAt(0).toUpperCase() + trip.pace.slice(1)],
    ["🎨 Vibes", trip.vibes.join(", ")],
  ];

  const colW = contentW / 3;
  summaryItems.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * colW + 4;
    const itemY = y + 7 + row * 12;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 107, 101);
    doc.text(label, x, itemY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 23);
    doc.text(value, x, itemY + 5);
  });

  y += 36;

  // ── Days ─────────────────────────────────────────────
  for (const day of trip.days) {
    checkPageBreak(20);

    // Day Header
    doc.setFillColor(201, 98, 43); // secondary brown
    doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Day ${day.dayNumber}: ${day.city}  ·  ${day.date}  ·  ${day.weather.tempC}°C ${day.weather.condition}`, margin + 4, y + 8.5);
    y += 16;

    if (day.notes) {
      checkPageBreak(10);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(107, 107, 101);
      doc.text(`Note: ${day.notes}`, margin + 2, y);
      y += 7;
    }

    // Activities
    for (const activity of day.activities) {
      checkPageBreak(22);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(232, 230, 223);
      doc.roundedRect(margin, y, contentW, 18, 2, 2, "FD");

      // Time badge
      doc.setFillColor(30, 86, 49);
      doc.roundedRect(margin + 2, y + 3, 16, 7, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(activity.startTime, margin + 5, y + 7.8);

      // Activity name
      doc.setTextColor(26, 26, 23);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(activity.name, margin + 22, y + 8);

      // Duration + cost
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 107, 101);
      const meta = [
        `⏱ ${activity.durationMin} min`,
        activity.cost.amount > 0 ? `💰 ${activity.cost.amount} ${activity.cost.currency}${activity.cost.perPerson ? "/pp" : ""}` : "Free",
        `📍 ${activity.location.neighborhood || activity.location.address.split(",")[0]}`,
      ].join("   ");
      doc.text(meta, margin + 22, y + 14);

      // Description
      if (activity.description) {
        // skip showing description in compact mode to save space
      }

      y += 21;
    }
    y += 6;
  }

  // ── Logistics ─────────────────────────────────────────
  checkPageBreak(60);

  doc.setFillColor(30, 86, 49);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Logistics & Travel Info", margin + 4, y + 8.5);
  y += 16;

  const logItems = [
    ["Visa & Entry", trip.logistics.visa],
    ["Currency", `${trip.logistics.currency.code} (1 USD ≈ ${trip.logistics.currency.rateToUSD})`],
    ["Power Adapter", trip.logistics.powerPlug],
    ["Tipping", trip.logistics.tipping],
    ["Transport", trip.logistics.transport],
    ["SIM Card", trip.logistics.simCard],
  ];

  for (const [label, value] of logItems) {
    checkPageBreak(12);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 23);
    doc.text(label + ":", margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 107, 101);
    const lines = doc.splitTextToSize(value, contentW - 35);
    doc.text(lines, margin + 35, y);
    y += lines.length * 5 + 3;
  }

  // ── Useful Phrases ─────────────────────────────────────
  checkPageBreak(30);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(26, 26, 23);
  doc.text("Useful Phrases", margin, y);
  y += 5;

  for (const phrase of trip.logistics.phrases.slice(0, 5)) {
    checkPageBreak(8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 107, 101);
    doc.text(`${phrase.en}: `, margin + 2, y);
    doc.setTextColor(26, 26, 23);
    doc.text(`${phrase.local}  (${phrase.phonetic})`, margin + 28, y);
    y += 6;
  }

  // ── Packing List ──────────────────────────────────────
  checkPageBreak(20);
  y += 6;
  doc.setFillColor(30, 86, 49);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Packing Checklist", margin + 4, y + 8.5);
  y += 16;

  const cols = 2;
  const colWidth = contentW / cols;
  for (let i = 0; i < trip.packingList.length; i++) {
    if (i % cols === 0) checkPageBreak(8);
    const col = i % cols;
    const x = margin + col * colWidth;
    const itemY = i % cols === 0 ? y : y - 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 23);
    doc.text(`☐  ${trip.packingList[i].name}`, x + 2, itemY);

    if (col === cols - 1 || i === trip.packingList.length - 1) {
      y += 6;
    }
  }

  // ── Footer ────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated by Itinera · ${new Date().toLocaleDateString()}  ·  Page ${p} of ${totalPages}`,
      pageW / 2,
      pageH - 8,
      { align: "center" }
    );
  }

  doc.save(`${trip.title.replace(/[^a-z0-9]/gi, "_")}_itinerary.pdf`);
}
