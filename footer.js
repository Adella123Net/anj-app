const foot = `<footer class="bg-slate-900 pt-20 pb-10 w-full">
      <div class="max-w-7xl mx-auto px-6 lg:px-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div class="space-y-6">
            <h2 class="text-3xl font-black text-[#FFD700]">UNI-RIDE</h2>
            <p class="text-slate-400 font-medium leading-relaxed">Platform mobilitas dan jasa titip eksklusif mahasiswa Semarang.</p>
          </div>
          <div class="space-y-6">
            <h4 class="text-white font-black text-sm uppercase tracking-widest">Layanan</h4>
            <ul class="space-y-4">
              <li><a href="#anjem" class="text-slate-400 hover:text-[#FFD700] font-bold">Antar Jemput</a></li>
              <li><a href="#jastip" class="text-slate-400 hover:text-[#FFD700] font-bold">Jasa Titip</a></li>
            </ul>
          </div>
          <div class="space-y-6">
            <h4 class="text-white font-black text-sm uppercase tracking-widest">Jam Kerja</h4>
            <p class="text-[#FFD700] font-black text-xl">Fleksibel</p>
          </div>
          <div class="space-y-6">
            <h4 class="text-white font-black text-sm uppercase tracking-widest">Bantuan</h4>
            <button class="px-6 py-3 bg-[#FFD700] text-black rounded-xl font-black text-sm shadow-xl">WhatsApp CS</button>
          </div>
        </div>
        <div class="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
          <p class="text-slate-500 font-bold text-xs uppercase tracking-widest">&copy; 2024 UNI-RIDE Indonesia. Crafted for Excellence.</p>
        </div>
      </div>
    </footer>`

    document.getElementById('footer').innerHTML = foot;