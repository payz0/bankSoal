let express 	= require('express');
let route 		= express();
let bodyParser 	= require('body-parser')
let db 			= require('./database.js');
let sharp		= require('sharp')
let fs 			= require('fs')
let nodemailer	= require('nodemailer')
let jwt 		= require('jsonwebtoken')
// let excel 		= require('excel4node');
// let workbook	= new excel.Workbook();
// let sheet1		= workbook.addWorksheet('Sheet1');

route.use(bodyParser.json())
let tabels;
let typeFile = ['jpg','jpeg','gif','png','bmp','tiff']
let env = JSON.parse(fs.readFileSync('why.json'))

// console.log(kunci)
// jwt.sign(env,env.secret,(err,code)=>{
// 	console.log(code)
// })

// method cek code
function cekCode(req,res,next){
	const topHeader = req.headers['auth']
	if(typeof topHeader !== undefined){
		req.code = topHeader
		next()
	}else{
		res.sendFile(__dirname+'/frobbiden.html')
	}
}
// method untuk cek tabel dengan switch agar dinamis di route
function tabel(arg) {
	switch(arg){
		case 'Soal' :
			 tabels = db.Soal;
			 break;
		case 'Siswa' :
			 tabels = db.Siswa;
			 break;
		case 'Kelas' :
			 tabels = db.Kelas;
			 break;
		case 'Group' :
			 tabels = db.GroupSoal;
			 break;
		case 'Ujian' :
			 tabels = db.Ujian;
			 break;
		case 'Mapel' :
			 tabels = db.Mapel;
			 break;
		case 'Guru' :
			 tabels = db.Guru;
			 break;
		case 'Sekolah' :
			 tabels = db.Sekolah;
			 break;
		case 'Posting' :
			 tabels = db.Posting;
			 break;
		case 'Komen' :
			 tabels = db.Komen;
			 break;
		case 'Forum' :
			 tabels = db.Forum;
			 break;
		case 'SU' :
			 tabels = db.SuperUser;
			 break;
		default:
			break;
	}
}


route.get("/resources/:tabel/:obj?/:val?/:id?",cekCode,async (req, res)=>{
	await tabel(req.params.tabel)
	jwt.verify(req.code,env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
			// res.sendFile(__dirname+'/frobbiden.html')
		}else{
			if(req.params.id != null ){
				await tabels.find({id_guru:req.params.id},async (err,doc)=>{
					let data = await []		
						if(req.params.obj != 'null' || req.params.val != 'null'){
							doc.forEach(async(el,i)=>{
								if(doc[i][req.params.obj] ==  req.params.val){
								await data.push(el)
								 // console.log(doc[i][req.params.obj])
								}
							})
							// await console.log('ini ada id tapi seleksi')
							await res.send(data)
							// await console.log(data)
						}else{
							res.send(doc)
							// console.log('ini ada id full ')
						}		
						
				})
			}else{
				// hanya untuk tabel guru dan full data
			 	tabels.find({},async (err,doc)=>{
					let data = await []		
						if(req.params.obj != null || req.params.val != null){
							doc.forEach(async(el,i)=>{
								if(doc[i][req.params.obj] ==  req.params.val){
								await data.push(el)
								 // console.log(doc[i][req.params.obj])
								}
							})
							// await console.log('ini tanpa id tapi seleksi ')
							await res.send(data)
							// await console.log(data)
						}else{
							res.send(doc)
							// console.log('ini tanpa id full ')
						}		
						
				})
			}
		}
	})
	
})

// insert data
route.post("/resources/:tabel", cekCode, async (req,res)=>{
	await tabel(req.params.tabel)
	jwt.verify(req.code,env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
			// res.sendFile(__dirname+'/frobbiden.html')
		
		}else{
			await tabels.create(req.body,(err,docs)=>{
				if(err) throw err;
				res.json(Object.assign({'sukses':true},docs))

			})
		}
	})

})

// edit data
route.put("/resources/:tabel",cekCode, async (req,res)=>{
	await tabel(req.params.tabel)
	jwt.verify(req.code,env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
		}else{
				await tabels.findOneAndUpdate({_id:req.body._id},{$set:req.body},{new:true},(err,docs)=>{
					if(err){
						console.log('gagal update')
						res.json({'sukses':false})
					}else{
						console.log('sukses update ')
						res.json(Object.assign({'sukses':true},docs))
					}
				})
		}



	})
})

// hapus data
route.delete("/resources/:tabel/:id", cekCode,async (req,res)=>{
	let obj = {}
	await tabel(req.params.tabel)
	jwt.verify(req.code,env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
		}else{
				await tabels.findOneAndDelete({_id:req.params.id},async(err,docs)=>{
					obj = await Object.assign({'sukses':true},docs)
					if(err){
						await res.json({'sukses':false})
					}else{
						await res.json(obj)
					}
				})
		}
	
	})
})

// upload dari editor
route.post('/upload/:data/:profil?', cekCode, async (req, res) => {
   let file 	= await req.files.image;
   let url  	= await "./upload/";
   let namaFile = await req.params.data.split("~")[0]+"."+file.name.split(".")[1];
   console.log(file.size)
   jwt.verify(req.params.data.split("~")[1],env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
		}else{
			console.log("token bank "+ req.code)
		   await typeFile.filter(async(type)=>{
			   	if(file.name.split(".")[1].toLowerCase() === type){
			 	 await file.mv(url+namaFile, async(err)=>{
				   	if(err) throw err;
				   	console.log('sukses upload')
				   	if(file.size >= 100000){
				   		if(req.params.profil == null){
				   			await compressFile(namaFile,url,"gambar/")
				   		}else{
				   			await hapusIsiFolder(url+"profil/",namaFile)
				   			await compressFile(namaFile,url,"profil/")
				   		}
				   	}else{
				   		if(req.params.profil == null){
				   			await file.mv(url+"gambar/"+namaFile)
				   		}else{
				   			await hapusIsiFolder(url+"profil/",namaFile)
				   			await setTimeout(()=>{ file.mv(url+"profil/"+namaFile)},500)
				   			// await file.mv(url+"profil/"+namaFile)
				   		}
				   		await setTimeout(()=>{hapusIsiFolder(url,namaFile)},1000)
				   	}
				   	await setTimeout(()=>{
				   	res.json(namaFile)
				   	},500)
				   })		
			   	}
		   })	
		}
	})
})

// get all image
route.get('/getImage/:id', cekCode,(req,res)=>{
	jwt.verify(req.code,env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
		}else{
			fs.readdir('./upload/gambar/',(err,files)=>{
				res.json(files)
			})
		}
	})
})

// kompress file
function compressFile(namaFile,url,target){

	sharp(url+namaFile)
		  .resize(401, 300, {
		    fit:  sharp.fit.inside,//'contain',
		  })
		// .jpeg({quality: 100 })
		.withMetadata()
		// .toFormat('jpg')
		.toFile(url+target+namaFile)
		.then(() => {
			hapusIsiFolder(url,namaFile)
			console.log('sukses compress')	
		})
}

// hapus file gambar di folder upload
function hapusIsiFolder(url,nameFile){
	fs.readdir(url,(err,files)=>{
		for(let i = 0; files.length > i; i++){
				console.log('file di hapus '+files[i].split("~")[0])
				// if(files[i].split(".").length > 1){ // jika file
				if(files[i].split("_")[0] === nameFile.split("_")[0]){
					console.log('file di hapus '+files[i].split("~")[0])
					fs.unlinkSync(url+files[i],(err)=>{
						if(err) throw err
					})
				}
					
		}
	})
}
// excel route
// route.get('/excel/:tabel',(req,res)=>{
// 	tabel(req.params.tabel)
// 	tabels.find({},(err,doc)=>{
// 		if(err) throw err;
// 		res.send(doc)

// 		var style 		=  workbook.createStyle({
// 						  font: {
// 						    color: '#FF0800',
// 						    size: 12,
// 						  },
// 						  numberFormat: '$#,##0.00; ($#,##0.00); -',
// 						});
// 		for(let i = 1; doc.length > 1; i++){
// 			sheet1.cell(1,1).string('no').style(style);
// 			sheet1.cell(2+i,1).number(100).style(style);
// 		}
// 		workbook.write('ex4node.xlsx',res)
// 	})
// })
route.post("/sendEmail", cekCode,async (req, res)=>{
	// console.log(req.body.password+" dan "+req.body.waktu)
	const output = "<p>Password anda :<b>"+req.body.password+"</b></p>"
	jwt.verify(req.code,env.secret,async(err,auth)=>{
		if(err){
			res.sendStatus(403)
		}else{
			let transporter = await nodemailer.createTransport({
		    host: "smtp.gmail.com",
		    port: 587,
		    secure: false, // true for 465, false for other ports
		    auth: {
		      user: env.user, 
		      pass: env.pass
		    },
		    tls:{
		    	rejectUnauthorized:false
		    }
		  });

	  // send mail with defined transport object
		await transporter.sendMail({
		    from: '"Admin BankSoal" <banksoal53@gmail.com>', // sender address
		    to: req.body.email, // list of receivers
		    subject: req.body.perihal == undefined ? "Recovery your password" : req.body.perihal, // Subject line
		    text: "Password Anda", // plain text body
		    html: output
		  });
		res.json({'sukses':true})
	}
  })
})

module.exports = route