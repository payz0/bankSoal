import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  _datas:any
 klikAja:boolean    = false
 listMapel:boolean  = false
 allMapel:any       = []
 mapel:any          = {mapel:''}
 guru:any           = {}
 fotoProfil:string

  constructor(private _data:DataService) { }

  ngOnInit() {
    this._datas = this._data
    this.tampilData('Mapel').then((data)=>{this.allMapel = data})
    this.datasGuru()
  }

  datasGuru(){
    this.tampilData('Guru','_id',localStorage.getItem('id_guru['+localStorage.getItem('$key')+']'))
    .then((data:any)=>{
      this.guru = this._data.dataGuru =  data[0]
      if(typeof data[0].foto == undefined || data[0].foto == null){
        this.fotoProfil = "/assets/images.png"
      }else{
        this.fotoProfil =  "'"+this._data.basePort+"profil/"+data[0].foto+"'"
      }
      
      // console.log(data[0].foto);
      
    })
  }

  tampilData(tabel,id=null,val=null){
    return new Promise ((resolve,reject)=>{
      this._data.getData(tabel,id,val).subscribe((data:any)=>{
         resolve(data)
      })
    })
  }

  async tambahMapel(){
    let statusMapel:boolean = await true
    await this.allMapel.forEach(async (elm,i)=>{
      if(elm.mapel.toLowerCase().replace(/\s/g,'') === this.mapel.mapel.toLowerCase().replace(/\s/g,'')){
        await this.guru.id_mapel.push(elm._id)
        this.mapel.mapel = await ''
        this.listMapel = await false
        statusMapel = await false
      }
    })
    if(await statusMapel){
      if(this.mapel.mapel.length >= 3){
          this._data.postData('Mapel',this.mapel).subscribe((data:any)=>{
            this._data.pesan(data.sukses,"Bidang study baru di tambahkan")
            this.allMapel.push(data._doc)
            this.listMapel = false
            this.addMapel('ent',data._doc._id)
            this.mapel.mapel = ''
          })
      }
      // else{
      //   this._data.peringatan('Mata pelajaran tidak boleh kosong, minimal 3 huruf')
      // }
    }
    
    // console.log(jum)
  }

  async addMapel(mapel,ket=null){
    if(ket === null){
      if(mapel.target.value === 'null'){
        this.listMapel = true
      }else if(mapel.target.value != ''){
        await this.guru.id_mapel.push(mapel.target.value)
        await this._data.updateData('Guru',this.guru).subscribe((data:any)=>{
          this._data.pesan(data.sukses,'Bidang study di tambahkan')
          this.listMapel = false
          this.mapel.mapel = ''
        })
      }
    }else{
        await this.guru.id_mapel.push(ket)
        await this._data.updateData('Guru',this.guru).subscribe((data:any)=>{
          // this._data.pesan(data.sukses,'Mapel anda di hapus')
          this.listMapel = false
          this.mapel.mapel = ''
        })
    }
    
  }


  async hapusMapel(id){
    await this.guru.id_mapel.splice(this.guru.id_mapel.indexOf(id),1)
    await this._data.updateData('Guru',this.guru).subscribe((data:any)=>{
        this._data.pesan(data.sukses,'Bidang study anda di hapus')
        
      })
    // console.log(this.guru.id_mapel)
  }


  simpan(){
    if(this.guru.id_mapel.length > 0){
      this._data.updateData('Guru',this.guru).subscribe((data:any)=>{
        this.guru = data._doc
        this._data.pesan(data.sukses,'Berhasil di update')
        this.datasGuru()
      })
    }else{
      this._data.peringatan('Maaf mata pelajaran guru tidak boleh kosong')
    }
  }

  // compressFile() {
   
  //     this._data.imageCompress.uploadFile().then(({image, orientation}) => {
  //       // this.imgResultBeforeCompress = image;
  //       console.warn('Size in bytes was:', this._data.imageCompress.byteCount(image));
       
  //       this._data.imageCompress.compressFile(image, orientation, 40, 30).then(
  //         result => {
            
            
  //           this.guru.foto = result;
  //           console.warn('Size in bytes is now:', this._data.imageCompress.byteCount(result));
  //         });
  //     });
  // }

  upload(event){
    let file = <File>event.target.files[0];
    let reader = new FileReader();  
    let dataFile = new FormData()
    dataFile.append('image',file)
    reader.readAsDataURL(file);  
    // reader.onload = e => {  reader.result}
      // console.log(reader.result);
      this._data.upload(dataFile,'profil').subscribe((nama)=>{
        // setTimeout(())
        if(nama != undefined){
            this.guru.foto = nama
            this.fotoProfil = "'"+this._data.basePort+"profil/"+nama+"'"
        }
        // console.log(nama);
        this.simpan()
        
      })
      
    
  }
}
