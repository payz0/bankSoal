import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data.service';
// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-soal',
  templateUrl: './soal.component.html',
  styleUrls: ['./soal.component.css']
})
export class SoalComponent implements OnInit {
  Soal:any = {}
  allSoal:any = []
  kelas:any = ['7','8','9','10','11','12']
  tombolEdit:boolean = false
  configEditor:any = [false,false,false,false]
  boardActive:boolean = false
  peringatanHapus:boolean = false
  konfirmasi:boolean = false
  noteWarning:boolean 
  dataExcel:any = []
  allMapel:any = []
  listMapel:any = []
  _datas:any
  pilihSoal:any = {$or : [{mapel:''},{kelas:''},{isi:''}]}
  editorInstance:any
  typeFile:any = ['jpg','jpeg','gif','png','bmp','tiff']
  showGallery:boolean = false
  allImage:any

  constructor(private _data:DataService) {
    
   }

  ngOnInit() {
    this.Soal.kelas = null
    this.Soal.mapel = null
    this.Soal.jenjang = null
    this.noteWarning = false
    this.nonActive()
    this.TampilSoal()
    this._datas = this._data 
  }

  imageEditorHandler() {  
    let base64result:any
    let data:any  = this.editorInstance
    if (this.editorInstance != null) {  
        const range = this.editorInstance.getSelection();  
        if (range != null) {  
            let input = document.createElement('input');  
            input.setAttribute('type', 'file');  
            input.setAttribute('accept', 'image/*');
            input.addEventListener('change', () => {  
                if (input.files != null) {  
                    let file = input.files[0];  
                    if (file != null) {  
                        let reader = new FileReader();  
                        let dataFile = new FormData()
                        dataFile.append('image',file)
                        reader.readAsDataURL(file);  
                        reader.onerror = function(error) {  
                            // console.log('Error: ', error);  
                        };  
                        reader.onloadend = function() {  
                            //Read complete  
                            if (reader.readyState == 2) {  
                                base64result = reader.result;  
                               }  
                        };
                           
                        this.typeFile.filter((type)=>{
                            if(file.name.split('.')[1].toLowerCase() === type ){
                               this._data.upload(dataFile).subscribe((e)=>{
                                  data.insertEmbed(range.index, 'image', this._data.basePort+"gambar/"+e);
                                })
                            }
                        })
                    }  
                }  
            });  
            input.click();
        }  
        
    }  
  }  

// upload(event){ //gak kepakai ni
//   let file = event.target.files[0]
//   if(file !=null ){
//     let dataFile = new FormData()
//     dataFile.append('image',file)
//     const reader = new FileReader();
//     reader.onload = e => reader.result;
//     reader.readAsDataURL(file);
//     this._data.upload(dataFile).subscribe((data)=>{
//       this._data.peringatan(data)

//     })
//   }
// }

  setFocus(quill:any) {
    quill.focus()
    this.editorInstance = quill;
    let toolbar = quill.getModule('toolbar');  
    toolbar.addHandler('image', this.imageEditorHandler.bind(this)); 
  }


  nonActive(){
    this.configEditor = [false,false,false,false];
  }

  async toolbar(num){
     if(num <= 3){
      await this.nonActive()
      this.configEditor[num]  = await true;
    }else{
      this.nonActive()
      this.configEditor[100] = await true
    }
    
  }

  soalValidasi(){
    let cek = ["kelas", "mapel", "jenjang", "isi", "opsiA", "opsiB", "opsiC", "opsiD", "jawaban"]
    let valid:boolean = true
    return new Promise((resolve,reject)=>{
        cek.forEach((data,i)=>{
          if(this.Soal[data] == null){
            this._data.pesan(true,data+' masih kosong')
            valid = false
            if(data == 'kelas' || data == 'mapel' || data == 'jenjang'){
              this.noteWarning = true
            }
          }
          if(cek.length === i+1){
            resolve(valid)
          }
        })
      })
  }

  TambahSoal(){
    this.nonActive()
    this.soalValidasi().then((valid)=>{
      if(valid){
        this._data.cekDataInData(this.Soal._id).then((cek)=>{
          if(!cek){
              if(this.tombolEdit){
                this._data.updateData('Soal', this.Soal).subscribe((data:any)=>{
                  this._data.pesan(data.sukses,"Soal berhasil di rubah")
                  this.TampilSoal();
                  this.Soal = {}
                  this.tombolEdit = false
                  this.noteWarning = false
                },(err)=>{
                  this._data.pesan(false,'Koneksi terputus','error')
                })
              }else{
                this._data.postData('Soal',this.Soal).subscribe(
                  (data:any)=>{
                    this.noteWarning = false
                    this.TampilSoal();
                    this.Soal = {}
                    this._data.pesan(data.koneksi,'Soal berhasil di tambah')
                  },(err)=>{
                    this._data.pesan(false,'Koneksi terputus','error')
                  })
              }
            }else{
              this._data.peringatan("Soal tidak bisa di rubah, karena terdaftar dalam koleksi soal anda")
              this.TampilSoal();
              this.Soal = {}
              this.tombolEdit = false
            }
        })
      }})
  }

  batal(){
    this.nonActive()
    this.Soal = {}
    this.tombolEdit = false
  }

  HapusSoal(data){
    this.Soal = data
    this.peringatanHapus = true
    this.noteWarning = false
  }

  yaHapus(){
    this._data.cekDataInData(this.Soal._id).then((data)=>{
      if(!data){ 
         this._data.deleteData('Soal',this.Soal._id).subscribe((docs:any)=>{
            this.Soal = {}
            this.tombolEdit = false
            this.TampilSoal()
            this._data.pesan(docs.sukses,'Soal berhasil di hapus')
          },(err)=>{
             this._data.pesan(false,'Koneksi terputus','error')
          })
      }else{
        this._data.peringatan("Soal tidak bisa di hapus, karena terdaftar dalam koleksi soal anda")
      }
    })
  }

  CeckSoal(data){
    this.Soal = data
    this.tombolEdit = true
    this.nonActive()
  }

  TampilSoal(){
    this._data.getData('Soal','sharing','false').subscribe((data)=>{
      this.allSoal = data
    })
    this._data.getData('Mapel').subscribe((data)=>{
      this.allMapel = data
    })
    this._data.getData('Guru','_id',localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')).subscribe((dat:any)=>{
      this.listMapel = dat[0].id_mapel
      this.Soal.createdBy = dat[0].username
      this.Soal.sharing = 'false'    
    })
  }

  importExcel(event){
    let obj = ["isi", "opsiA", "opsiB", "opsiC", "opsiD", "jawaban"]
    let cek:boolean = true
    this._data.RubahXlsToJson(event).then(async (data:any)=>{
      event.target.value = await ''
      await Object.keys(data[0]).forEach((key,n)=>{
          if(obj.indexOf(key) < 0){
            cek = false
          }
        })
      if(cek){
        data.forEach((elm,i)=>{
          this.dataExcel.push(Object.assign(elm,{createdBy: this.Soal.createdBy,kelas:this.Soal.kelas,mapel:this.Soal.mapel,jenjang:this.Soal.jenjang,sharing:'false'}))
        })
        this.konfirmasi = true
      }else{
        this._data.peringatan('Mohon gunakan format excel yang sesuai pada file download')
      }

    })
  }

  simpanDataExcel(){
    this.Soal = {}
    let num:number = 0;
    this.konfirmasi = false
    for(let i = 0; this.dataExcel.length > i; i++){
      setTimeout(()=>{
        this._data.postData('Soal',this.dataExcel[i]).subscribe(
          (data:any)=>{
            this.TampilSoal();
            this._data.pesan(data.sukses,'Soal berhasil di tambah')
          },(err)=>{
            this._data.pesan(false,'Koneksi terputus','error')
          })
        num++  
      },100*i)
    }
  }
 
  Sharing(data){
    // console.log(Object.assign(data,{sharing:'true'}))
    this._data.updateData('Soal',Object.assign(data,{sharing:'true'})).subscribe((dat:any)=>{
      this.TampilSoal()
      this._data.pesan(dat.sukses,"Soal sudah di bagi untuk umum")
    })
  }

  gallery(){
    this.konfirmasi = true
    this.showGallery = true
    this._data.getAllImage().subscribe((datas:any)=>{
      this.allImage = []
      datas.forEach((dat,i)=>{
        setTimeout(()=>{
          this.allImage.push(dat)
        },50*i)
      })
    })
  }

  insertImage(image){
    if (this.editorInstance != null) {  
      this.editorInstance.focus()
      const range = this.editorInstance.getSelection();
      this.editorInstance.insertEmbed(range.index,'image',this._data.basePort+"gambar/"+image)
    }
  }
}
