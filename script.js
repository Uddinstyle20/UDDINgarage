// Tombol sapaan
const sapaButton = document.getElementById("sapaButton");
if (sapaButton) {
  sapaButton.addEventListener("click", () => {
    alert("Halo! Selamat datang di UDDINgarage 😎");
  });
}

// Sistem Antrian
const formAntrian = document.getElementById("formAntrian");
const listAntrian = document.getElementById("listAntrian");
let nomorAntrian = 1;

if (formAntrian) {
  formAntrian.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("namaPelanggan").value.trim();
    const servis = document.getElementById("jenisServis").value;

    if (nama && servis) {
      const li = document.createElement("li");
      li.textContent = `${nomorAntrian}. ${nama} - ${servis}`;
      listAntrian.appendChild(li);
      nomorAntrian++;
      formAntrian.reset();
    }
  });
}

// Accordion Servis Ringan (slide turun)
const accordions = document.querySelectorAll(".accordion");

accordions.forEach((accordion) => {
  accordion.addEventListener("click", () => {
    const panel = accordion.nextElementSibling;
    accordion.classList.toggle("active");

    // buka tutup panel dengan efek slide
    if (panel.classList.contains("open")) {
      panel.classList.remove("open");
    } else {
      // tutup panel lain agar hanya satu yang terbuka
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("open"));
      panel.classList.add("open");
    }
  });
});
