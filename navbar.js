const nav = `
<nav class="fixed top-0 left-0 w-full flex items-center justify-between px-10 py-4 bg-[#FFD700] z-50 shadow-md">
  <div class="flex items-center gap-2 text-blue-900 font-bold text-xl cursor-pointer" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
    <i class="fa-solid fa-motorcycle text-2xl"></i>
    <span>UNI-RIDE</span>
  </div>

  <div class="hidden md:flex items-center gap-8 font-semibold text-blue-900">
    <a href="#home" class="hover:opacity-70 transition">Home</a>
    <a href="#anjem" class="hover:opacity-70 transition">Anjem</a>
    <a href="#jastip" class="hover:opacity-70 transition">Jastip</a>
    <a href="#riwayat" class="hover:opacity-70 transition">Riwayat</a>
  </div>
</nav>
`;
document.getElementById('navbar-placeholder').innerHTML = nav;