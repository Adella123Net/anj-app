const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRHvAvYasy3Oxv5WXhtlgJkcn6aN2Sv65d68hC2exBTffuF_bDqiBZO0cQ8PCBnUnb/exec"

let ALL_DATA = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  const sr = ScrollReveal({
    distance: "60px",
    duration: 1000,
    easing: "cubic-bezier(0.5, 0, 0, 1)",
  });
  sr.reveal(".reveal-left", { origin: "left" });
  sr.reveal(".reveal-right", { origin: "right" });
  sr.reveal(".reveal-bottom", { origin: "bottom" });
  sr.reveal(".reveal-top", { origin: "top" });

  muatDataDariSheets();
  const elBudget = document.getElementById("budget_barang");
  if (elBudget) {
    elBudget.addEventListener("input", function (e) {
      let angka = this.value.replace(/[^,\d]/g, "");
      this.value = angka ? new Intl.NumberFormat("id-ID").format(angka) : "";
    });
  }
});

async function muatDataDariSheets() {
  const loader = document.getElementById("loading-database");
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    ALL_DATA = data.reverse(); 

    if (loader) loader.style.display = "none";
    renderRiwayatUtama();
  } catch (err) {
    console.error("Database Error:", err);
    if (loader)
      loader.innerHTML =
        "<p class='text-red-500 font-bold'>Gagal konek database!</p>";
  }
}

function renderRiwayatUtama() {
  const container = document.querySelector(".list-riwayat");
  const emptyState = document.getElementById("empty-state");
  if (!container) return;


  const currentItems = container.querySelectorAll(".riwayat-card-item");
  currentItems.forEach((el) => el.remove());

  if (ALL_DATA.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  const previewData = ALL_DATA.slice(0, 5);
  previewData.forEach((item) => {
    container.insertAdjacentHTML("beforeend", buatKartuHTML(item));
  });
}

function buatKartuHTML(data) {
  return `
  <div class="riwayat-card-item bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-[#FFD700] transition-all duration-300" data-kategori="${data.kategori}">
    <div class="flex items-center gap-5">
      <div class="w-14 h-14 bg-slate-900 text-[#FFD700] rounded-2xl flex items-center justify-center text-xl">
        <i class="fa-solid ${data.kategori === "anjem" ? "fa-motorcycle" : "fa-bag-shopping"}"></i>
      </div>
      <div>
        <h4 class="font-black text-slate-800">${data.jemput} <i class="fa-solid fa-arrow-right text-[10px] mx-1 text-slate-300"></i> ${data.tujuan}</h4>
        <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">${data.waktuCakep} • Driver: ${data.driver}</p>
      </div>
    </div>
    <div class="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Success</div>
  </div>`;
}

async function kirimPesanAnjemWA() {
  const elJemput = document.getElementById("lokasi_jemput");
  const elTujuan = document.getElementById("lokasi_tujuan");
  const elWaktu = document.getElementById("tanggal_waktu");
  const elDriver = document.getElementById("pilihan_driver");
  const elCatatan = document.getElementById("catatan_anjem");
  const elJenis = document.querySelector('input[name="jenis_anjem"]:checked');

  if (!elJemput || !elTujuan || !elWaktu || !elDriver) {
    console.error("ID Elemen input anjem ada yang salah/hilang di HTML lu, Bos!");
    return;
  }

  const jemput = elJemput.value;
  const tujuan = elTujuan.value;
  const waktuRaw = elWaktu.value;
  const driver = elDriver.value;
  const jenis = elJenis ? elJenis.value : "Orang";
  const catatan = elCatatan ? elCatatan.value : "-";

  if (!jemput || !tujuan || !waktuRaw || !driver) {
    Swal.fire({
      icon: "info",
      title: "Informasi Belum Lengkap",
      text: "Mohon lengkapi seluruh formulir pemesanan sebelum melanjutkan.",
      confirmButtonColor: "#FFD700",
      confirmButtonText: "Lengkapi Sekarang",
    });
    return;
  }

  Swal.fire({
    title: "Memproses Pesanan",
    text: "Mohon tunggu sebentar, sistem sedang melakukan sinkronisasi data.",
    allowOutsideClick: false,
    showConfirmButton: false, 
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const tglObj = new Date(waktuRaw);
  const waktuCakep = tglObj.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  }) + " • " + tglObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const orderData = {
    id: "ANJM-" + Date.now(),
    kategori: "anjem",
    jemput,
    tujuan,
    waktuCakep,
    jenis,
    driver, 
    catatan,
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    Swal.fire({
      icon: "success",
      title: "Pesanan Berhasil Diverifikasi",
      text: "Data telah aman tersimpan di sistem. Tekan tombol di bawah untuk terhubung ke WhatsApp Driver.",
      confirmButtonColor: "#FFD700",
      confirmButtonText: "Hubungi Driver Sekarang",
    }).then(() => {
      bukaWAAnjem(orderData);
      ALL_DATA.unshift(orderData);
      renderRiwayatUtama();
    });
  } catch (err) {
    Swal.fire({
      icon: "warning",
      title: "Gangguan Sinkronisasi",
      text: "Terjadi kendala pada database, namun Anda tetap dapat melanjutkan pemesanan langsung melalui WhatsApp.",
      confirmButtonColor: "#FFD700",
      confirmButtonText: "Lanjutkan ke WhatsApp",
    }).then(() => bukaWAAnjem(orderData));
  }
}

function bukaWAAnjem(data) {
  const kontak = {
    Adel: "6288806194358",
    Adella: "6285348275266",
    Awan: "6288232796206",
    Sholeh: "6287861740238",
    Cava : "6285866670726"
  };
  const pesan = `Halo kak ${data.driver}, ada orderan ANJEM UNI-RIDE!\n\n📍 Jemput: ${data.jemput}\n🏁 Tujuan: ${data.tujuan}\n⏰ Waktu: ${data.waktuCakep}\n📝 Catatan: ${data.catatan}`;
  const phone = kontak[data.driver] || "628123456789";
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(pesan)}`, "_blank");
}

async function kirimPesanJastipWA() {
  const elBarang = document.getElementById("nama_barang");
  const elToko = document.getElementById("toko_barang");
  const elJumlah = document.getElementById("jumlah_barang");
  const elBudget = document.getElementById("budget_barang");
  const elDriver = document.querySelector("#jastip #pilihan_driver"); 
  const elCatatan = document.getElementById("catatan_jastip");

  if (!elBarang || !elToko || !elJumlah || !elBudget || !elDriver) {
    console.error("Waduh, ada ID elemen Jastip yang hilang di HTML nih!");
    return;
  }

  const barang = elBarang.value;
  const toko = elToko.value;
  const jumlah = elJumlah.value;
  const budget = elBudget.value;
  const driver = elDriver.value;
  const catatan = elCatatan ? elCatatan.value : "-";

  if (!barang || !toko || !jumlah || !budget || !driver) {
    Swal.fire({
      icon: "info",
      title: "Keranjang Belum Siap",
      text: "Isi detail barang, toko, dan fee-nya dulu ya biar driver kita gak bingung.",
      confirmButtonColor: "#f97316", 
      confirmButtonText: "Lengkapi Dulu",
    });
    return;
  }

  Swal.fire({
    title: "Mencatat Titipanmu...",
    text: "Tunggu bentar, sistem lagi nyiapin data jastip kamu.",
    allowOutsideClick: false,
    showConfirmButton: false, 
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const tglObj = new Date();
  const waktuCakep = tglObj.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  }) + " • " + tglObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const orderData = {
    id: "JSTP-" + Date.now(),
    kategori: "jastip",
    jemput: toko,
    tujuan: barang,
    waktuCakep: waktuCakep,
    jenis: `${jumlah} (Fee: Rp ${budget})`,
    driver: driver, 
    catatan: catatan,
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    Swal.fire({
      icon: "success",
      title: "Jastip Berhasil Masuk!",
      text: "Data aman. Yuk langsung chat drivernya biar sat-set dibeliin.",
      confirmButtonColor: "#f97316",
      confirmButtonText: "Kirim ke WA Driver",
    }).then(() => {
      bukaWAJastip(orderData, jumlah, budget);
      ALL_DATA.unshift(orderData);
      renderRiwayatUtama();
      
      elBarang.value = '';
      elToko.value = '';
      elJumlah.value = '';
      elBudget.value = '';
      elCatatan.value = '';
    });
  } catch (err) {
    Swal.fire({
      icon: "warning",
      title: "Database Agak Ngambek",
      text: "Gagal simpan ke history, tapi tenang aja, kamu tetep bisa lanjut order via WA.",
      confirmButtonColor: "#f97316",
      confirmButtonText: "Lanjut WA Driver",
    }).then(() => bukaWAJastip(orderData, jumlah, budget));
  }
}

function bukaWAJastip(data, jumlah, budget) {
  const kontak = {
    Adel: "6288806194358",
    Adella: "6285348275266",
    Awan: "6288232796206",
    Sholeh: "6287861740238",
    Cava : "6285866670726"
  };
  const pesan = `Halo kak ${data.driver}, ada orderan JASTIP UNI-RIDE nih! 🛍️\n\n🛒 *Barang:* ${data.tujuan}\n🏪 *Toko/Lokasi:* ${data.jemput}\n📦 *Jumlah:* ${jumlah}\n💸 *Fee Jastip:* Rp ${budget}\n📝 *Catatan:* ${data.catatan}\n\nMohon bantuannya untuk dibelikan ya kak, terima kasih!`;
  const phone = kontak[data.driver] || "628123456789";
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(pesan)}`, "_blank");
}

function bukaModalRiwayat() {
  const modal = document.getElementById("modal-full-riwayat");
  if (modal) modal.classList.remove("hidden");
  renderPaginationTable(1);
}

function tutupModalRiwayat() {
  const modal = document.getElementById("modal-full-riwayat");
  if (modal) modal.classList.add("hidden");
}

function renderPaginationTable(page) {
  currentPage = page;
  const start = (page - 1) * itemsPerPage;
  const dataHalaman = ALL_DATA.slice(start, start + itemsPerPage);

  let html = `
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-50">
        <th class="pb-4">No</th>
        <th class="pb-4">Order & Rute</th>
        <th class="pb-4">Driver</th>
        <th class="pb-4 text-right">Status</th>
      </tr>
    </thead>
    <tbody class="text-slate-700 font-bold">`;

  dataHalaman.forEach((item, index) => {
    html += `
    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td class="py-5 text-xs text-slate-300">#${start + index + 1}</td>
      <td class="py-5">
        <div class="text-sm">${item.jemput} → ${item.tujuan}</div>
        <div class="text-[10px] text-slate-400 font-medium">${item.waktuCakep}</div>
      </td>
      <td class="py-5 text-sm">${item.driver}</td>
      <td class="py-5 text-right"><span class="text-green-500 text-[9px] font-black uppercase bg-green-50 px-3 py-1 rounded-full">Selesai</span></td>
    </tr>`;
  });

  document.getElementById("container-tabel-riwayat").innerHTML = html + `</tbody></table>`;
  buatTombolPagination();
}

function buatTombolPagination() {
  const totalPages = Math.ceil(ALL_DATA.length / itemsPerPage);
  let html = `<div class="flex gap-2">`;
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "bg-[#FFD700] text-black shadow-md" : "bg-white text-slate-400 hover:text-black";
    html += `<button onclick="renderPaginationTable(${i})" class="w-10 h-10 rounded-xl font-black text-xs transition-all ${activeClass}">${i}</button>`;
  }
  document.getElementById("pagination-controls").innerHTML = html + `</div>`;
}

function filterRiwayat(kat, btn) {

  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.className = "tab-btn px-8 py-3 text-slate-500 hover:text-black rounded-xl font-bold text-sm transition-all";
  });
  btn.className = "tab-btn px-8 py-3 bg-[#FFD700] text-black rounded-xl font-black text-sm shadow-md transition-all";

  document.querySelectorAll(".riwayat-card-item").forEach((item) => {
    item.style.display = kat === "semua" || item.dataset.kategori === kat ? "flex" : "none";
  });
}

function urutkanRiwayat(urutan) {
  if (urutan === "terlama") {

    ALL_DATA.sort((a, b) => {

      let timeA = parseInt(a.id.split('-')[1]);
      let timeB = parseInt(b.id.split('-')[1]);
      return timeA - timeB; 
    });
  } else 
    {
    ALL_DATA.sort((a, b) => {
      let timeA = parseInt(a.id.split('-')[1]);
      let timeB = parseInt(b.id.split('-')[1]);
      return timeB - timeA; 
    });
  }

  renderRiwayatUtama();

  const modal = document.getElementById("modal-full-riwayat");
  if (modal && !modal.classList.contains("hidden")) {
    renderPaginationTable(1);
  }


  const container = document.querySelector(".list-riwayat");
  if (container) {
    container.style.opacity = "0.5";
    setTimeout(() => { container.style.opacity = "1"; }, 200);
  }
}
