import { Component, OnInit, ViewChildren, QueryList, ElementRef} from '@angular/core';
import { DataService } from '../data.service';



@Component({
  selector: 'app-rencana',
  templateUrl: './rencana.component.html',
  styleUrls: ['./rencana.component.css']
})
export class RencanaComponent implements OnInit {
  allGroup:any = []
  allKelas:any = []
  allUjian:any = []
  allSiswa:any = []
  allMapel:any = []
  listMapel:any = []
  arrPlay:any = []
  konfirmasi:boolean = false
  peringatanHapus:boolean = false
  editView:boolean = false //menampilkan form edit dengan data
  getPreview:boolean = false
  ujian:any = {}
  peserta:any = [] // cek peserta login
  kelas:any = []
  tahun:any = []
  _datas:any
  style:any = [{}]
  interTime:any ={}
  playUjian:any = {}

  @ViewChildren('cekUjian') cekUjian :QueryList<ElementRef>
  constructor(private _data:DataService) { }

  ngOnInit() {
    this.getSemuaData('Group')
    this.getSemuaData('Kelas')
    this.getSemuaData('Ujian','hapus',false)
    this.getSemuaData('Siswa')
    this.getSemuaData('Mapel')
    this.getSemuaData('Guru','_id',localStorage.getItem('id_guru['+localStorage.getItem('$key')+']'))
    this.tahunAjaran()
    this._datas = this._data

    // get data waktu ujian
    this._data.socket.on('waktu ujian',(tot:any)=>{
      let total:any = {}
      total[tot.id] = tot.total
      this.playUjian[tot.id] = true
      this.style[tot.id] = {'background': 'red','width':  total[tot.id]+'%', 'display':'block','transition':'all 100ms'}
    })

    // jika ujian berhenti
    this._data.socket.on('ujian berhenti',(data:any)=>{
      setTimeout(async() => {
        this.playUjian[data.id] = await false
        this.ujian = await data.obj
        await this.update('gakFull','standby')
      }, 100)
      // console.log(data.obj)
      if(data.update != 'only'){
        this._data.peringatan("Ujian "+data.nama+" selesai")
      }
    })

    //  jika ada pserta masuk
    this._data.socket.on('send login',()=>{
      this.getSemuaData('Siswa')
    })

    this._data.socket.on('update comp rencana', async (data)=>{
      this.ujian = await data
      await this.update('gakFull','standby')
      this.allSiswa.forEach(async(elm)=>{
        if(data._id === elm.kode_ujian){
          elm.status = await 'out'
          elm.kode_ujian = await null
          await this._data.updateData('Siswa',elm).subscribe()
        }
      })

    })
  }

  allTabel(arg:string,data:any){
    switch (arg) {
      case 'Group':
        this.allGroup = data
        break;
      case 'Kelas':
        this.allKelas = data
        break;
      case  'Ujian':
        this.allUjian = data
        data.forEach(elm=>{
          if(elm.status === "start"){
            this.playUjian[elm._id] = true
            this._data.socket.emit('reload comp rencana',elm)
          }else{
            this.playUjian[elm._id] = false
          }
        })
        break;
      case  'Siswa':
        this.allSiswa = data
        break;
      case  'Mapel':
        this.allMapel = data
        break;
      case  'Guru':
        this.listMapel = data[0].id_mapel
        break;
      default:
        break;
    }
  }

getSemuaData(tabel:string,prop:string=null,val=null){
    this._data.getData(tabel,prop,val).subscribe((data:any)=>{
      this.allTabel(tabel,data)
    },(err)=>{
      this._data.pesan(false,'Koneksi terputus','error')
    })
  }

simpan(){
  this._data.formValidator(this.cekUjian,'id').then(cek=>{
    if(cek){
        this.ujian.hapus    = 'false'
        this.ujian.status   = 'standby'
        this.ujian.kode     = this._data.Acak(5)
        this.ujian.id_kelas = this.kelas
        this.getSiswaFromKelas().then((dat)=>{
            this.ujian.id_siswa = dat
            this._data.postData('Ujian',this.ujian).subscribe((data:any)=>{
              this._data.pesan(data.sukses,"Ujian sukses di tambahkan")
              this.getSemuaData('Ujian','hapus','false')
              this.kelas = []
              this.ujian = {}
              this.konfirmasi = false
            },(err)=>{
              this._data.pesan(false,'Koneksi terputus','error')
            })
        })
      }
    })
  }

  allPeserta(event){
    if(event.target.checked){
      if(this.kelas.indexOf(event.target.id) < 0){
        this.kelas.push(event.target.id)
      }
    }else{
      this.kelas.splice(this.kelas.indexOf(event.target.id),1)
    }

  }

  hapusUjian(data){
    this.peringatanHapus = true
    this.ujian = data
  }

  yaHapus(){
    this._data.updateData('Ujian',{'_id':this.ujian._id,'hapus':'true'}).subscribe((data:any)=>{
      this.getSemuaData('Ujian','hapus','false')
      this._data.pesan(data.sukses,"Soal telah di hapus")
      this.ujian = {}
    })
  }

  tahunAjaran(){
    let sekarang = new Date()
    let thn:number = sekarang.getFullYear() - 2
    let jum:number = 6
    let bfr:number
    for(let i = 0; jum > i;i++){
      this.tahun.push({'tahun':Number(thn-1+i)+"/"+Number(thn+i)})
    }
  }

  async kode(kode){
      this.ujian = await kode
      this.ujian.kode = await this._data.Acak(5)
     await this._data.updateData('Ujian',this.ujian).subscribe((data:any)=>{
        this._data.pesan(data.sukses,"Kode sudah berubah")
        this.ujian = {}
      })
  }

  update(arg,val=null){
    this.getSiswaFromKelas().then(async (data)=>{
      if(arg === 'full'){
        this.ujian.id_siswa = await data
        this.ujian.id_kelas = await this.kelas
      }else{
        this.ujian.status   = await val
      }
      await this._data.updateData('Ujian',this.ujian).subscribe((data:any)=>{
        // this._data.pesan(data.sukses,"Sukses Update")
        this.editView = false
        this.ujian = {}
        this.getSemuaData('Ujian','hapus',false)
      })
    })
  }

  getSiswaFromKelas(){
    return new Promise((resolve,reject)=>{
      let peserta:any = []
      for(let i = 0; this.allSiswa.length > i; i++){
        this.kelas.forEach((elm,n)=>{
          if(this.allSiswa[i].id_kelas === elm){
            peserta.push(this.allSiswa[i]._id)
          }
        })
        if(this.allSiswa.length === i+1){
          resolve(peserta)
        }
      }
    })
  }

  edit(data){
    this.ujian = data;
    this.konfirmasi = true
    this.getPreview = false
  }

//  async timer(waktu,index){
//     let menit:any = await {}
//     let total:any = await {} 
//     // this._data.socket.on('tests',(tot:any)=>{
//     //   total[tot.id] = tot.total
//     //   this.style[tot.id] = {'background': 'red','width':  total[tot.id]+'%', 'display':'block','transition':'all 100ms'}
//     // })
//     total[index._id] = await 0
//     menit[index._id] = await (waktu*60)
//     this.interTime[index._id] = setInterval(async ()=>{
//                           total[index._id] = await total[index._id]+(100/menit[index._id])
//                           this.style[index._id] = {'background': 'red','width': total[index._id]+'%', 'display':'block','transition':'all 100ms'}
//                           if(total[index._id] >= 100){
//                             clearInterval(this.interTime[index._id])     
//                             this._data.peringatan("Waktu Ujian "+index.ujian+" habis !")
//                             this.playUjian[index._id] = await false
//                             this.pause(index)
//                           }

//                           // this._data.socket.emit('test',{total:total[index._id],id:index._id})
                          
//                           if(!this.playUjian[index._id] && total[index._id] < 100){
//                             clearInterval(this.interTime[index._id])
//                             this.arrPlay = await []
//                             this._data.peringatan("Ujian "+index.ujian+" di hentikan")
//                           }
//                          },300)
//   }

  async play(data){
    this.ujian = await data
    this._data.socket.emit('start-ujian', {cek:true,id_ujian:data._id})
    this._data.play_ujian(data._id,data.durasi,data.ujian,data)
    this.update('gakfull','start')
  }

  async pause(data){
    this.ujian = await data
    this._data.stop_ujian(data._id,data.durasi,data.ujian,data)
    // this.update('gakfull','standby')
  }

  preview(data){
    this.ujian = data
    this.getPreview =  true
    this.konfirmasi =  true
    this._data.socket.on('send login',()=>{
      setTimeout(()=>{
        this.reloadPeserta(data)
      },500)
    })
    this.reloadPeserta(data)
  }

  reloadPeserta(data){
    let jum:number = 0
    this.peserta = []
    data.id_siswa.forEach((id,i)=>{
      this.allSiswa.forEach((elm)=>{
         if(id === elm._id){
           this.peserta.push(elm)
         }
      })
      if(data.id_siswa.length == i+1){
        this.peserta.sort((a,b)=>{ return this._data.urutan(a,b,'id_kelas',1)})
        this.peserta.forEach((el,n)=>{
          if(el.status === 'login'){
            jum++
          }
          if(this.peserta.length === 1+n){
            this.ujian.jum = jum
          }
        })
      }      
    })
  }
  
  async exitSiswa(data){
    data.status = await 'out'
    data.kode_ujian = await null
    await this._data.updateData('Siswa',data).subscribe(()=>{
      this._data.pesan(true,'Siswa keluar ujian')
      this._data.socket.emit('siswa di keluarkan',data)
    })
  }
}
