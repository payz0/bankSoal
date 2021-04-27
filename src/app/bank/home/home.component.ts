import { Component, OnInit} from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  guru:any        = {}
  sekolah:any     = {namaSekolah:''}
  allGuru:any     = []
  allSekolah:any  = []
  _datas:any  
  errInput:boolean = false
  showSekolah:boolean = false
  editSekolah:boolean = false
  formLogin:boolean;
  repassword:string;
  statusLogin:boolean = false
  email:boolean = false
  user:any = {}
  rute:string = 'Home'
  tabel:boolean = false

  constructor(private _data:DataService) { }

  ngOnInit() {
    this.getAllData('Guru').then((data:any)=>{this.allGuru = data})
    this.getAllData('Sekolah').then((data:any)=>{this.allSekolah = data})
    this._datas = this._data 
    this._data.getData('SU',null,null,'full').subscribe((dat)=>{
      this.guru.aktif = dat[0].konfirm
      this.guru.alasan = "Sedang menunggu konfirmasi dari admin"
    })
  }

  su(){
    this._datas.router = 'su'
  }

  routeHome(route){
    this.rute = route
    this.errInput = false
    this.email = false
    if(route === 'Login'){
      this.formLogin = true
    }else{
      this.formLogin = false
    }
  }

  daftar(){
    if(this.guru.nama == null || this.guru.nama == "" ||
      this.guru.username == null|| this.guru.username == "" ||
      this.guru.email == null|| this.guru.email == ""||
      this.guru.password == null|| this.guru.password == "" ||
      this.sekolah.namaSekolah == null || this.sekolah.namaSekolah == "" ){
        this._data.peringatan('Data harus lengkap di isi')
        this.errInput = true
      }else{
        this.guru.tgl_reg = new Date()
        this.guru.sekolah = this.sekolah.namaSekolah
        this.rubahSekolah(event).then((edit)=>{
          // console.log(!edit)
          if(!edit){
             this._data.postData('Sekolah',this.sekolah).subscribe()
          }
        })
        if(this.allSekolah.length == 0){
          this._data.postData('Sekolah',this.sekolah).subscribe()
        }
        this._data.postData('Guru',this.guru).subscribe((guru:any)=>{
          this._data.pesan(guru.sukses,"Anda berhasil terdaftar")
          this.guru     = {}
          this.sekolah  = {}
          this.repassword = ''
          this.errInput = false
          this.editSekolah = false
          this.getAllData('Sekolah').then((data:any)=>{this.allSekolah = data})
          this.getAllData('Guru').then((data:any)=>{this.allGuru = data})
        })
      }
  }

  getAllData(tabel){
    return new Promise((resolve,reject)=>{
      this._data.getData(tabel).subscribe((data)=>{
        resolve(data)
        // console.log(data)
      })
    })
  }

  rePass(){
      if(this.repassword !== this.guru.password){
        this._data.pesan(true,'password tidak sama')
        this.repassword = ''
        this.guru.password = ''
        this.errInput = true
      }
  }

  masuk(){
    this.user.statusLogin = this._data.Acak(60)
    if(this.statusLogin){
      this._data.updateData('Guru',this.user).subscribe((data:any)=>{
        localStorage.setItem('login['+data._doc.statusLogin+']','true')
        localStorage.setItem('id_guru['+data._doc.statusLogin+']',this.user._id)
        localStorage.setItem('$key',data._doc.statusLogin)
        localStorage.setItem('router','profil')
        this._data.pesan(true,"Login berhasil")
        this.guru = {}
        this.user = {}

        setTimeout(()=>{
          this._data.router = 'profil'
          this._data.router = localStorage.getItem('router')
          this._data.login = localStorage.getItem('login['+data._doc.statusLogin+']')
          this._data.id_guru = localStorage.getItem('id_guru['+data._doc.statusLogin+']')
        },300)
      })
    }else{
      this._data.pesan(true,'User tidak terdaftar')
      this.guru = {}
      this.user = {}
      this.errInput = true
    }
  }

 cekValid(cek=null){
      this.errInput = false
      let num:number = 0
      let obj:string
      let key:any
      this.statusLogin = false
      if(this.formLogin){ // jika form login
        if(this.guru.email.match('@') == null){ //jika tidak ada @ berarti pakai username
            obj = 'username' // masuk dengan username
        }else{
            obj = 'email' // masuk dengan email
        }
        this.allGuru.forEach((user,i)=>{
            if(user[obj] === this.guru.email && user.password === this.guru.password){
              this.statusLogin = true
              this.user = user
              // console.log(user[obj]+" dan "+this.guru.email);
            }
        })
      }else{ //jika form daftar
          this.allGuru.filter((dat)=>{
            if(dat[cek] === this.guru[cek]){
                this._data.pesan(true,cek+' '+this.guru[cek]+' sudah terdaftar')
                this.errInput = true
                this.guru[cek] = ''
            }
          })
          
          if(cek === "email" && this.guru.email != ""){
            if( this.guru.email.match('@') == null){
              this._data.pesan(true,"Email anda tidak benar")
              this.errInput = true
              this.guru[cek] = ''
            }else{
              if(this.guru.email.match('@').index === 0 || this.guru.email.match('@').index === this.guru.email.length-1 ){
                this._data.pesan(true,"Email anda tidak benar")
                this.errInput = true
                this.guru[cek] = ''
              }
            }
          }else{
            if(this.guru.username.match(' ')){
              this._data.pesan(true,'username tidak boleh ada spasi')
              this.guru.username = ''
              // this.guru.username = this.guru.username.replace(/\s/g,'')
            }
          }
      }
    
  }

  outFocus(){
    setTimeout(()=>{
      this.showSekolah = false
      // this.allSekolah = []
    },200)
  }

 rubahSekolah(event){
    let num:number = 0
    if(event.target.value.length >= 2){
        this.showSekolah = true
    }else if(event.target.value.length === 0){
        this.showSekolah = false
        num = 0
      }
    return new Promise((resolve,reject)=>{
      this.allSekolah.forEach((data,i)=>{
        if(data.namaSekolah.toLowerCase() === event.target.value.toLowerCase()){
          this.editSekolah = true
        }
        if(this.allSekolah.length === i +1){
          resolve(this.editSekolah)
          // console.log(this.editSekolah)
        }
      }) 
    })
  }

  loginTest(){
    this._data.router = 'test'
    // localStorage.setItem('router','test')
    localStorage.setItem('Ujian','true')
  }

  async kirimEmail(){
    let cek:boolean = false
    // console.log(this.guru.email);
    
    if(this.guru.email != undefined ){
      await this.allGuru.forEach(async(val,i)=>{
        if(this.guru.email === val.email){
          cek = true
          this._data.sendEmail(val).subscribe((data)=>{
            this._data.peringatan('password sudah terkirim ke email')
            this.email = false
            this.guru = {}
          })
        }
        if(this.allGuru.length === i+1){
          if(!cek){
            this._data.pesan(true,"Email tidak terdaftar")
            this.guru = {}
          }
        }
      })
    }else{
      this._data.pesan(true,'Tidak boleh kosong')
    }
  }
}
  