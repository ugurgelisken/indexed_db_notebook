$(document).ready(function(){
    // IndexedDB VERİTABANI OLUŞTURULUYOR
    if (window.indexedDB || window.window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB){
        console.log("IndexedDB destekliyor.")
        var veritabani = new Dexie("not_defteri");
        veritabani.version(1).stores({
            notlar: "++id,baslik,metin,tarih"
        })
        veritabani.open().then(function(){
           console.log("Veritabanı açıldı.")
           kayitlariOku();
        }).catch (function (hata) {
           console.error('Veritabanı açılamadı: ' + hata);
        });
    }else{
        alert("Maalesef tarayıcınızda IndexedDB desteği bulunmamaktadır.")
    }

    // TABLO SİL BUTONUNA TIKLANINCA TABLOYU TEMİZLE
    $("#tabloTemizle").click(function(){
        veritabani.notlar.clear().then(function(){
           console.log("Tablo temizlendi.");
           $("#tablo").empty();
        }).catch (function(hata){
           console.log("Tablo temizlenemedi.");
        });
    });

    // KAYDET BUTONUNA TIKLANINCA YENİ BİR KAYIT GİRİLİYOR
    $("#notKaydet").click(function(){
        var _baslik = $("#notBasligi").val();
        var _metin = $("#notMetini").val();
        var _tarih = new Date().getTime();
        // EĞER İKİ DEĞER DE GİRİLMİŞSE...
        if(_baslik && _metin){
            veritabani.notlar.put({
                baslik:_baslik,
                metin:_metin,
                tarih:_tarih
            }).then(function(){
                // VERİLER TEKRAR OKUNUYOR VE TABLO GÜNCELLENİYOR
                console.log("Kayıt girildi.");
                $("#notBasligi").val("");
                $("#notMetini").val("");
                kayitlariOku();
            }).catch(function(hata) {
               console.log("Kayıt eklenemedi: " + hata);
            });
        }

    });


    // KAYITLARI OKUYAN VE TABLOYU OLUŞTURAN FONKSİYON
    function kayitlariOku(){
        $("#tablo").empty();
        veritabani.notlar.orderBy("tarih").reverse().each(function(kayit){
            $("#tablo").append(
                "<tr>" +
                     "<td>"+kayit.id+"</td>"+
                     "<td><input type='text' id='baslik"+kayit.id+"' value='"+kayit.baslik+"' /></td>"+
                     "<td><textarea id='metin"+kayit.id+"' >"+kayit.metin+"</textarea></td>"+
                     "<td>"+ new Date(kayit.tarih).toLocaleString()+"</td>"+
                     "<td><button type='button' data-index='"+kayit.id+"' class='guncelle btn btn-light'>Güncelle</button>&nbsp&nbsp<button type='button' data-index='"+kayit.id+"' class='sil btn btn-light' >Sil</button></td>"+
                "</tr>");
        });
    }

    // GÜNCELLE BUTONU DİNAMİK OLUŞTURULDUĞU İÇİN FARKLI BİR METOT İLE TRIGGER EDİYORUZ
    // CLASS İSMİ guncelle OLAN BUTONA TIKLANDIĞINDA KAYDI GÜNCELLİYORUZ
    $(document).on('click','.guncelle',function(){
        var _index = Number($(this).attr('data-index'));
        var _baslik = $("#baslik"+_index).val();
        var _metin = $("#metin"+_index).val();
        if(_baslik && _metin){
            veritabani.notlar.update(_index, {
                baslik: _baslik,
                metin: _metin
            })
            .then(function () {
                console.log(_index + " id'li kayıt güncellendi.");
                kayitlariOku();
            });
        }
    });

    // CLASS İSMİ sil OLAN BUTONA TIKLANDIĞINDA KAYDI SİLİYORUZ
    $(document).on('click','.sil',function(){
        var _index = Number($(this).attr('data-index'));
        veritabani.notlar.where('id').equals(_index).delete()
        .then(function () {
            console.log(_index + " id'li kayıt silindi.");
            kayitlariOku();
        });
    });
});