let syncInProgress = false;
let syncInterval = null;
let totalData = 10000; // Total data yang akan disinkronkan
let syncedData = 0; // Data yang sudah disinkronkan

export const SyncManager = {
  startSync: function () {
    if (syncInProgress) {
      console.log("Sinkronisasi sudah berjalan.");
      return;
    }

    syncInProgress = true;
    console.log("Sinkronisasi dimulai.");
    syncedData = 0; // Reset data yang sudah disinkronkan

    // Mulai proses sinkronisasi dengan interval
    syncInterval = setInterval(() => {
      console.log("Sinkronisasi sedang berjalan...");

      // Panggil fungsi sinkronisasi di sini
      performSync()
        .then(() => {
          console.log("Sinkronisasi selesai.");

          // Tambahkan data yang tersinkronkan setelah setiap batch
          syncedData += 100; // Misalkan 1000 data disinkronkan per batch

          // Tampilkan progres
          const progress = this.getSyncProgress();
          console.log(`Progres: ${progress}% (${syncedData}/${totalData})`);

          // Cek apakah sinkronisasi selesai
          if (syncedData >= totalData) {
            console.log("Semua data sudah tersinkronkan.");
            this.stopSync(); // Hentikan sinkronisasi ketika selesai
          }
        })
        .catch((err) => {
          console.error("Error saat sinkronisasi: ", err);
        });
    }, 5000); // Sinkronisasi setiap 5 detik
  },

  stopSync: function () {
    if (syncInProgress) {
      clearInterval(syncInterval);
      syncInProgress = false;
      console.log("Sinkronisasi dihentikan.");
    }
  },

  getSyncProgress: function () {
    // Hitung persentase progres sinkronisasi
    return ((syncedData / totalData) * 100).toFixed(0);
  },
};

function performSync() {
  return new Promise((resolve, reject) => {
    // Simulasi proses sinkronisasi
    setTimeout(() => {
      console.log("Batch data sinkronisasi selesai.");
      resolve(); // Resolusi ketika sinkronisasi batch selesai
    }, 2000); // Misalkan sinkronisasi batch membutuhkan 2 detik
  });
}
