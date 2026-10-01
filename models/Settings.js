import mongoose from 'mongoose';
const SettingsSchema=new mongoose.Schema({
  whatsappNumber:{type:String,default:'27829564472'},
  contactEmail:{type:String,default:'info@phethagatsa.co.za'},
  address:String, payfast:Object, paxi:Object, banners:Array, socials:Object
},{strict:false,timestamps:true});
export default mongoose.models.Settings||mongoose.model('Settings',SettingsSchema);
