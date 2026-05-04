const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  srNo: String,
  idIp: { type: String, index: true },
  clientCode: String,
  clientName: { type: String, index: true },
  mobile: { type: String, index: true },
  roadNo: String,
  houseNo: String,
  nid: String,
  zone: String,
  subZone: String,
  box: String,
  address: String,
  package: String,
  server: String,
  speed: String,
  expiryDate: String,
  password: String,
  connType: String,
  clientType: String,
  monthlyBill: Number,
  macAddress: String,
  protocol: String,
  status: { type: String, default: 'Active' },
  joiningDate: String,
  remarks: String,
  remainingDays: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
