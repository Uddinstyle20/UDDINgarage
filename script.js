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

// Accordion Servis Ringan
const accordions = document.querySelectorAll(".accordion");
accordions.forEach((accordion) => {
  accordion.addEventListener("click", () => {
    accordion.classList.toggle("active");
    const panel = accordion.nextElementSibling;
    panel.classList.toggle("show");
  });
});
