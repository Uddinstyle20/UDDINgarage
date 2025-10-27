// === Sapa ===
document.getElementById("sapaButton").addEventListener("click", () => {
  alert("Halo! Selamat datang di UDDINgarage 😎");
});

// === Slider ===
const slides = document.querySelectorAll(".slide");
let index = 0;
const next = document.getElementById("nextSlide");
const prev = document.getElementById("prevSlide");

function showSlide(i) {
  slides.forEach(s => s.classList.remove("active"));
  slides[i].classList.add("active");
}

next.addEventListener("click", () => {
  index = (index + 1) % slides.length;
  showSlide(index);
});
prev.addEventListener("click", () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
});

// === Toggle buka/tutup layanan ===
const toggleBtn = document.getElementById("toggleLayanan");
const slideWrapper = document.querySelector(".slide-wrapper");
toggleBtn.addEventListener("click", () => {
  slideWrapper.classList.toggle("closed");
});

// === Sistem Antrian ===
const form = document.getElementById("formAntrian");
const list = document.getElementById("listAntrian");
let data = JSON.parse(localStorage.getItem("antrian")) || [];

function updateList() {
  list.innerHTML = "";
  data.forEach((d, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${d.nama} - ${d.servis}`;
    const del = document.createElement("button");
    del.textContent = "Hapus";
    del.className = "hapus-btn";
    del.onclick = () => {
      data.splice(i, 1);
      save();
      updateList();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
}
function save() {
  localStorage.setItem("antrian", JSON.stringify(data));
}
form.addEventListener("submit", e => {
  e.preventDefault();
  const nama = document.getElementById("namaPelanggan").value.trim();
  const servis = document.getElementById("jenisServis").value;
  if (!nama || !servis) return alert("Lengkapi nama dan jenis servis!");
  data.push({ nama, servis });
  save();
  updateList();
  form.reset();
});
updateList();

// === Accordion Petunjuk ===
document.querySelectorAll(".accordion").forEach(acc => {
  acc.addEventListener("click", () => {
    acc.classList.toggle("active");
    const panel = acc.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});
