INSTALLATION
------------
Untuk diinstal di komputer client(komputer yang terhubung ke timbangan).

* Install nodejs dan npm [di sini](https://nodejs.org/en/).
* Install [pm2](https://pm2.keymetrics.io/) untuk membuat service.
* Clone repositori ini dan install dependensinya.
```sh
# git clone https://github.com/mdmunir/toledo
# cd toledo
# npm ci
# npm run start
```

Jika sudah jalan, kemudian buka di browser [http://localhost:4001](http://localhost:4001).
Atur sesuai dengan spesifikasi toledonya. Jika pengaturannya benar, nilai timbangan akan tampil di input text `Value`.

Jika pengaturan sudah benar, buat aplikasi menjadi service dengan menjalankan pm2. Dari folder aplikasi, jalankan
```
# pm2 start index.js
```

MENGHUBUNGKAN DENGAN APLIKASI UTAMA
-----------------------------------

Untuk menghubungkan dengan aplikasi utama, pada halaman utama, tambahkan kode berikut
```html
<script src="http://localhost/assets/socket.io.js"></script>
<script>
    const socket = io('http://localhost:4001');
    socket.on('value', function(value){
        var inp = document.getElementById('id_input'); // id dari text field
        inp.value = value;
    });
</script>
```