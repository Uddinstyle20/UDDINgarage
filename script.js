// Fungsi tombol "Sapa Saya!"
const sapaButton = document.getElementById("sapaButton");
if (sapaButton) {
  sapaButton.addEventListener("click", () => {
    alert("Halo! Selamat datang di UDDINgarage 😎");
  });
}

// === Sistem Antrian ===
const formAntrian = document.getElementById("formAntrian");
const listAntrian = document.getElementById("listAntrian");
let nomorAntrian = 1;

if (formAntrian) {
  formAntrian.addEventListener("submit", function (event) {
    event.preventDefault();

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

// === Accordion ===
const accordions = document.querySelectorAll(".accordion");

accordions.forEach((acc) => {
  acc.addEventListener("click", function () {
    this.classList.toggle("active");
    const panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
});
