// Load characters from JSON
fetch("data/characters.json")
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector("#characterTable tbody");
    data.forEach(char => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="characters/${char.id}.html">${char.name}</a></td>
        <td>${char.birthday}</td>
        <td>${char.birthplace}</td>
        <td>${char.species}</td>
      `;
      tableBody.appendChild(row);
    });

    // Search filter
    document.getElementById("searchBox").addEventListener("input", function() {
      const filter = this.value.toLowerCase();
      Array.from(tableBody.rows).forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    });
  });

