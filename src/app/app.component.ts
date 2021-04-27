import { Component, OnInit, isDevMode } from '@angular/core';
import { DataService } from './bank/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {
  title = 'angular8';
  router:string 
  _datas:any;
  menu:string = 'home'
  user:any = {}
  benar:boolean
  num:number = 0
  showMenu:boolean = false
  openMenu2:boolean = false
  
  constructor(private _data:DataService){}
  ngOnInit(){
    this._datas = this._data
    this.cekStatusOnload()
    this.user.statusLogin =  this._data.Acak(60)
    if(localStorage.getItem('Ujian')){
      this._data.router = 'test'
    }
  }

  cekStatusOnload(){
    if(!localStorage.getItem('login['+localStorage.getItem('$key')+']')){
      this._data.router = 'home'
      this.menu = 'home'
    }else{    
      this._data.router = localStorage.getItem('router')
      this.menu = localStorage.getItem('router')
    }

    this._data.login = localStorage.getItem('login['+localStorage.getItem('$key')+']')
    this._data.id_guru = localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')

    if(localStorage.getItem('$key')){
      this._data.getData('Guru','_id',localStorage.getItem('id_guru['+localStorage.getItem('$key')+']'),'full').subscribe((data:any)=>{
        this._data.dataGuru = this.user = data[0]
        if(!localStorage.getItem('Ujian')){
            if(data[0].statusLogin != localStorage.getItem('$key')){
              localStorage.clear()
            }
        }else{
          this._data.router = 'test'
        }
      })
    }
  }

  route(arg){
   this._data.router = arg
   localStorage.setItem('router',arg)
    if(arg === 'home' && this._data.login){
      this._data.router = 'profil'
      this.menu = 'profil'
      localStorage.setItem('router','profil')
    }
  }

  async logout(){
    this.user.statusLogin = await null
    await this._data.updateData('Guru',this.user).subscribe((data:any)=>{
      localStorage.clear()
      // console.log(data);
      window.location.reload()
      this._data.router = 'home'
      this.menu = 'home'
     })
  }

}
