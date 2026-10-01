import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({email:String,password:String,role:{type:String,default:'customer'},orders:Array},{timestamps:true});
export default mongoose.models.User || mongoose.model('User',UserSchema);
