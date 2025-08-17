function parseBirthday(birthday) {
  if (!birthday) return null;

  let cleaned = birthday
    .replace(/\./g, '') 
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1') 
    .trim();

  const months = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12
  };

  let parts = cleaned.split(/\s+/);
  if (parts.length < 2) return null;

  let month = months[parts[0].toLowerCase()];
  let day = parseInt(parts[1], 10);

  if (!month || isNaN(day)) return null;

  return month * 100 + day;
}

function sortTableByColumn(table, columnIndex, type, asc = true) {
  const dirModifier = asc ? 1 : -1;
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  const sortedRows = rows.sort((a, b) => {
    let aText = a.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
    let bText = b.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();

    if (type === "number") {
      return (parseFloat(aText) - parseFloat(bText)) * dirModifier;
    } else if (type === "date") {
      let aVal = parseBirthday(aText) || 0;
      let bVal = parseBirthday(bText) || 0;
      return (aVal - bVal) * dirModifier;
    } else {
      return aText.localeCompare(bText) * dirModifier;
    }
  });

  while (table.tBodies[0].firstChild) {
    table.tBodies[0].removeChild(table.tBodies[0].firstChild);
  }
  table.tBodies[0].append(...sortedRows);

  // Toggle sort state
  table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
  table.querySelector(`th:nth-child(${columnIndex + 1})`).classList.toggle("th-sort-asc", asc);
  table.querySelector(`th:nth-child(${columnIndex + 1})`).classList.toggle("th-sort-desc", !asc);
}

// Enable clicking headers to sort
document.querySelectorAll("th").forEach((header, index) => {
  header.addEventListener("click", () => {
    const tableElement = header.closest("table");
    const currentIsAscending = header.classList.contains("th-sort-asc");
    const type = header.getAttribute("data-type") || "string";
    sortTableByColumn(tableElement, index, type, !currentIsAscending);
  });
});

// -------- App --------
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("characterTable");
  const tbody = table.querySelector("tbody");

  // Load JSON and render rows
  fetch("data/characters.json")
    .then(res => res.json())
    .then(data => {
      data.forEach(char => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="${char.id ? `characters/${char.id}.html` : (char.page || "#")}">${char.name || ""}</a></td>
          <td>${char.species || ""}</td>
          <td>${char.subspecies || ""}</td>
          <td>${char.height || ""}</td>
          <td>${char.birthday || ""}</td>
          <td>${char.sign || ""}</td>
          <td>${char.birthplace || ""}</td>
          <td>${char.vehicle || ""}</td>
          <td>${char.pets || ""}</td>
        `;
        tbody.appendChild(tr);
      });

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
