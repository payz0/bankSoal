import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-su',
  templateUrl: './su.component.html',
  styleUrls: ['./su.component.css']
})
export class SuComponent implements OnInit {
  pin:string
  allUser:any
  users:any = {$or:[{nama:''},{sekolah:''}]}
  super:boolean = false
  password:boolean = false
  datUser:any
  cekCok:boolean = false
  konfirmasi:boolean = false
  objUser:any = {}
  menu:boolean = false
  constructor(private _data:DataService) { }

  ngOnInit() {
    this.loadGuru()
    this._data.getData('SU',null,null,'full').subscribe((dat)=>{
      this.datUser = dat[0]
    })
  }

  log(){
    
    if(this.pin === this.datUser.password){
      this._data.pesan(true,"Anda login")
      this.super = true
    }
    else{
      this._data.peringatan('Kami sedang mendeteksi anda !')
      this.pin = ''
      setTimeout(()=>{
        this._data.router = 'home'
      },1000)
    }
  }

  loadGuru(){
    this._data.getData('Guru').subscribe((data)=>{
      this.allUser = data
    })
  }

  cekPass(event){
    if(event.target.value === this.datUser.password){
      this.password = true
    }
  }

  cocok(){
      if(this.datUser.new2 === this.datUser.new1){
          this.datUser.password = this.datUser.new1
          this.cekCok = true
          // this.datUser.waktu = new Date()
          this.datUser.email = 'kobbux@gmail.com'
          this.datUser.perihal = 'Ada yang masuk super user'
        }
    
  }

  simpan(){
    // console.log(this.datUser.new1)
    if(this.cekCok){
      this._data.updateData('SU',this.datUser).subscribe(()=>{
        this.password = false
        this.cekCok= false
        this._data.pesan(true,'updated')
        this._data.sendEmail(this.datUser).subscribe(()=>{
          this.datUser.asli = ''
          this.datUser.new1 = ''
          this.datUser.new2 = ''
        })
      })
    }else if(this.datUser.password != this.datUser.new1){
      this._data.updateData('SU',this.datUser).subscribe(()=>{
        this.password = false
        this.cekCok= false
        this._data.pesan(true,'updated 2')
        this.datUser.asli = ''
        this.datUser.new1 = ''
        this.datUser.new2 = ''
      })
    }
  }

  aktif(data){
    // console.log(data.aktif)
    this.objUser = data
    if(data.aktif != undefined){
      if(data.aktif == 'ya'){
        data.aktif = 'tidak'
        this.objUser.aktif = 'tidak'
        this.konfirmasi = true
      }else{
        data.aktif = 'ya'
        this.objUser.aktif = 'ya'
        this.konfirmasi = false
        // data.alasan = ''
        this._data.updateData('Guru',data).subscribe(()=>console.log('data berhasil update'))
      }
      
    }else{
      data.aktif = 'ya'
      this.objUser.aktif = 'ya'
      this.konfirmasi = false
      // data.alasan = ''
      this._data.updateData('Guru',data).subscribe(()=>console.log('data berhasil update'))
    }
  }

  simpanUser(){
    this._data.updateData('Guru',this.objUser).subscribe(()=>console.log('data berhasil update'))
    this.konfirmasi = false
  }

  del(id){
    this._data.deleteData('Guru',id).subscribe(()=>{
      this.loadGuru()
      this._data.pesan(true,'Guru di hapus')
    })
  }
}
