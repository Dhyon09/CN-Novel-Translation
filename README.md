# Yunxi (云溪) — Perpustakaan Novel Terjemahan

Website baca novel statis untuk GitHub Pages, dengan fokus pada romance kultivasi tanpa harem. Dibuat dengan HTML, CSS, JavaScript, dan data JSON; tidak membutuhkan backend atau API.

## Publikasi GitHub Pages
1. Buka **Settings → Pages**.
2. Pilih **Deploy from a branch**, branch `main`, folder `/(root)`.
3. Simpan dan tunggu deployment selesai.

## Menambahkan atau memperbarui novel
1. Edit `data/novels.json` dari GitHub.
2. Tambahkan objek novel di dalam array JSON. Contoh lengkap ada di file itu.
3. Setiap novel membutuhkan `id` unik, `title`, `description`, `genres`, `status`, `chapterCount`, dan array `chapters`.
4. Setiap bab mempunyai `title` dan `content`. Gunakan karakter `\n\n` untuk memisahkan paragraf dalam string JSON.
5. Commit perubahan ke branch `main`. Situs akan diperbarui otomatis oleh GitHub Pages.

Contoh genre: `["Wuxia"]`, `["Xuanhuan"]`, atau `["Xianxia"]`. Pilih genre utama yang paling sesuai dengan dunia dan karakteristik cerita. Status yang tersedia: `"Ongoing"` atau `"Tamat"`. Pilihan desain sampul: `""`, `"tone2"`, `"tone3"`, `"tone4"`, `"tone5"`.

## Fitur
- Pencarian judul, penulis, sinopsis, dan genre
- Filter genre dan status
- Pembaca bab dengan navigasi, ukuran huruf, mode gelap, dan penyimpanan progres lokal
- Responsif untuk ponsel dan desktop
- Pengelolaan konten melalui file JSON, tanpa backend

## Penting
Novel yang ada saat pertama kali dipasang adalah **teks contoh/demo**, bukan rekomendasi karya terbitan. Ganti dengan terjemahan yang kamu miliki hak untuk publikasikan. Jangan mengunggah karya berhak cipta tanpa izin.
