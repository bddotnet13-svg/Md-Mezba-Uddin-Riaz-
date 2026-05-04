require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Client = require('./models/Client');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ 
      status: 'Active', 
      remainingDays: { $ne: 'Expired' } 
    });
    const expiredClients = await Client.countDocuments({ remainingDays: 'Expired' });
    
    const totalRevenue = await Client.aggregate([
      { $group: { _id: null, total: { $sum: '$monthlyBill' } } }
    ]);
    
    const packageStats = await Client.aggregate([
      { $group: { _id: '$package', count: { $sum: 1 }, revenue: { $sum: '$monthlyBill' } } }
    ]);
    
    const zoneStats = await Client.aggregate([
      { $group: { _id: '$zone', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalClients,
        activeClients,
        expiredClients,
        totalRevenue: totalRevenue[0]?.total || 0,
        packageStats,
        zoneStats
      }    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get All Clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ clientName: 1 });
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Client by Mobile
app.get('/api/client/:mobile', async (req, res) => {
  try {
    const mobile = req.params.mobile.replace(/\D/g, '');
    const client = await Client.findOne({ 
      mobile: { $regex: mobile.replace(/^(\+88|88)?0?/, ''), $options: 'i' } 
    });
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'ক্লায়েন্ট পাওয়া যায়নি' });
    }
    
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import Clients
app.post('/api/clients/import', async (req, res) => {
  try {
    const { clients } = req.body;
    
    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({ success: false, message: 'ভ্যালিড ডাটা প্রয়োজন' });
    }
    
    const processedClients = clients.map(c => ({
      srNo: c.SrNo?.toString(),
      idIp: c['ID/IP'],
      clientCode: c['C.Code']?.toString(),
      clientName: c['Client Name'],
      mobile: c.Mobile?.toString().replace(/\D/g, ''),
      roadNo: c['Road No'],      houseNo: c['House No'],
      nid: c.NID,
      zone: c.Zone,
      subZone: c['Sub Zone'],
      box: c.Box,
      address: c.Address,
      package: c.Package,
      server: c.Server,
      speed: c.Speed,
      expiryDate: c['Ex.Date'],
      password: c.Password,
      connType: c['Conn. Type'],
      clientType: c['Client Type'],
      monthlyBill: parseFloat(c['M.Bill']) || 0,
      macAddress: c.MACAddress,
      protocol: c.Protocol,
      status: c['B.Status'],
      joiningDate: c.ClientJoiningDate,
      remarks: c.Remarks,
      remainingDays: c.RemainingDays
    }));
    
    for (const client of processedClients) {
      await Client.findOneAndUpdate(
        { mobile: client.mobile },
        { ...client, updatedAt: new Date() },
        { upsert: true }
      );
    }
    
    res.json({ 
      success: true, 
      message: `${processedClients.length} ক্লায়েন্ট ইম্পোর্ট হয়েছে!`,
      count: processedClients.length 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Client
app.delete('/api/client/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'ক্লায়েন্ট ডিলিট হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
