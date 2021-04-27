import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { DataService } from '../data.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
komentar:any ={}
posting:any = {}
_datas:any 
allGuru:any
listKomentar:any = []
listPosting:any = []
listMapel:any
id_mapel_user:any
kategoriPosting:any = {$or : [{id_mapel:''}]}
num:any = {}
user:any = {}
foto:any = {}
commenShow:boolean = false;
addPost:boolean = false
post_id:string
jumPosting:any = {}

  constructor(private _data:DataService,public sanitizer: DomSanitizer, private cd: ChangeDetectorRef) {}
  
  ngAfterViewChecked()
  // // ngAfterViewInit()
  {
    this.cd.detectChanges(); //antisipasi perubahan diDOM 
  
  }

  ngOnInit() {
    
    this._datas = this._data
    this.allSocket()
    this.semuaData('Mapel').then((e)=>{this.listMapel = e})
   
    this.semuaData('Guru').then((e)=>{
      this.allGuru = e
      this.mapelUserOnline(e)
      .then((dat:any)=>{
        this.id_mapel_user = dat.id_mapel
        if(localStorage.getItem('forum')){
          let id:string = JSON.parse(localStorage.getItem('forum'))._id
          this.posting.id_mapel = id
          this.kategoriPosting.id_mapel = id 
        }else{
          this.posting.id_mapel = dat.id_mapel[0]
          this.kategoriPosting.id_mapel = dat.id_mapel[0]
          this.listMapel.filter((val)=>{
            if(val._id ===  dat.id_mapel[0]){
              localStorage.setItem('forum',JSON.stringify(val))
            }
          })
          
        }  
      })
    })

    this.semuaData('Posting',null,null,'full')
    .then((e:any)=>{
      this.listPosting = e.sort((a,b)=>{return this._data.urutan(a,b,'waktu',-1)}) 
    })

    this.semuaData('Komen',null,null,'full')
    .then((e:any)=>{
      this.listKomentar = e.sort((a,b)=>{return this._data.urutan(a,b,'waktu',1)}) 
    })
   
  }

  async allSocket(){
  //  list mapel
  // let dataMapel:any = await JSON.parse(localStorage.getItem('forum'))
  // let index = await dataMapel.looking.findIndex((val)=>{
  //   return val.id_guru == this._data.id_guru
  // })

    this._data.socket.on('list mapel', async (data)=>{
      // console.log(data);
      // if(data._id === dataMapel._id ){
      //    await dataMapel.looking[index].juml++ // belum tentu nambah ...?????????
      //    await this._data.updateData('Mapel',dataMapel).subscribe(()=>{
      //       this.semuaData('Mapel').then((e)=>{this.listMapel = e})
      //    })
      // }
      await this.semuaData('Mapel').then((e)=>{this.listMapel = e})
      // this._data.pesan(true,data)
    })

    // new post
    this._data.socket.on('new posting',(data)=>{
      if(data.id_guru != this._data.id_guru){
        if(data.stat == 'Komen'){
          this.listKomentar.push(data)
        }else{
          this.listPosting.unshift(data)
        }
      }
    })

    // hapus
    this._data.socket.on('hapus',(data)=>{
     
      this.addPost = true
      this.post_id = data.id
      if(data.id_guru != this._data.id_guru){
        if(data.stat == 'Posting'){
          for(let i= 0; this.listPosting.length > i; i++){
            if(this.listPosting[i]._id === data.id){
              setTimeout(async ()=>{
                this.listPosting.splice(i,1)
                // await dataMapel.looking[index].juml--
                // await this._data.updateData('Mapel',dataMapel).subscribe(()=>{
                //    this.semuaData('Mapel').then((e)=>{this.listMapel = e})
                // })
              },500)
              
            }
          }
        }else{
          for(let i = 0; this.listKomentar.length > i; i++){
            if(this.listKomentar[i]._id === data.id){
              setTimeout(()=>{
                this.listKomentar.splice(i,1)
              },320)
            }
          }
        }
      }
    })

    // like
    this._data.socket.on('suka',(data:any)=>{
      let arr:any = []
      if(data.tabel === 'Posting'){
        arr = this.listPosting
      }else{
        arr = this.listKomentar
      }
      if(data.id_like != this._data.id_guru){
         arr.filter((dat,i)=>{
            if(dat._id ===  data._id ){
                if(data.stat == 'tambah'){
                 dat.like.push(data.id_like)
                }else{
                 dat.like.splice(data.index,1)
                }
            }
        })
      }
    })
  }

  semuaData(tabel,id=null,val=null,opt=null){
    return new Promise((resolve,reject)=>{
      this._data.getData(tabel,id,val,opt).subscribe((data:any)=>{
        resolve(data)
      })
    })
  }

  addKoment(id){    
    this.addPost = false
    if(this.komentar[id] != undefined ){
      this.komentar.komentar = this.komentar[id]
      this.komentar.waktu = new Date()
      this.komentar.id_posting = id
      this._data.postData('Komen',this.komentar).subscribe((data:any)=>{
        this._data.socket.emit('posting',Object.assign(data._doc,{'stat':'Komen'}))
        this.listKomentar.push(data._doc)
        // },500)
        this.komentar[id] = ''
      })
    }
  }

  async addPosting(){
    let dat:any = await JSON.parse(localStorage.getItem('forum'))
    let index = await dat.looking.findIndex((val)=>{
      return val.id_guru == this._data.id_guru
    })
    dat.looking[index].juml =  await dat.looking[index].juml+1

    if(this.posting.posting != undefined){
      this.posting.waktu = await new Date()
      this.posting.posting = await this.posting.posting.replace('<p><br></p>','')
     
      await this._data.updateData('Mapel',dat).subscribe((doc:any)=>{
        this._data.socket.emit('juml mapel',(doc._doc))
        localStorage.setItem('forum',JSON.stringify(doc._doc))
      })
      
      await this._data.postData('Posting',this.posting).subscribe((data:any)=>{
        this.posting.posting = ''
        this._data.socket.emit('posting',data._doc)
        this.listPosting.unshift(data._doc)
        this._data.pesan(data.sukses,'Posting send')   
      })
    }
  }

  mapelUserOnline(data){
    return new Promise((resolve,reject)=>{
      data.filter((x)=>{
        if(x._id === localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')){
          resolve(x)
        }
      })
    })
  }

  hapusPost(tabel,id){
    let dat:any = JSON.parse(localStorage.getItem('forum'))
    this.addPost = true
    this.post_id = id
    this._data.deleteData(tabel,id).subscribe((data)=>{
      if(tabel === 'Posting'){
        for(let i = 0; this.listPosting.length > i; i++){
          if(this.listPosting[i]._id === id){
            setTimeout(()=>{
              this.listPosting.splice(i,1)
            },500)
            this.listKomentar.filter((dat)=>{
              if(dat.id_posting === id){
                this._data.deleteData('Komen',dat._id).subscribe()
              }
            })
          }
        }
       for(let i = 0; dat.looking.length > i;i++){
         dat.looking[i].juml--
         if(dat.looking.length === i+1){
            this._data.updateData('Mapel',dat).subscribe((dal:any)=>{
              localStorage.setItem('forum',JSON.stringify(dal._doc))
            })           
         }
       }
      }else{
        for(let i = 0; this.listKomentar.length > i; i++){
          if(this.listKomentar[i]._id === id){
            setTimeout(()=>{
              this.listKomentar.splice(i,1)
            },320)
          }
        }
      }
      this._data.pesan(true,tabel+' telah di hapus')
      this._data.socket.emit('hapus post',{'id':id,'stat':tabel,'id_guru':this._data.id_guru})
    })
  }

  async updatePosting(tabel:string,data:any){
    let id = localStorage.getItem('id_guru['+localStorage.getItem('$key')+']')
    let cek:boolean = false
    if(data.like.indexOf(this._data.id_guru) != -1){
        await data.like.filter(async (id,i)=>{
          if(id ===  this._data.id_guru){
            await this._data.socket.emit('liked',Object.assign(data,{'stat':'hapus','index': data.like.indexOf(id),'id_like':id,'tabel':tabel}))
            await data.like.splice(data.like.indexOf(id),1)
            cek  = await true 
          }
      })
    }else{
      await data.like.push(this._data.id_guru)    
      this._data.socket.emit('liked',Object.assign(data,{'stat':'tambah','id_like':id,'tabel':tabel})) 
    }
    
    await this._data.updateData(tabel,data).subscribe(()=>{
      if(!cek){
        this._data.pesan(true,'You liked !')
      }else{
        this._data.pesan(true,'Yaah.. !')
      }
    })

  }

  async linkGroup(dat){
    let jum:number = 0
    let id:string
    let index = await dat.looking.findIndex((val)=>{
      return val.id_guru == this._data.id_guru
    })

    this.listPosting.forEach((post,i)=>{
      if(post.id_mapel == dat._id){
        jum++
        id = post.id_mapel
      }
    })
    this.posting.id_mapel = await dat._id; 
    this.kategoriPosting.id_mapel = await dat._id
    if(index < 0){
      await dat.looking.push({'id_guru':this._data.id_guru,'juml':jum})
    }else{
       dat.looking[index].id_guru = this._data.id_guru
       if(jum > dat.looking[index].juml){
          dat.looking[index].juml = (jum- dat.looking[index].juml) + dat.looking[index].juml
       }else{
          dat.looking[index].juml = jum
       }
    }
    await this._data.updateData('Mapel',dat).subscribe((data:any)=>{
      // console.log(data._doc.looking);
      localStorage.setItem('forum',JSON.stringify(data._doc))
       this._data.socket.emit('juml mapel',(data._doc))
    })  
  }

  jumPost(dat){
    let jum:number = 0
    let id:string
    this.jumPosting[dat._id] = 0
    this.listPosting.forEach((post,i)=>{
      if(post.id_mapel == dat._id){
        jum++
        id = post.id_mapel
      }
      if(this.listPosting.length === i+1){    
        if(dat.looking != undefined){
          dat.looking.forEach((sum,n)=>{
            if(sum.id_guru == this._data.id_guru && dat._id == id){
              if(jum > sum.juml){
                this.jumPosting[dat._id] = jum - sum.juml
              }else{
                this.jumPosting[dat._id] =  0
              }             
            }
          })
        }
      }
    })
  }

  JumKomentar(id){
   this.num[id] = 0
   this.listKomentar.filter((x)=>{
      if(id === x.id_posting){
        this.num[id]++
      }
    })
  }

  objectUser(data){
      if(this.allGuru != undefined){
        this.allGuru.filter((post)=>{
          if(post._id === data.id_guru){
            this.user[data._id] = post
            this.foto[data._id] = this._data.basePort+"profil/"+post.foto
          }
        })
    }
  }
}
