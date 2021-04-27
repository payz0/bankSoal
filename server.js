let express 	= require('express');
let server 		= express();
let cors   		= require('cors');
let router 		= require('./routers.js');
let upload		= require('express-fileupload');
let bodyParser 	= require('body-parser');
let app			= require('http').createServer(server)
let io 			= require('socket.io').listen(app)
let port 		= 3000
let stop = {}
let ujian = {}
let mval
let arrSocket = []

server.use(cors())
server.use(bodyParser.json({limit: "50mb"}));
server.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
server.use(upload())
server.use(express.static(__dirname+'/upload'));
// 	useTempFiles : true,
//     tempFileDir : '/tmp/'
// }))

// server.use(express.static(__dirname+"./assets"));
server.use('/',router)

io.on('connection',(socket)=>{
	console.log('user connected');

	socket.on('juml mapel',(data)=>{
		io.emit('list mapel',data)
	})

	socket.on('posting',(data)=>{
		io.emit('new posting',data)
		
	})

	socket.on('liked',(data)=>{
		io.emit('suka',data)
		console.log(data)
	})

	socket.on('hapus post',(data)=>{
		io.emit('hapus',data)
		
	})

	// mulai ujian
	socket.on('start-ujian',(data)=>{
		io.emit('start-ujian',data)
		console.log(data)
	})

	socket.on('login',()=>{
		io.emit('send login')
	})

	socket.on('siswa di keluarkan', data=>{
		io.emit('siswa out',data)
	})

	socket.on('reload comp rencana', data=>{
		if(ujian[data._id] === 'stop' && data.status === 'start'){
			io.emit('update comp rencana', data)
		}

		if(data.status === 'start' && arrSocket.length === 0){ // jika tidak ada aktivitas timer ujian
			io.emit('update comp rencana', data)
		}
	})

	socket.on('stop',data=>{
		let bro = 0
		if(arrSocket.length > 0){ // jika ada aktivitas timer ujian
			arrSocket.forEach(async(elm,i)=>{
				if(data.id === elm.id){
					bro++
					mval = await elm.prop
					await clearInterval(mval[data.id])
					arrSocket.splice(cek(arrSocket,elm.id),1)
					io.emit('ujian berhenti',{id:data.id,nama:data.nama,obj:data.obj})
					io.emit('start-ujian',{cek:false,karena:'guru',id_ujian:data.id})
				}
				if(arrSocket.length === i+1){
					if(bro === 0){
						io.emit('ujian berhenti',{id:data.id,nama:data.nama,obj:data.obj,update:'only'})
					}
				}
			})
		}else{ //jika tidak ada aktivitas ujian timer
			io.emit('ujian berhenti',{id:data.id,nama:data.nama,obj:data.obj,update:'only'})
		}
	})

	socket.on('play',data=>{
		ujian[data.id] = 'start'
		console.log(data.obj)
		let num  = 0
		let detik = 0
		let menit = data.durasi
		let total = data.durasi*60
			stop[data.id] = setInterval(()=>{
				detik--
				num = num + (100/total)
				console.log(num)
				if(num >= 100){
					ujian[data.id] = 'stop'
					clearInterval(stop[data.id])
					io.emit('ujian berhenti',{id:data.id,nama:data.nama,obj:data.obj})
					io.emit('start-ujian',{cek:false,karena:'habis',id_ujian:data.id})
				}
				if(detik < 0){
					detik = 59
					menit--
				}
				if(menit < 0){
					menit = 0
				}
				io.emit('waktu ujian',{id:data.id,total:num,menit:menit,detik:detik})
			},1000)
			arrSocket.push({id:data.id,prop:stop})
	})
	
})

function cek(arr,ind){
	return arr.map(function(e) { return e.id; }).indexOf(ind);
}
app.listen(port,()=>{console.log('server running '+port)})