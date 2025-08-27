(() => {
  const input = document.getElementById("barraBusqueda");
  const btn = document.getElementById("buscar");
  const cont = document.getElementById("resultados");

  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function render(items) {
    cont.innerHTML = "";
    if (!items.length) {
      cont.innerHTML = "<p>No se encontraron resultados</p>";
      return;
    }
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "resultado";
      card.innerHTML = `
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.nombre}" class="resultado-img">` : ""}
        <h3>${item.nombre}${item.pais ? ` (${item.pais})` : ""}</h3>
        <p>${item.descripcion || ""}</p>
        <button class="visit-btn">Visit</button>
      `;
      cont.appendChild(card);
    });
  }

  async function buscar() {
    const q = normalize(input.value.trim());
    if (!q) {
      cont.innerHTML = "<p>Escribe algo para buscar</p>";
      return;
    }

    try {
      const res = await fetch("data/travel_recommendation_api.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar JSON`);
      const data = await res.json();

      const resultados = [];

      // Countries → cities
      for (const country of data.countries || []) {
        for (const city of country.cities || []) {
          const campos = [city.name, city.description, country.name];
          if (campos.some((v) => normalize(v).includes(q))) {
            resultados.push({
              nombre: city.name,
              pais: country.name,
              descripcion: city.description,
              imageUrl: (city.imageUrl || "").trim(), // <- importante
            });
          }
        }
      }

      
      for (const temple of data.temples || []) {
        if ([temple.name, temple.description].some((v) => normalize(v).includes(q))) {
          resultados.push({
            nombre: temple.name,
            pais: "Templo",
            descripcion: temple.description,
            imageUrl: (temple.imageUrl || "").trim(),
          });
        }
      }

      
      for (const beach of data.beaches || []) {
        if ([beach.name, beach.description].some((v) => normalize(v).includes(q))) {
          resultados.push({
            nombre: beach.name,
            pais: "Playa",
            descripcion: beach.description,
            imageUrl: (beach.imageUrl || "").trim(),
          });
        }
      }

      render(resultados);
    } catch (err) {
      console.error("Error cargando JSON:", err);
      cont.innerHTML = `<p style="color:red">No pude cargar el JSON: ${err.message}. 
      ¿Estás abriendo el archivo con http:// (Live Server) y no con file://?</p>`;
    }
  }

  
  btn.addEventListener("click", buscar);

  
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscar();
    }
  });

  
  const resetBtn = document.querySelector('button[type="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      input.value = "";
      cont.innerHTML = "";
      input.focus();
    });
  }
})();
