import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-kelas',
  templateUrl: './kelas.component.html',
  styleUrls: ['./kelas.component.css']
})
export class KelasComponent implements OnInit {
  _datas:any;
  kelas:any = {}
  semuaSiswa:any = []
  semuaKelas:any
  semuaMapel:any = []
  listMapel:any = []
  dataUjian:any = []
  // ujian:any = {}
  konfirmasi:boolean = false
  select:boolean = false
  pindahKelas:boolean  = false
  editNamaKelas:boolean = false
  num:any=[]
  folderId:any ={}
  cariNilai:any = {$or : [{id_mapel:''},{id_ujian:''}]}
  peringatanHapus:boolean = false
  hidden:boolean = false
  onlyMapel:string

  constructor(private _data:DataService) { }

  ngOnInit() {
    this._datas = this._data
    this.allData('Siswa','Nama','id_kelas', 'null').then(data=>{this.semuaSiswa = data})
    this.allData('Kelas','kelas').then(data=>{this.semuaKelas = data})
    this.allData('Mapel','mapel').then(data=>{this.semuaMapel = data})
    this.allData('Guru',null,'_id',localStorage.getItem('id_guru['+localStorage.getItem('$key')+']'))
    .then(data=>{
      this.listMapel = data[0].id_mapel
      this.cariNilai.id_mapel = data[0].id_mapel[0]
    })
    this.allData('Ujian','ujian','hapus','false').then(hasil=>{this.dataUjian = hasil})
    
  }

  allData(get:string,urut=null,id=null,val=null){
      return new Promise((resolve,reject)=>{
        this._data.getData(get,id,val).subscribe((data:any)=>{
          if(urut !== null){
            resolve(data.sort((a,b)=>{return this._data.urutan(a,b,urut,1)}))
          }else{
            resolve(data)
          }
          
        },(err)=>{
          this._data.pesan(false,'Koneksi terputus','error')
        })
      })
    
    }

  updateKelasSiswa(id,pesan){
    this.num.forEach((elm,i)=>{
      this._data.updateData('Siswa',{_id:elm, id_kelas:id}).subscribe((data:any)=>{
        this._data.pesan(data.sukses,pesan)
        // this.kelas = {}
      })
      if(this.num.length === i+1){
        // this.num = []
        this.allData('Siswa','Nama','id_kelas', id).then(data=> this.semuaSiswa = data)
        this.pindahKelas = false
      }
    })
  }

 async tambahKelas(){
   if(this.kelas.kelas != undefined){
      this.konfirmasi = false
      await this._data.postData('Kelas',this.kelas).subscribe(async (data:any)=>{
          this._data.pesan(data.sukses,'Kelas berhasil di tambah')
          this.folderId = data
          await this.allData('Kelas','kelas').then(data=>this.semuaKelas = data)
          await this.updateKelasSiswa(data._doc._id,'Siswa sukses di tambahkan kelas '+this.kelas.kelas)
          this.num = []
          this.kelas = {}
          
      },(err)=>{
        this._data.pesan(false,'Koneksi terputus',"error")
      })
    }else{
      this._data.pesan(true,'Kelas tidak boleh kosong')
    }
  }


async gotoKelas(kelas){
   await this.updateKelasSiswa(kelas._id,'Siswa sudah di pindahkan')
   await this._data.cekKelasPadaDataUjian(this.dataUjian,kelas._id,this.num).then((e:any)=>{
         e.forEach(val=>{
          this._data.updateData('Ujian',val).subscribe()
         })
         
      })
    this.kelas = await {}
    this.folderId = await kelas 
    this.num = await []


  }

  adds(arg){
  
    if(this.num.indexOf(arg) < 0){
      this.num.push(arg)
    }else{
      this.num.splice(this.num.indexOf(arg),1)
    }
  }

  selectAll(){
    this.select = !this.select
    if(this.select){
      this.semuaSiswa.forEach(element => {
        this.num.push(element._id)
      });
    }else{
      this.num = []
    }
  }

 pilihKelas(kelas){
      // console.log(kelas);
      
      this.num = []
      this.folderId = kelas
      this.folderId.kolom = kelas.ujian.length
      this.allData('Siswa','Nama','id_kelas',kelas._id).then((data:any)=> {this.semuaSiswa = data; })
     
    }

  editKelas(){
    this.editNamaKelas = !this.editNamaKelas
    this.allData('Kelas','kelas').then(data=> this.semuaKelas = data)
  }

  rubahKelas(data){
    this._data.updateData('Kelas',data).subscribe((docs:any)=>{
      this.allData('Kelas','kelas').then(data=> this.semuaKelas = data)
      this.folderId = {}
      this.editNamaKelas = false
      this._data.pesan(docs.sukses,'Nama kelas berubah')
    },(err)=>{this._data.pesan(false,'Gangguan pada server','error')})
  }

  hapusKelas(id){
    this.kelas._id = id
    this.peringatanHapus = true
    // this.dataUjian.forEach((val)=>{
    //   if(val.id_kelas.indexOf(id) >-1){
    //     val.id_kelas.splice(val.id_kelas.indexOf(id),1)
    //     console.log(val)
    //       // .ujian+" kelas "+val.id_kelas[val.id_kelas.indexOf(id)]);
    //   }
    // })
  }

  async yaHapus(){
    // cek id siswa dalam kelas sekaligus di update
    this.num = await []
    await this.allData('Siswa','Nama','id_kelas',this.kelas._id).then(data=> this.semuaSiswa = data)
    await this.semuaSiswa.forEach(async (elm,i)=>{
      await this.num.push(elm._id)
      if(this.num.length === i+1){
        await this.updateKelasSiswa('null','siswa keluar')
      }
    })
    // siswa yang ikut terhapus dari ujian
       this._data.cekKelasPadaDataUjian(this.dataUjian,this.kelas._id,this.num,'hapus','kelas').then((result:any)=>{
        // console.log(result);
        result.forEach(val=>{
          this._data.updateData('Ujian',val).subscribe()
        })
        
      })
    //  hapus nama kelas
      await this._data.deleteData('Kelas',this.kelas._id).subscribe((data:any)=>{
        this._data.pesan(data.sukses,'Kelas '+data._doc.kelas+' telah di hapus')
        this.kelas = {}
        this.allData('Kelas','kelas').then(datas=> this.semuaKelas = datas) 
        this.num = []
      },(err)=>{this._data.pesan(false,'Koneksi terputus','error')}) 
  }

  tanpaKelas(){
    this.folderId = {}; 
    this.allData('Siswa','Nama','id_kelas','null').then(data=>{ this.semuaSiswa = data});
    this.editNamaKelas = false
    this.num = []
  }

  modalKelas(){
    this.konfirmasi = true;
    this.kelas = {} ; 
    this.allData('Siswa','Nama','id_kelas','null').then(result=>{this.semuaSiswa = result})
    this.num = []; 
  }

  NilaiKosong(obj,id){
    if(obj.map((el)=>{return el.id_ujian}).indexOf(id) < 0){
      return true
    }else{
      return false
    }
  }

  async exportExcel(){
    this.mapelChange()
    this.hidden = await true
    setTimeout(()=>{
       this._data.createExcel('getExcel',this.folderId.kelas)
       this.hidden = false
    },0)
  }

  mapelChange(){
    this.semuaMapel.filter((el)=>{
      if(el._id === this.cariNilai.id_mapel){
        this.onlyMapel = el.mapel
      }
    })
  }

}
