import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
 name:String, price:Number, desc:String, image:String, stock:{type:Number,default:100}, category:String
},{timestamps:true});
export default mongoose.models.Product || mongoose.model('Product',ProductSchema);
