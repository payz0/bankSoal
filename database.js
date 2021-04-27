let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/dbBankSoal',
		{ 
		useNewUrlParser: true,  
	 	useUnifiedTopology: true,
	 	useFindAndModify: false
	 	},
		(err)=>{
			if(err){
				console.log('error connection')
			}else{
				console.log('db connected')
			}
		}
	)
let Soal = mongoose.model('tabelSoal',mongoose.Schema({
	isi:String,
	opsiA:String,
	opsiB:String,
	opsiC:String,
	opsiD:String,
	jawaban:String,
	jenjang:String,
	kelas:String,
	mapel:String,
	createdBy:String,
	sharing:String,
	id_guru:String
}))

let Siswa = mongoose.model('tabelSiswa', mongoose.Schema({
	Nama:String,
	Nisn:String,
	Nipd:String,
	ujian:Array, //namaUjian, id_ujian, nilai, tgl, id_mapel,
	id_kelas:String,
	id_guru:String,
	status:String, //sudah login atau belum real time
	kode_ujian:String // untuk deteksi sedang ikut di ujian mana
}))

let Kelas = mongoose.model('tabelKelas', mongoose.Schema({
	kelas:String,
	ujian:Array, //'id_ujian',kode','tgl','nameUjian','id_mapel'  
	id_guru:String
}))

let GroupSoal  = mongoose.model('tabelGroupSoal', mongoose.Schema({
	namaGroup:String,
	list:Array,
	tgl:Date,
	id_guru:String
}))

let Ujian	= mongoose.model('tabelUjian',mongoose.Schema({
	ujian:String,
	id_siswa:Array,
	id_soal:String,
	id_guru:String,
	id_mapel:String,
	id_kelas:Array,
	nilai:Number,
	tgl:Date,
	hapus:String,
	kode:String,
	durasi:Number,
	status:String, //sedang ujian atau stop
	use:Number,
	thn_ajaran:String
}))

let Mapel = mongoose.model('tabelMapel',mongoose.Schema({
	mapel:String,
	looking:Array //id_guru dan jumlah
}))

let Guru = mongoose.model('tabelGuru', mongoose.Schema({
	nama:String,
	username:String,
	email:String,
	sekolah:String,
	alamat:String,
	kabupaten:String,
	provinsi:String,
	kecamatan:String,
	password:String,
	foto:String,
	id_mapel:Array,
	aktif:String,
	statusLogin:String,
	alasan:String,
	tgl_reg:Date

}))

let Sekolah = mongoose.model('tabelSekolah', mongoose.Schema({
	namaSekolah:String
}))

let Posting = mongoose.model('tabelPosting', mongoose.Schema({
	posting:String,
	id_guru:String,
	id_mapel:String,
	id_grupForum:String,
	waktu:Date,
	like:Array
}))

let Komen = mongoose.model('tabelKomen',mongoose.Schema({
	komentar:String,
	id_guru:String,
	id_posting:String,
	like:Array,
	waktu:Date
}))

let Forum = mongoose.model('tabelForum', mongoose.Schema({
	grupForum:String,
	anggota:Array, //id guru
	admin:String //id pembuat
}))

let SuperUser = mongoose.model('tabelSU', mongoose.Schema({
	password:String,
	konfirm:String,
	tgl_login:Date
}))

module.exports = {mongoose, Soal, Siswa, Kelas, GroupSoal, Ujian, Mapel, Guru, Sekolah, Posting, Komen, Forum, SuperUser}