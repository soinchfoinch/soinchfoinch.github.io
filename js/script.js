// -------- CONFIG: custom month order for fantasy calendars (edit as needed) --------
// If we ever need non-Gregorian month names, put them in calendar order here.
const CUSTOM_MONTH_ORDER = [
  "January","February","March","April","May","June","July","August","September","October","November","December",
  //add custom months in the correct yearly order HERE
];

const MONTH_INDEX = (() => {
  const map = {};
  CUSTOM_MONTH_ORDER.forEach((m, i) => (map[m.toLowerCase()] = i + 1));
  return map;
})();

// -------- Helpers ! --------
function parsePossibleDate(raw) {
  if (!raw) return NaN;
  const s = String(raw).trim();

  const iso = Date.parse(s);
  if (!Number.isNaN(iso)) return iso;

  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m.map(Number);
    if (y < 100) y += 2000; 
    return new Date(y, mo - 1, d).getTime();
  }

  m = s.match(
    /^(?:(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+([A-Za-z]+)|([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?)\s*,?\s*(\d{4})?$/i
  );
  if (m) {
    let day, monthName, year;
    if (m[1] && m[2]) {
      day = parseInt(m[1], 10);
      monthName = m[2];
    } else {
      day = parseInt(m[4], 10);
      monthName = m[3];
    }
    year = m[5] ? parseInt(m[5], 10) : 2000; 
    const mi = MONTH_INDEX[monthName.toLowerCase()];
    if (mi) return new Date(year, mi - 1, day).getTime();
  }

  // Could be just a month name 
  if (MONTH_INDEX[s.toLowerCase()]) {
    return new Date(2000, MONTH_INDEX[s.toLowerCase()] - 1, 1).getTime();
  }

  return NaN;
}

function compareValues(a, b, type, asc) {
  const dir = asc ? 1 : -1;

  if (type === "number") {
    const x = parseFloat(a.replace(/[^\d.\-]/g, ""));
    const y = parseFloat(b.replace(/[^\d.\-]/g, ""));
    const xn = Number.isNaN(x), yn = Number.isNaN(y);
    if (xn && yn) return 0;
    if (xn) return 1;  
    if (yn) return -1;
    return (x - y) * dir;
  }

  if (type === "date") {
    const x = parsePossibleDate(a);
    const y = parsePossibleDate(b);
    const xn = Number.isNaN(x), yn = Number.isNaN(y);
    if (xn && yn) return 0;
    if (xn) return 1;  
    if (yn) return -1;
    return (x - y) * dir;
  }

  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x.localeCompare(y) * dir;
}

function clearSortIndicators(ths) {
  ths.forEach(th => {
    th.classList.remove("sort-asc", "sort-desc");
  });
}

function sortByColumn(table, colIndex, type, asc) {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((r1, r2) => {
    const A = r1.cells[colIndex]?.innerText.trim() || "";
    const B = r2.cells[colIndex]?.innerText.trim() || "";
    return compareValues(A, B, type, asc);
  });

  rows.forEach(r => tbody.appendChild(r));
}

// -------- App ! --------
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("characterTable");
  const tbody = table.querySelector("tbody");

  // Renderer
  fetch("data/characters.json")
    .then(res => res.json())
    .then(data => {
      data.forEach(char => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="${char.id ? `characters/${char.id}.html` : (char.page || "#")}">${char.name || ""}</a></td>
          <td>${char.birthday || ""}</td>
          <td>${char.birthplace || ""}</td>
          <td>${char.species || ""}</td>
        `;
        tbody.appendChild(tr);
      });

      const ths = Array.from(table.tHead.querySelectorAll("th"));
      ths.forEach((th, idx) => {
        th.addEventListener("click", () => {
          const type = th.dataset.type || "string";
          const isAsc = !th.classList.contains("sort-asc"); // toggle
          clearSortIndicators(ths);
          th.classList.add(isAsc ? "sort-asc" : "sort-desc");
          sortByColumn(table, idx, type, isAsc);
        });
      });

      const nameTh = ths[0];
      nameTh.classList.add("sort-asc");
      sortByColumn(table, 0, nameTh.dataset.type || "string", true);

      const search = document.getElementById("searchBox");
      if (search) {
        search.addEventListener("input", () => {
          const term = search.value.toLowerCase();
          Array.from(tbody.rows).forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
          });
        });
      }
    });
});
