import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { ConnectionService } from 'ng-connection-service';
import { __metadata } from 'tslib';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  allSoal:any   = []
  allSiswa:any  = []
  allKelas:any  = []
  jawaban:any   = []
  siswa:any     = {}
  allUjian:any  = []
  dataUjian:any = {}
  tombol:boolean = false
  konfirmasi:boolean = true
  kodeUjian:string
  cekKode:boolean = false
  accAdmin:boolean = false
  menit:number
  detik:number
  style:any
  kelas:any = {id_kelas:''}
  internet:boolean = (localStorage.getItem('connection') === 'true') ? true : false
  time:any
  outFull= document.exitFullscreen || document['mozCancelFullScreen'] || document['webkitExitFullscreen'] || document['msExitFullscreen']

  @ViewChildren('cekJawab') cekJawab :QueryList<ElementRef>

  ngAfterViewInit(): void {
    this.cekJawab.changes.subscribe(()=>{
      this.cekJawab.toArray().forEach(soal=>{
        this.jawaban.forEach((data)=>{
            if(data.id_soal === soal.nativeElement.id.split(':')[1] && data.jawab === soal.nativeElement.id.split(':')[0]){
                  soal.nativeElement.checked = true
              }
          })
      })
    })
  }

  constructor(private _data:DataService, private  koneksiInternet: ConnectionService) { 
    this.koneksiInternet.monitor().subscribe(conek=>{
      localStorage.setItem('connection',conek.toString())
      this.internet = conek
      if(conek){
        this.waktu()
        clearInterval(this.time)
      }else{
        this.offline()
      }
   })
  }

  ngOnInit() {
    this.fullScreen(this._data) 
    this.onLoadConfigSoal()
    this.getDataUjian()
    this.dataGuruDanMapel()
    this.siswa.nama = ''

    if(this.dataUjian.id_kelas != null){
      this.getKelas()
    }
      
      this._data.socket.on('start-ujian',(data:any)=>{
        this.waktu()
        if(localStorage.getItem('peserta')){
            if(localStorage.getItem('peserta').split('~')[1] === data.id_ujian){
              this.accAdmin = data.cek
              // console.log(data)
              if(data.cek){  // jika true maka mulai ujian , data dari server dari rencana comp
                this._data.warning = false
                this._data.pesan(true, 'Selamat mengerjakan')
                localStorage.setItem('admin','true')
              }else{  //jika false maka ujian berhenti, data dari server
                if(data.karena === 'guru'){
                  this._data.peringatan('Ujian di hentikan')
                }else{
                  this._data.peringatan('Waktu telah habis')
                  if(localStorage.getItem('jawaban')){
                    this.selesai()
                  }
                  this.updateUsedUjian()
                }
                this.siswaKeluar()
                if(this.internet){
                    localStorage.removeItem('waktu')
                    localStorage.removeItem('admin')
                    localStorage.removeItem('connection')
                    localStorage.removeItem('error')
                    setTimeout(()=>{
                      localStorage.clear()
                      this._data.router = 'home'
                    },10000)
                }
              }
            }
        }else{
          if(this.accAdmin){
            localStorage.removeItem('admin')
          }
          if(data.karena === 'guru'){
            localStorage.removeItem('admin')
            localStorage.removeItem('waktu')
          }
        }
      })

      if(!localStorage.getItem('connection')){
        this.internet = true
      }
   
      this._data.socket.on('send login',async()=>{
        this.allSiswa = await []
        this.allKelas = await []
        await this.getSiswa()
        await this.getKelas()
      })

      this._data.socket.on('siswa out',async (data:any)=>{
        if(localStorage.getItem('peserta')){
          if(localStorage.getItem('peserta').split('~')[0] === data._id){
            localStorage.clear()
            this._data.router = 'home'
          }
        }else{
          this.allSiswa = await []
          this.allKelas = await []
          await this.getSiswa()
          await this.getKelas()
        }
      })
  }

  async fullScreen(pesan = null) {
    let elem = await document.documentElement;
    let methodToBeInvoked = await elem.requestFullscreen || elem['webkitRequestFullScreen'] || elem['mozRequestFullscreen'] || elem['msRequestFullscreen'];
    let outFull= await document.exitFullscreen || document['mozCancelFullScreen'] || document['webkitExitFullscreen'] || document['msExitFullscreen']
    // if (methodToBeInvoked) methodToBeInvoked.call(elem) //full screeen

    // document.addEventListener("visibilitychange", function() {
    //   // if (document.hidden){
    //       alert('alert heiii')
    //   // }
    //  });

      window.addEventListener('blur',(e)=>{
        // console.log('ngapain buka browseing');
        if(localStorage.getItem('peserta') && localStorage.getItem('waktu')){
          if(!localStorage.getItem('error')){
            localStorage.setItem('error','true')
            this._data.peringatan('Sekali lagi curang, maka anda keluar dari ujian')
          }else{
            localStorage.removeItem('waktu')
            localStorage.removeItem('admin')
            this.selesai()
          }
        }
      })

     await document.addEventListener("click",function(e){
    //     // console.log(TypeError);
    if (methodToBeInvoked) methodToBeInvoked.call(elem);

    //     // e.preventDefault()
      });
      document.addEventListener("contextmenu",function(e){
        // outFull.call(document) //keluar full screen
        // console.log('hayyoo click kanan');
        pesan.pesan(true,'Jangan curang')
        e.preventDefault()
        return false
      },false);
  }

  onLoadConfigSoal(){
    // jika standby detect di local
      if(localStorage.getItem('standby')){
        this.dataUjian = JSON.parse(localStorage.getItem('standby'))
        this.getSiswa()
        this.cekKode = true
        this.accAdmin = Boolean(localStorage.getItem('admin'))
      }else{
        localStorage.removeItem('soal')
        localStorage.removeItem('peserta')
        localStorage.removeItem('jawaban')
      }
    
    //jika peserta sudah login  
      if(localStorage.getItem('peserta')){
        if(!this.internet){
            this.offline()
        }
        this.waktu()
        clearInterval(this.time)
        this.konfirmasi = false
        this.tombol = true
        this.getSoal().then((data:any)=>{
          this.allSoal = data
          this.delObjectSoal(data)
        }).catch(e=>{
          this.allSoal =  JSON.parse(localStorage.getItem('soal')) // jika koneksi terputus
        })

        if(localStorage.getItem('jawaban')){  //simpan jawaban di local
          this.jawaban = JSON.parse(localStorage.getItem('jawaban'))
        }
      }

  }

  dataGuruDanMapel(){
    //ambil data mapel
      this._data.getData('Mapel').subscribe((study:any)=>{
        study.forEach((data)=>{
          if(data._id === this.dataUjian.id_mapel){
            this.dataUjian.study = data.mapel
          }
        })
      })

  //ambil data guru
      this._data.getData('Guru').subscribe((data:any)=>{
        data.forEach((guru)=>{
          if(guru._id === this.dataUjian.id_guru){
            this.dataUjian.guru       = guru.nama
            this.dataUjian.sekolah    = guru.sekolah
            this.dataUjian.kabupaten  = guru.kabupaten
            this.dataUjian.provinsi   = guru.provinsi
            this.dataUjian.alamat   = guru.alamat
            setTimeout(()=>{
              localStorage.setItem('standby',JSON.stringify(this.dataUjian))
            },300)
          }
        })
      })
  }

  getDataUjian(){
      this._data.getData('Ujian','hapus','false','full').subscribe((result:any)=>{
        result.forEach((data,i)=>{
          delete data.hapus
          if(result.length === i+1){
            this.allUjian = result
            // console.log(result)
          }
        })
      })
  }

  delObjectSoal(filter){
    filter.forEach((el,i)=>{
      delete el.jawaban
      delete el.sharing
      delete el.jenjang
      delete el.createdBy
      delete el.kelas
      delete el.id_guru
      delete el.mapel
      if(filter.length === 1+i){
        setTimeout(()=>{
          localStorage.setItem('soal',JSON.stringify(filter))
        },400)
      }})
  }

  getSoal(){
    const result:any = []
    return new Promise((resolve,reject)=>{
      this._data.getData('Group','_id',this.dataUjian.id_soal,'full').subscribe((data:any)=>{
          data[0].list.forEach((elm:string,i)=>{
            this._data.getData('Soal','_id',elm,'full').subscribe((soal)=>{
              result.push(soal[0])
              if(data[0].list.length === i+1){
                  resolve(result)
              }
            })
          })     
      },(err)=>{
        reject()
      })
    })
  }

  getSiswa(){
    this.dataUjian.id_siswa.forEach((data,i)=>{
      this._data.getData('Siswa','_id',data,'full').subscribe((sis)=>{
        // console.log(sis[0].status)
        if(sis[0].status === 'undefined' || sis[0].status != 'login'){
            this.allSiswa.push(sis[0])
        }
        if(localStorage.getItem('peserta')){
          if(localStorage.getItem('peserta').split('~')[0] === data){
            this.siswa = sis[0]
          }
        }
      })
    })
  }

  getKelas(){
    if(this.dataUjian.id_kelas != undefined){
      this.dataUjian.id_kelas.forEach((kelas,n)=>{
        this._data.getData('Kelas','_id',kelas,'full').subscribe((kelas)=>{
          this.allKelas.push(kelas[0])
        })
      })
    }
  }

 pilih(event){ 
    let data = {'jawab':event.target.id.split(':')[0],'id_soal':event.target.id.split(':')[1]}
    let ind = this.jawaban.findIndex((prop,i)=>{
        return prop.id_soal === data.id_soal
    })
    if(ind < 0){
      this.jawaban.push(data)
    }else{
      this.jawaban[ind].jawab = data.jawab
    }
    localStorage.setItem('jawaban',JSON.stringify(this.jawaban))
  }

  async updateNilaiSiswa(nilai){
    this.siswa._id = await localStorage.getItem('peserta').split('~')[0]
    // cek index di nilai array
    if(this.siswa.ujian.map((elm)=>{ return elm.id_ujian}).indexOf(localStorage.getItem('peserta').split('~')[1]) > -1){
       this.siswa.ujian[this.siswa.ujian.map((elm)=>{ return elm.id_ujian}).indexOf(localStorage.getItem('peserta').split('~')[1])].nilai = await nilai
       this.siswa.ujian[this.siswa.ujian.map((elm)=>{ return elm.id_ujian}).indexOf(localStorage.getItem('peserta').split('~')[1])].tgl = await new Date()
       this.siswa.ujian[this.siswa.ujian.map((elm)=>{ return elm.id_ujian}).indexOf(localStorage.getItem('peserta').split('~')[1])].kode = await localStorage.getItem('peserta').split('~')[3]

    }else{
      await this.siswa.ujian.push({'id_mapel':this.dataUjian.id_mapel,
                        'nilai':nilai,
                        'tgl':new Date(),
                        'namaUjian':this.dataUjian.ujian,
                        'kode':localStorage.getItem('peserta').split('~')[3],
                        'id_ujian':localStorage.getItem('peserta').split('~')[1]
                      })
      // console.log('2');
      
    }
    await this._data.updateData('Siswa',this.siswa).subscribe((dat:any)=>{
      // console.log(dat._doc.ujian);
      
      this._data.pesan(true,'update nilai')
    })
  }

  cekArrayNilai(tabel,id){
    return new Promise((resolve,reject)=>{
      let obj:any = {}
      let cek:boolean = false
      this._data.getData(tabel,'_id',id,'full').subscribe((data:any)=>{
        obj = data[0]
        if(data[0].ujian.length === 0){
          cek = true
        }else{
           if(data[0].ujian.map((elm)=>{ return elm.id_ujian}).indexOf(localStorage.getItem('peserta').split('~')[1]) < 0){
             cek = true
           }
        }
        resolve({'cek':cek,'data':obj})
      })
    })
  }

 async updateKelas(kelas){ 
      await kelas.ujian.push({'id_ujian':localStorage.getItem('peserta').split('~')[1],
                          'kode':localStorage.getItem('peserta').split('~')[3],
                          'tgl':new Date(),
                          'nameUjian':this.dataUjian.ujian,
                          'id_mapel':this.dataUjian.id_mapel})  
      await  this._data.updateData('Kelas',kelas).subscribe()

  }


  selesai(){
      let cekInternet
      let nilai:number = 0;
      this.getSoal().then((soal:any)=>{
        let total:number = soal.length
        soal.forEach((elm:any,i)=>{
          this.jawaban.forEach((dat:any,n)=>{
              if(elm._id === dat.id_soal && elm.jawaban === dat.jawab){
                  nilai++
              }
            })
            if(soal.length === i+1){
                this.cekArrayNilai('Siswa',localStorage.getItem('peserta').split('~')[0])
                     .then((siswa:any)=>{
                        if(this.internet){ // jika konek internet
                          if(localStorage.getItem('jawaban')){ //jika array jawaban masih ada
                            this.updateNilaiSiswa(nilai/total*100).then(()=>{
                              this._data.peringatan("Nilai anda "+(nilai/total*100))
                              this.accAdmin = false
                              localStorage.removeItem('admin')
                              localStorage.removeItem('jawaban')
                              localStorage.removeItem('waktu')
                            })
                          }
                        }else{ // jika internet terputus
                          cekInternet = setInterval(()=>{
                            if(this.internet){
                              if(localStorage.getItem('jawaban')){ //jika array jawaban masih ada
                                this.updateNilaiSiswa(nilai/total*100).then(()=>{
                                  this._data.peringatan("Nilai anda "+(nilai/total*100))
                                  this.accAdmin = false
                                  localStorage.removeItem('admin')
                                  localStorage.removeItem('jawaban')
                                  localStorage.removeItem('waktu')
                                  localStorage.removeItem('admin')
                                  localStorage.removeItem('error')
                                  localStorage.removeItem('connection')
                                  setTimeout(()=>{
                                    localStorage.clear()
                                    this._data.router = 'home'
                                  },10000)
                                })
                              }
                              clearInterval(cekInternet)
                              // console.log('berhasil  tersimpan')
                            }else{
                              this._data.pesan(true,'masih menunggu koneksi')
                              // console.log('belum tersimpan')
                            }
                          },5000)
                        }
                     })
              
                 this.cekArrayNilai('Kelas',localStorage.getItem('peserta').split('~')[2])
                     .then((kelas:any)=>{ 
                      //  console.log(kelas);
                       if(kelas.cek){
                        this.updateKelas(kelas.data).then(()=>{
                          this._data.pesan(true,"berhasil update kelas")
                        })
                       }
                     })           
            }
          })
      }).catch(e=>{
        this._data.pesan(true,"Server sedang sibuk, tunggu dan ulangi..",'err',10000)
      })
  }

  CekNisn(){
    return new Promise((resolve,reject)=>{
      let getNisn:boolean = false
      let objSiswa:any = {}
      for(let i = 0; this.allSiswa.length > i; i++){
        if(this.allSiswa[i].Nisn === this.siswa.nisn && this.allSiswa[i]._id === this.siswa.nama){
          getNisn = true
          this.siswa._id = this.allSiswa[i]._id
          this.dataUjian.peserta = this.siswa.NAMAS = this.allSiswa[i].Nama
          objSiswa = this.allSiswa[i]
          objSiswa.status = 'login'
          objSiswa.kode_ujian = this.dataUjian._id
        }
        if(this.allSiswa.length === i + 1){
          resolve({nisn:getNisn,obj:objSiswa})
        }
      }
    })
  }

 konfirm(){
  //  console.log(this.dataUjian)
   if(localStorage.getItem('waktu')){
    localStorage.setItem('admin','true')
  }
    if(!this.cekKode){
     this.cekKodeUjian().then(e=>{
        if(e){
          localStorage.setItem('standby',JSON.stringify(this.dataUjian))
          this.cekKode = true
          this.getSiswa()
          this.getKelas()
          this._data.pesan(true,'Pilih Nama dan isi NISN untuk memulai ujian',null,10000)
          if(this.dataUjian.status === "start"){
            localStorage.setItem('admin','true')
          }
        }else{
          this._data.peringatan('Ooops!, kode salah')
          this.kodeUjian = ''
        }
      })
    }else{ 
      this.CekNisn().then((e:any)=>{
        if(this.kelas.id_kelas == '' || this.kelas.id_kelas == null || this.kelas.id_kelas == undefined){
          this._data.pesan(true,'Maaf kelas belum di tentukan')
        }else{
            if(e.nisn){
              this._data.pesan(true,'Selamat Mengerjakan '+this.siswa.NAMAS,null,10000)
              localStorage.setItem('peserta',this.siswa._id+"~"+this.dataUjian._id+"~"+this.kelas.id_kelas+"~"+this.dataUjian.kode)
              this.konfirmasi = false
              this.accAdmin = Boolean(localStorage.getItem('admin'))
              this.dataGuruDanMapel()
              this.getSiswa()
              this.waktu()
              this.tombol = true
              this.getSoal().then((es:any)=>{
                this.allSoal = es
                this.delObjectSoal(es)
                delete this.dataUjian._id
                delete this.dataUjian.id_kelas
                delete this.dataUjian.kode
                delete  this.dataUjian.status
                localStorage.setItem('standby',JSON.stringify(this.dataUjian))
                // if(this.dataUjian)
              })
              this._data.updateData("Siswa",e.obj).subscribe(()=>{ //update siswa sudah login
                this._data.socket.emit('login')
                this.siswa = e.obj
              })
            }else{
              this._data.peringatan('NISN salah ya')
            }
        }
      })
    }
  }

  cekKodeUjian(){
    let cek:boolean = false
    return new Promise((resolve,reject)=>{
      this.allUjian.forEach((uji,i)=>{
        if(this.kodeUjian === uji.kode){
          cek = true
          this.dataUjian = uji
        }
      })
      resolve(cek)
    })  
  }

  batal(){
    this.outFull.call(document)
    localStorage.removeItem('Ujian')
    localStorage.removeItem('standby')
    localStorage.removeItem('soal')
    localStorage.removeItem('peserta')
    localStorage.removeItem('admin')
    localStorage.removeItem('error')
    localStorage.removeItem('waktu')
    if(localStorage.getItem('router')){
      this._data.router = localStorage.getItem('router') 
    }else{
      this._data.router = 'home'
    }
    window.location.reload()
    
  }

  async siswaKeluar(){
    this.siswa.status = await 'out'
    this.siswa.kode_ujian = await null
    await this._data.updateData('Siswa',this.siswa).subscribe(()=>{
      this._data.socket.emit('login')
    })
  }

  waktu(){
   
   this._data.socket.on('waktu ujian',(data:any)=>{
     if(localStorage.getItem('peserta')){
        if(localStorage.getItem('peserta').split('~')[1] === data.id){
            this.style ={'width': data.total+'%','display':'block','transition':'all 100ms'}
            this.menit = data.menit
            this.detik =  data.detik
            localStorage.setItem('waktu',data.menit+":"+data.detik+":"+data.total)
            // localStorage.setItem('admin','true')
        }
     }else{
        if(this.dataUjian._id === data.id){
            this.style ={'width': data.total+'%','display':'block','transition':'all 100ms'}
            this.menit = data.menit
            this.detik =  data.detik
            localStorage.setItem('waktu',data.menit+":"+data.detik+":"+data.total)
            // localStorage.setItem('admin','true')
        }
     }
   })
  }

  offline(){
    // console.log('waktu offline')
    if(localStorage.getItem('waktu')){
      let menit = parseInt(localStorage.getItem('waktu').split(':')[0])
      let detik = parseInt(localStorage.getItem('waktu').split(':')[1])
      let num =  parseInt(localStorage.getItem('waktu').split(':')[2])
      let total = parseInt(localStorage.getItem('waktu').split(':')[0])*60 + parseInt(localStorage.getItem('waktu').split(':')[1])
      this.time = setInterval(()=>{
      // console.log(total)
                detik--
                num = num + (100/total)
                if(num >= 100){
                  clearInterval(this.time)
                  num = 100
                }
                if(detik < 0){
                  detik = 59
                  menit--
                }
                if(menit < 0){
                  menit = 0
                }
                this.style ={'width': num+'%','display':'block','transition':'all 100ms'}
                this.menit = menit
                this.detik = detik
                localStorage.setItem('waktu',menit+":"+detik+":"+num)
              },1000)
        }
  }

  async updateUsedUjian(){
    this.dataUjian.tgl = await new Date()
    this.dataUjian._id = await localStorage.getItem('peserta').split('~')[1]
    if(this.dataUjian.use == undefined || this.dataUjian.use === null){
      this.dataUjian.use = await 1
    }else{
      this.dataUjian.use = await parseInt(this.dataUjian.use) + 1 
    }

    await this._data.updateData('Ujian',this.dataUjian).subscribe()
  }
  
}
