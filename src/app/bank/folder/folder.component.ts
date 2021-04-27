import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit {
  GroupSoal:any = []
  namaFolder:boolean =false;
  konfirmasi:boolean = false;
  objNama:any = {}
  listSoal:any 
  peringatanHapus:boolean = false
  _datas:any

  constructor(private _data:DataService) { }

  ngOnInit() {
    this._datas = this._data
    this.getListSoal()
  }

  getListSoal(){
    this._data.getData('Group').subscribe((data:any)=>{
      this.GroupSoal = data
    },(err)=>{
      this._data.pesan(false,'Koneksi terputus','error')
    })
  }

  hapusGroup(id){
    this._data.getData('Ujian','hapus','false').subscribe((data:any)=>{ //cek ujian yang belum di hapus
      // console.log(data);
      if(data.length === 0){
          this.objNama._id = id
          this.peringatanHapus = true
      }else{
        data.filter((cek)=>{
          if(id === cek.id_soal){
            this._data.peringatan('Soal ini masih di ujian online')
          }else{
            this.objNama._id = id
            this.peringatanHapus = true
          }
        })
      }
    })
  }

  yaHapus(){
    this._data.deleteData('Group',this.objNama._id).subscribe((data:any)=>{
      this._data.pesan(data.sukses,data._doc.namaGroup+" Telah di hapus")
      this.getListSoal()
    })
    this._data.statusService = false
  }

  editGroup(data){
    this._data.arrService = data
    this._data.router = 'list'
    // window.location.reload()
    this._data.statusService = true
  }

  updateNama(){
    this._data.updateData('Group',this.objNama).subscribe((data:any)=>{
      // this._data.pesan(data.sukses,data._doc.namaGroup+" Berhasil dirubah")
      this.getListSoal()
    },(err)=>{
      this._data.pesan(false,'Koneksi terputus','error')
    })
    this.namaFolder = false
    // this.objNama = {}
  }

  viewSoal(data,doc = null){
    let dataSoal:any = []
    this.objNama = data
    this._data.getData('Soal',null,null,'full').subscribe((soal:any)=>{
      data.list.forEach((elm,i)=>{
        soal.filter((m)=>{
          if(m._id === elm){
              dataSoal.push(m)
          }
        })
        if(data.list.length === i+1){
          this.listSoal = dataSoal
          if(doc != null){
            this.doc(data.namaGroup)
          }
        }
      })
    })
  }

  async doc(nama){
    let data = await '<div><center><h2>'+this._data.dataGuru.sekolah+'</h2>\n<i>'+this._data.dataGuru.alamat +'</i>\n'+
                      this._data.dataGuru.provinsi+'</center></div><hr><table class="docx" width="100%" >'
            for(let i = 0; this.listSoal.length > i; i++){
               data += await "<tr><td width='1%' valign='top'><p>"+(i+1)+". </p></td><td valign='top' align='justify'>"+ this.listSoal[i].isi + "</td><tr><td colspan='2' align='justify'><ol style='list-style-type: lower-alpha;line-height: 1pt;'><li>" + 
               this.listSoal[i].opsiA + "</li><li>" + 
               this.listSoal[i].opsiB + "</li><li>" + 
               this.listSoal[i].opsiC + "</li><li>" + 
               this.listSoal[i].opsiD + "</li></ol></td></tr>"
               if(this.listSoal.length === 1+i){
                 data = await data+"</table>"
                //  this.docHtml= data
                 this._data.exportHTML(data,nama)
               }
            }
  }

}
