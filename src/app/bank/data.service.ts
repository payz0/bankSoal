import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import * as XLSX from 'xlsx';
import  {environment} from '../../environments/environment';
import * as socketIo from 'socket.io-client';
import {NgxImageCompressService} from 'ngx-image-compress';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  basePort = "http://localhost:3000/"
  baseUrl = this.basePort+"resources/"
  idService:string
  router:string
  statusService:boolean = false
  warning:boolean = false
  konfirmHapus:boolean = false
  pesanWarning:string
  arrService:any = []
  dataGuru:any
  notif:any = []
  tabelHapus:any
  idHapus:string
  login:string
  id_guru:string 
  socket = socketIo(this.basePort);

  // EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  private headers = new HttpHeaders({
          'Content-Type':'application/json',
          'auth':  environment.token
          })

  constructor(private _http:HttpClient,public imageCompress: NgxImageCompressService) {}
  
  getData(tabel,obj=null,val=null,full=null){
    let param:string
    if(tabel != 'Guru' && tabel != 'Mapel' && tabel != 'Sekolah' && full == null){
      if(obj != null && val != null){
        param = tabel+"/"+ obj+"/"+val+"/"+this.id_guru
      }else{
        param = tabel+"/null/null/"+this.id_guru
      }
   
    }else{
      if(obj != null && val != null){
        param = tabel+"/"+ obj+"/" +val
      }else{
        param = tabel
      }
    }

    return this._http.get(this.baseUrl+param,{headers:this.headers}).catch((err)=>{
      return Observable.throw(err)
    });

  }

  postData(tabel, data){
    return this._http.post(this.baseUrl+tabel,Object.assign(data,{'id_guru':this.id_guru}),{headers:this.headers}).catch((err)=>{
      return Observable.throw(err)
    })
  }

  updateData(tabel, data){
    return this._http.put(this.baseUrl+tabel,data,{headers:this.headers}).catch((err)=>{
      return Observable.throw(err)
    })
  }

  deleteData(tabel, data){
    return this._http.delete(this.baseUrl+tabel+"/"+data,{headers:this.headers}).catch((err)=>{
      return Observable.throw(err)
    })
  }

  getAllImage(){
    return this._http.get(this.basePort+"getImage/"+localStorage.getItem('id_guru['+localStorage.getItem('$key')+']'),{headers:this.headers}).catch((err)=>{
      return Observable.throw(err)
    })
  }

  sendEmail(email){
    return this._http.post(this.basePort+"sendEmail",email,{headers:this.headers}).catch((err)=>{
      return Observable.throw(err)
    })
  }

  upload(file,prop = null){
    if(prop === null){
      return this._http.post(this.basePort+"upload/"+(localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')+'_'+new Date()).replace(/\s/g,'')+"~"+environment.token,file)
      .catch((err)=>{
        return Observable.throw(err)
      })
    }else{
      return this._http.post(this.basePort+"upload/"+(localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')+'_'+new Date()).replace(/\s/g,'')+'~'+environment.token+'/profil',file)
      .catch((err)=>{
        return Observable.throw(err)
      })
    }
  }

  pesan(sukses:boolean = true,arg,status = null,durasi=2000){ //pesan notifikasi 
    let m = durasi
    let addHtml;
    if(status == null){
        // addHtml = "<div class='notif'>"+arg+"</div>"
        if(sukses){
          addHtml = "<div class='notif'>"+arg+"</div>"
        }else{
          addHtml = "<div class='notif'><b>Maaf ada kesalahan, silahkan di ulang lagi</b></div>"
        }
    }else if(status == 'fixed'){
      addHtml = "<div class='notif-fixed'>"+arg+"</div>"
    }else{
      addHtml = "<div class='notifError'>"+arg+"</div>"
    }
     this.notif.push(addHtml)
     for(let i = 0; this.notif.length > i;i++){
       setTimeout(()=>{this.notif.splice(i,1); m = m * 1000;},m)
       
     }
   }

   peringatan(pesan){ //peringatan keras bentuk dialog box
      this.warning = true
      this.pesanWarning = pesan
   }

   urutan(a:any,b:any,prop:string, n:number){ //mengurutkan data jika number positif maka asc
      if(a[prop].toLowerCase() > b[prop].toLowerCase())
         {return 1*n} 
      if(a[prop].toLowerCase() < b[prop].toLowerCase())
          { return -1*n} 
      return 0
  }

  cekDataInData(id){  //cek data yang akan di hapus
    return new Promise((resolve, reject)=>{
      let num:number = 0
      let group:any = []
      this.getData('Group').subscribe((data:any)=>{
          data.forEach((elm,n)=>{
            for(let i = 0; elm.list.length > i;i++){
              if(group.indexOf(elm.list[i]) < 0){
                group.push(elm.list[i])
              }
            }
            if(data.length == n+1){
              group.filter((x)=>{
                if(x === id){
                  num++ 
                }
              })
              
            }
          })
          if(num === 0){
            resolve(false)
          }else{
            resolve(true)
          }
        })
    }) 
  }

  RubahXlsToJson(event){
    return new Promise((resolve,reject)=>{
        let workBook = null;
        let jsonData = null;
        const reader = new FileReader();
        reader.readAsBinaryString(event.target.files[0]);
        reader.onload = (e) => {
          workBook =  XLSX.read(reader.result, { type: 'binary' });
          jsonData =  workBook.SheetNames.reduce((initial, name) => {
            resolve(XLSX.utils.sheet_to_json(workBook.Sheets[name]));
          }, {});
        }
    })
  }

Acak(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

loadImage(event){
  return new Promise((resolve, reject)=>{
    let file:File = <File>event.target.files[0];
    const reader =  new FileReader();
    reader.readAsDataURL(file)
    reader.onload = (e)=>{
      if(file.size < 1000000){
        resolve(reader.result)
      }else{
        this.peringatan('Maaf file tidak boleh lebih dari 1 MB')
      }
    }
  })
 }

 formValidator(get,id,angka=null){
  let cek:boolean = true
  return new Promise((resolve,reject)=>{
    get.forEach((input,i)=>{
      if(input.nativeElement.value == '' ){
        this.pesan(true,input.nativeElement[id]+" tidak boleh kosong")
        input.nativeElement.focus()
        cek = false
      }
      if(angka != null){
        if(isNaN(input.nativeElement.value) && i > 0){
            this.pesan(true,input.nativeElement[id]+" harus angka")
            input.nativeElement.focus()
            cek = false
        }
      }
      if(get.length === i+1){
        resolve(cek)
      }
    })
  })    
 }

cekKelasPadaDataUjian(dataUjian,id_kelas,arr_siswa,aksi=null,to=null){
    let obj:any = {}
    let arrObj:any = []
    return new Promise((resolve,reject)=>{
  // jika ada kelas 
      dataUjian.forEach((data,i)=>{
          if(data.id_kelas.indexOf(id_kelas) > -1){
            obj = data
            if(to != null){ //hapus kelas
              data.id_kelas.splice(data.id_kelas.indexOf(id_kelas),1)
              obj = data
            }

            arr_siswa.forEach((elm,n)=>{
              if(data.id_siswa.indexOf(elm) > -1){
                  if(aksi === 'hapus'){
                    data.id_siswa.splice(data.id_siswa.indexOf(elm),1)
                    obj = data
                  }
              }else{
                data.id_siswa.push(elm)
                obj = data
              }
            })

            arrObj.push(data)
// jika kelas tidak ada maka hilangkan siswa dari ujian
          }else{
            arr_siswa.forEach((elm,n)=>{
              if(data.id_siswa.indexOf(elm) > -1){
                  data.id_siswa.splice(data.id_siswa.indexOf(elm),1)
                  obj = data
              }
            })
            arrObj.push(data)
          }
    // jika array sebanyak index
          if(dataUjian.length === i+1){
            // console.log(obj)
            resolve(arrObj)
          }
      })
    })
  }


  play_ujian(id,durasi,nama,obj){
    this.socket.emit('play',{id:id,durasi:durasi,nama:nama,obj:obj})
  }

  stop_ujian(id,durasi,nama,obj){
      this.socket.emit('stop',{id:id,durasi:durasi,nama:nama,obj:obj})
  }

  createExcel(id,nama){
    var workbook = XLSX.utils.table_to_book(document.getElementById(id))
    XLSX.writeFile(workbook, nama+'.xlsx');
  }

  exportHTML(isi,nama){
    var header = "<html><head></head><body>";
    var footer = "</body></html>";
    var sourceHTML = header+isi+footer;
    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = nama+'.docx';
    fileDownload.click();
    document.body.removeChild(fileDownload);
 }

}

