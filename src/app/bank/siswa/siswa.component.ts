import { Component, OnInit,  ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
// import { HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-siswa',
  templateUrl: './siswa.component.html',
  styleUrls: ['./siswa.component.css']
})
export class SiswaComponent implements OnInit {
  Siswa:any = {}
  _datas:any
  allSiswas:any = []
  allKelas:any  = []
  dataUjian:any = []
  konfirmasi:boolean = false
  dataExcel:any = []
  num:any = []
  editData:boolean = false
  cariSiswa:any = {$or : [{Nama:''},{id_kelas:''}]}
  peringatanHapus:boolean = false
  formDaftar:boolean = false

  @ViewChildren('cekInput') cekInput :QueryList<ElementRef>

  constructor(private _data:DataService) { }

  ngOnInit() {
    this._datas = this._data
    this.cariSiswa.id_kelas = ""
    this.getDatas('Siswa').then((data)=>{this.allSiswas = data})
    this.getDatas('Kelas').then((data)=>{this.allKelas = data})
    this.getDatas('Ujian','hapus','false')
    .then((data:any)=>{
      this.dataUjian = data
    })
    this.Siswa.id_kelas = 'null'
  }
  
  tambahSiswa(datas){
    datas.id_kelas = 'null'
    this._data.formValidator(this.cekInput,'placeholder','angka').then(cek=>{
      if(cek){
            if(this.editData){
                this._data.updateData('Siswa',datas).subscribe((data:any)=>{
                  this._data.pesan(data.sukses,datas.Nama+" sudah di rubah")
                  this.editData = false
                  this.getDatas('Siswa').then((data)=>{this.allSiswas = data})
                },(err)=>{
                  this._data.pesan(false,'Koneksi terputus','error')
                  // this.editData = false
                })
            }else{
              if(this.allSiswas.findIndex(p => p.Nisn == datas.Nisn) < 0){
                this._data.postData('Siswa', datas).subscribe((data:any)=>{
                  this._data.pesan(data.sukses,datas.Nama+ " berhasil di tambahkan")
                  this.getDatas('Siswa').then((data)=>{this.allSiswas = data})
                },(err)=>{
                  this._data.pesan(false,"Koneksi terputus",'error')
                })
              }else{
                this._data.peringatan('Nisn sudah terdaftar')
                this.editData = false
              }
            }
          
        // })
        this.getDatas('Siswa').then((data)=>{this.allSiswas = data})
        this.Siswa = {}    
        // this.editData = false
      }   
      
    })
  }

  getDatas(arg,id=null,val=null){
    return new Promise((resolve,reject)=>{
      this._data.getData(arg,id,val).subscribe(data=>{
        resolve(data)
      },err=>{ this._data.pesan(false,'Koneksi terputus','error')})
    })
   
  }

  tambahSiswaExcel(datas){
    this._data.postData('Siswa', datas).subscribe((data:any)=>{
      this._data.pesan(data.sukses,datas.Nama+ " berhasil di tambahkan")
      this.getDatas('Siswa').then((data)=>{this.allSiswas = data})
    },(err)=>{
      this._data.pesan(false,"Koneksi terputus",'error')
    })
  }

  simpanDataExcel(){
    let num:number = 0;
    this.konfirmasi = false
    for(let i = 0; this.dataExcel.length > i; i++){
      setTimeout(()=>{
        this.dataExcel[i].id_kelas = 'null'
        this.tambahSiswaExcel(this.dataExcel[i])
        num++  
      },100*i)
    }
  }

  dataKosong(data){
    let cek:boolean = false
    if(data === undefined){
      cek = true
    }
    if(cek){
      this._data.peringatan('Terdeteksi ada data kosong, silahkan perbaiki')
      this.konfirmasi = false;
    }
  }

  koreksiNisn(arr){
      if([...new Set(arr.map(a => a.Nisn))].length != arr.length){ //set array tanpa duplicate data
        this._data.peringatan('Terdeteksi ada NISN sama di excel, silahkan perbaiki')
        this.konfirmasi = false
      }
      arr.forEach((val)=>{
        if(this.allSiswas.findIndex(p => p.Nisn == val.Nisn) > -1){ // deteksi index object key
          this._data.peringatan('Maaf ada NISN yang sudah terdaftar, silahkan perbaiki')
          this.konfirmasi = false
        }
      })
  }

  importExcel(event){
    let obj = ["Nama", "Nisn", "Nipd"]
    let cek:boolean = true
    this._data.RubahXlsToJson(event).then(async(data:any)=>{
      await Object.keys(data[0]).forEach((key,i)=>{
        if(obj.indexOf(key) < 0){
              cek = false
            }            
        })
      event.target.value = ''
     
      if(cek){
        this.dataExcel = data
        this.konfirmasi = true 
        this.koreksiNisn(data)
        data.forEach((val)=>{
            this.dataKosong(val.Nama)
            this.dataKosong(val.Nisn)
            this.dataKosong(val.Nipd)
        }) 
             
      }else{
        this._data.peringatan('Mohon gunakan format yang sudah di tentukan')
      }
    })
  }

  adds(arg){
  
    if(this.num.indexOf(arg) < 0){
      this.num.push(arg)
    }else{
      this.num.splice(this.num.indexOf(arg),1)
    }
  }
  
  delete(data){
    this.Siswa = data
    this.peringatanHapus = true
  }

  yaHapus(){
          this._data.deleteData('Siswa',this.Siswa._id).subscribe((data:any)=>{
            this._data.pesan(data.sukses,this.Siswa.Nama+" berhasil di hapus")
            this.getDatas('Siswa').then((data)=>{this.allSiswas = data})      
            this.editData = false
            if(this.dataUjian.length === 0){
              this.Siswa = {}
            }else{
              this._data.cekKelasPadaDataUjian(this.dataUjian,'id kelas',[this.Siswa._id]).then((dat:any)=>{
                dat.forEach((val)=>{
                  this._data.updateData('Ujian',val).subscribe()
                })
                
                this.Siswa = {}
              })
            }           
          })
   
  }

  edit(data){
    this.Siswa = data
    this.editData = true
  }


}
