require('dotenv').config({path: '.env.local'});
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const uri=process.env.MONGODB_URI;
console.log('Using URI:', uri ? 'FOUND' : 'MISSING - check .env.local');
async function seed(){
 await mongoose.connect(uri,{dbName:'phethagatsa'});
 console.log('Connected to Cluster0');
 const User=mongoose.model('User',new mongoose.Schema({username:{type:String,unique:true},password:String,role:String,email:String,name:String}));
 const Settings=mongoose.model('Settings',new mongoose.Schema({whatsappNumber:String,contactEmail:String,address:String},{strict:false}));
 await User.deleteMany({});
 await User.insertMany([
  {username:'ntwana',password:await bcrypt.hash('dota',10),role:'superadmin',email:'admin@phethagatsa.co.za',name:'Ntwana Super Admin'},
  {username:'admin',password:await bcrypt.hash('admin123',10),role:'admin',email:'manager@phethagatsa.co.za',name:'Admin Manager'},
  {username:'editor',password:await bcrypt.hash('editor123',10),role:'editor',email:'editor@phethagatsa.co.za',name:'Content Editor'},
  {username:'viewer',password:await bcrypt.hash('viewer123',10),role:'viewer',email:'viewer@phethagatsa.co.za',name:'Demo Viewer'},
  {username:'marketing',password:await bcrypt.hash('market2024',10),role:'editor',email:'marketing@phethagatsa.co.za',name:'Marketing Team'},
 ]);
 console.log('✅ USERS SEEDED');
 await Settings.deleteMany({});
 await Settings.create({whatsappNumber:'27829564472',contactEmail:'info@phethagatsa.co.za',address:'Sandton, SA - Call/WhatsApp: +27 82 956 4472'});
 console.log('✅ SETTINGS SEEDED with WhatsApp: +27 82 956 4472');
 console.log('');
 console.log('Logins:');
 console.log('Superadmin: ntwana / dota - FULL ACCESS');
 console.log('Admin: admin / admin123');
 console.log('Editor: editor / editor123');
 console.log('Viewer: viewer / viewer123');
 console.log('Marketing: marketing / market2024');
 process.exit();
}
seed();
