import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () =>
            console.log('Connected to MongoDB'))
            await mongoose.connect(process.env.MONGODB_URI as string)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}


export default connectDB;