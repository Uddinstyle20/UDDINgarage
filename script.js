// Tombol sapa (bawaan kamu sebelumnya)
const sapaButton = document.getElementById("sapaButton");
if (sapaButton) {
  sapaButton.addEventListener("click", () => {
    alert("Halo! Selamat datang di UDDINgarage 😎");
  });
}

// Fitur antrian pelanggan
const formAntrian = document.getElementById("formAntrian");
const listAntrian = document.getElementById("listAntrian");

let nomorAntrian = 1;

formAntrian.addEventListener("submit", function(event) {
  event.preventDefault();

  const nama = document.getElementById("namaPelanggan").value.trim();
  const servis = document.getElementById("jenisServis").value;

  if (nama && servis) {
    const li = document.createElement("li");
    li.textContent = `${nomorAntrian}. ${nama} - ${servis}`;
    listAntrian.appendChild(li);
    nomorAntrian++;

    // Reset form
    formAntrian.reset();
  }
});
