import { Component, OnInit, ViewChildren, QueryList, ElementRef} from '@angular/core';
import { DataService } from '../data.service';


@Component({
  selector: 'app-list-soal',
  templateUrl: './list-soal.component.html',
  styleUrls: ['./list-soal.component.css']
})
export class ListSoalComponent implements OnInit {
  allSoal:any = []
  allMapel:any = []
  listMapel:any = []
  kelas:any = ['7','8','9','10','11','12'] //['VII','VIII','IX','X','XI','XII']
  collectSoal:any = []
  guru:any = {}
  jumSoal:number;
  konfirmasi:boolean = false
  filterCmd:boolean = false
  _datas:any;
  group:any = {}
  selectSoal:any = {$or : [{jenjang:''},{kelas:''},{mapel:''},{isi:''}]}
  classLabel:string;
  posisi:string

  @ViewChildren('cekbox') cekbox :QueryList<ElementRef>

  constructor(private _data:DataService) { }

async  ngOnInit() {
    await this.semuaSoal()
    if(this._data.statusService){
      this.collectSoal = this._data.arrService.list
      this.classLabel = 'labelEdit'
      setTimeout(()=>{ this.listEdit(this._data.arrService.list)},100)
    }
    this.group.namaGroup = this._data.arrService.namaGroup
    this.selectSoal.jenjang = ''
    this.selectSoal.mapel = ''
    this._datas =  this._data
  }

  clearCekbox(){
    this.cekbox.forEach((elm)=>{
      elm.nativeElement.checked = false
    })
    this.collectSoal = []; 
    this.jumSoal = 0; 
    this._data.statusService = false
    this.group = {}
  }

  listEdit(arr){
    this.cekbox.forEach((lem)=>{
      arr.forEach((el)=>{
        if(el == lem.nativeElement.id){
          lem.nativeElement.checked = true 
        }
      })
    })
  }

  semuaSoal(){
    this._data.getData('Soal','sharing','true','full').subscribe((data)=>{
      this.allSoal = data
    })

    this._data.getData('Mapel').subscribe((data)=>{
      this.allMapel = data
    })

    this._data.getData('Guru','_id',localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')).subscribe((dat:any)=>{
      this.listMapel = dat[0].id_mapel
      this.guru = dat[0]
      // this.selectSoal.mapel = dat[0].id_mapel[0]
    })
  }

  groupSoal(event){
    this.filterCmd = false
    if(event.target.checked){
        if(this.collectSoal.indexOf(event.target.id) < 0){
          this.collectSoal.push(event.target.id)
        }
    }else{
      this.collectSoal.splice(this.collectSoal.indexOf(event.target.id),1)
    }
    this.jumSoal = this.collectSoal.length
  }

  async simpan(){
      // console.log(this.group.namaGroup)
    if(this.group.namaGroup != "" && this.group.namaGroup != undefined && this.group.namaGroup != null  ){
        this.group.list = await this.collectSoal
        this.group.tgl = await new Date();
        this.konfirmasi = false
        // disimpan baru
        if(!this._data.statusService){
          this._data.postData('Group',this.group).subscribe((data:any)=>{
            this._data.pesan(data.sukses,'Berhasil tersimpan')
          },(err)=>{this._data.pesan(false,'Koneksi terputus','error')})
        }else{
          // update
          this.group._id = await this._data.arrService._id
          this._data.updateData('Group',this.group).subscribe((docs:any)=>{
            this._data.router = 'folder'
            this._data.pesan(docs.sukses,'Berhasil di rubah')
          },(err)=>{this._data.pesan(false,'Koneksi terputus','error')})
        
        }
        this._data.statusService = await false
        this._data.arrService = await []
        this.collectSoal = await []
        this.jumSoal = await 0
        this._data.router = 'folder'
    }else{
      this._data.pesan(true,"Mohon isi nama soal, minimal 3 huruf")
    }
  }

  getSoal(arg){
    if(arg === "pribadi"){
      this._data.getData('Soal','sharing','false').subscribe((data)=>{
        this.allSoal = data
      })
    }else{
      this._data.getData('Soal','sharing','true','full').subscribe((data)=>{
        this.allSoal = data
      })
    }
  }

  soalBy(id){
    let by:any = []
    this.allSoal.forEach((data,i)=>{
      if(data.id_guru === id){
        by.push(data)
      }
      if(this.allSoal.length === i+1){
        setTimeout(()=>{
          this.allSoal = by
        },200)
      }
    })
  }

  duplicate(data){
    ['_id','id_guru','createdBy','sharing'].forEach((e,i)=>{ 
      delete data[e]
      data.id_guru = this.guru._id
      data.createdBy = this.guru.username
      data.sharing = 'false'
      if(i === 3){
        this._data.postData('Soal',data).subscribe((result:any)=>{
          this._data.pesan(true,'Soal di copy ke local','fixed')
          this.semuaSoal()
        })
      }
    })
    // console.log(data)
  }
}
