function parseBirthday(birthday) {
  if (!birthday) return 9999;

  let cleaned = birthday
    .replace(/\./g, '') 
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1') 
    .trim();

  const months = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12
  };

  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return 0;

  const month = months[parts[0].toLowerCase()];
  const day = parseInt(parts[1], 10);

  if (!month || isNaN(day)) return 0;

  return month * 100 + day;
}

function sortTableByColumn(table, columnIndex, type = "string", asc = true) {
  const dirModifier = asc ? 1 : -1;
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  const sortedRows = rows.sort((a, b) => {
    const aText = a.querySelector(`td:nth-child(${columnIndex + 1})`)?.textContent.trim() || "";
    const bText = b.querySelector(`td:nth-child(${columnIndex + 1})`)?.textContent.trim() || "";

    if (type === "number") return (parseFloat(aText) - parseFloat(bText)) * dirModifier;
    if (type === "date") return (parseBirthday(aText) - parseBirthday(bText)) * dirModifier;
    return aText.localeCompare(bText) * dirModifier;
  });

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  tbody.append(...sortedRows);

  // Update sort classes
  table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
  const th = table.querySelector(`th:nth-child(${columnIndex + 1})`);
  if (th) {
    th.classList.toggle("th-sort-asc", asc);
    th.classList.toggle("th-sort-desc", !asc);
  }
}

// Enable clicking headers to sort
document.querySelectorAll("th").forEach((header, index) => {
  header.addEventListener("click", () => {
    const table = header.closest("table");
    const currentAsc = header.classList.contains("th-sort-asc");
    const type = header.dataset.type || "string";
    sortTableByColumn(table, index, type, !currentAsc);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("characterTable");
  const tbody = table.querySelector("tbody");

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

      // Default sort by Name column (0)
      sortTableByColumn(table, 0, "string", true);

      // Search functionality
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
