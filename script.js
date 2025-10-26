// === Tombol sapaan (tetap dipertahankan) ===
const sapaButton = document.getElementById("sapaButton");
if (sapaButton) {
  sapaButton.addEventListener("click", () => {
    alert("Halo! Selamat datang di UDDINgarage 😎");
  });
}

// === Sistem Antrian dengan localStorage (integrasi tanpa menghapus struktur asli) ===
const formAntrian = document.getElementById("formAntrian");
const listAntrian = document.getElementById("listAntrian");

// Ambil data antrian dari localStorage (atau inisialisasi array kosong)
let antrian = JSON.parse(localStorage.getItem("uddiN_antrian")) || [];

// Menampilkan antrian ke UI
function tampilkanAntrian() {
  if (!listAntrian) return;
  listAntrian.innerHTML = "";
  antrian.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "antrian-item";
    li.innerHTML = `
      <span>${index + 1}. ${escapeHtml(item.nama)} - ${escapeHtml(item.servis)}</span>
    `;
    // tombol hapus
    const hapusBtn = document.createElement("button");
    hapusBtn.className = "hapus-btn";
    hapusBtn.textContent = "Hapus";
    hapusBtn.addEventListener("click", () => {
      // konfirmasi singkat
      const ok = confirm(`Hapus antrian: ${item.nama} - ${item.servis} ?`);
      if (!ok) return;
      antrian.splice(index, 1);
      simpanAntrian();
      tampilkanAntrian();
    });
    li.appendChild(hapusBtn);
    listAntrian.appendChild(li);
  });
}

// Simpan ke localStorage
function simpanAntrian() {
  localStorage.setItem("uddiN_antrian", JSON.stringify(antrian));
}

// Submit form tambah antrian
if (formAntrian) {
  formAntrian.addEventListener("submit", (e) => {
    e.preventDefault();
    const namaInput = document.getElementById("namaPelanggan");
    const jenisSelect = document.getElementById("jenisServis");
    const nama = namaInput ? namaInput.value.trim() : "";
    const servis = jenisSelect ? jenisSelect.value : "";

    if (!nama || !servis) {
      alert("Mohon isi nama dan pilih jenis servis.");
      return;
    }

    antrian.push({ nama, servis, createdAt: new Date().toISOString() });
    simpanAntrian();
    tampilkanAntrian();
    formAntrian.reset();
    // memberi fokus ke input lagi
    if (namaInput) namaInput.focus();
  });
}

// Inisialisasi tampilan antrian saat halaman dibuka
tampilkanAntrian();


// === Accordion (gunakan perilaku yang kamu tulis -> pertahankan) ===
const accordions = document.querySelectorAll(".accordion");
accordions.forEach((accordion) => {
  accordion.addEventListener("click", () => {
    const panel = accordion.nextElementSibling;
    accordion.classList.toggle("active");

    if (panel) {
      if (panel.classList.contains("open")) {
        panel.classList.remove("open");
      } else {
        // tutup panel lain agar hanya satu yang terbuka
        document.querySelectorAll(".panel").forEach((p) => p.classList.remove("open"));
        panel.classList.add("open");
      }
    }
  });
});

// === Helper: escapeHtml untuk mencegah XSS ketika menampilkan input user ===
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// === (Opsional) Kosmetik: Notifikasi kecil saat ada item baru (bukan alert) ===
function showToast(message, ms = 2200) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.bottom = "28px";
  toast.style.background = "linear-gradient(90deg,#4fc3f7,#1e88e5)";
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "10px";
  toast.style.boxShadow = "0 10px 30px rgba(30,58,138,0.12)";
  toast.style.zIndex = 9999;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = "opacity .3s"; toast.style.opacity = 0; }, ms - 300);
  setTimeout(() => { toast.remove(); }, ms);
}

// Hook kecil: tunjukkan toast saat antrian bertambah (non-intrusive)
(function attachToastHook(){
  if (!formAntrian) return;
  formAntrian.addEventListener("submit", () => {
    setTimeout(()=> showToast("Antrian berhasil ditambahkan ✅", 2000), 300);
  });
})();


// === WhatsApp floating action (nomor sudah kamu berikan) ===
// Link sudah ada di HTML; kita bisa menambahkan animasi atau indicator jika idle — contoh pulse:
(function addWhatsappPulse(){
  const wa = document.getElementById("whatsappFloating");
  if (!wa) return;
  // beri efek pulse sederhana berkala
  wa.style.boxShadow = "0 12px 34px rgba(18,140,126,0.24)";
  let up = true;
  setInterval(()=>{
    if (up) { wa.style.transform = "translateY(-6px) rotate(-4deg)"; up = false; }
    else { wa.style.transform = "translateY(0) rotate(0deg)"; up = true; }
  }, 4200);
})();
