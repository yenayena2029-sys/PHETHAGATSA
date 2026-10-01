import mongoose from 'mongoose';
const OrderSchema = new mongoose.Schema({
 userEmail:String, products:Array, total:Number, delivery:{type:String,enum:['PAXI','COURIER'],default:'PAXI'}, paxiCode:String, payfastId:String, status:{type:String,default:'pending'}, address:Object
},{timestamps:true});
export default mongoose.models.Order || mongoose.model('Order',OrderSchema);
